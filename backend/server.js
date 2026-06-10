const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const VerificationRequest = require('./models/VerificationRequest');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running smoothly.' });
});

// File Upload Routes
app.post('/api/upload/document', upload.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const documentUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ message: 'Document uploaded successfully', documentUrl });
});

app.post('/api/upload/selfie', upload.single('selfie'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const selfieUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ message: 'Selfie uploaded successfully', selfieUrl });
});

// AI Verification Route (Phase 3)
app.post('/api/verify', async (req, res) => {
    try {
        const { documentUrl, selfieUrl } = req.body;
        
        if (!documentUrl || !selfieUrl) {
            return res.status(400).json({ error: 'Missing document or selfie url' });
        }

        const docPath = path.join(__dirname, documentUrl);
        const selfiePath = path.join(__dirname, selfieUrl);
        
        if (!fs.existsSync(docPath) || !fs.existsSync(selfiePath)) {
            return res.status(400).json({ error: 'Uploaded files not found on server' });
        }
        
        const docBase64 = fs.readFileSync(docPath).toString('base64');
        const selfieBase64 = fs.readFileSync(selfiePath).toString('base64');
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are a STRICT forensic facial verification expert conducting KYC identity verification. Your job is to PREVENT identity fraud. You must be highly skeptical.

You are given two images:
IMAGE 1: A government-issued ID document (e.g., Aadhaar card, passport, driver's license).
IMAGE 2: A live selfie of a person taken via webcam.

TASK 1 - DATA EXTRACTION:
Extract from the ID document:
- Full Name
- Date of Birth (DOB)  
- ID Number (Aadhaar number, passport number, etc.)
If partially obscured, extract what you can.

TASK 2 - FORENSIC FACIAL COMPARISON:
START with the assumption that these are TWO DIFFERENT PEOPLE. Only change your conclusion if the evidence strongly proves otherwise.

Analyze each of these 8 facial features and note whether they MATCH or MISMATCH:
1. Eye shape and inter-ocular distance (ratio of eye spacing to face width)
2. Nose structure (bridge width, length, tip shape, nostril shape)
3. Jawline and chin (angular vs round vs pointed, chin cleft, jaw width)
4. Mouth and lip proportions (lip thickness, mouth width relative to nose)
5. Face shape and proportions (oval/round/square/heart, length-to-width ratio)
6. Eyebrow shape (arch height, thickness, spacing)
7. Cheekbone prominence and position
8. Forehead shape and hairline pattern

IMPORTANT ALLOWANCES (do NOT count these as mismatches):
- Different lighting, camera quality, image resolution, or webcam distortion
- Aging up to 10 years, weight gain/loss
- Glasses on/off, facial hair changes, different hairstyle
- Different facial expressions (smiling vs neutral)
- Skin tone differences caused by cameras

STRICT DECISION CRITERIA:
- If 6+ features clearly MATCH → Same person → "Approved" (score 85-100)
- If 4-5 features match → Uncertain → "Flagged" (score 60-84)
- If 3 or fewer features match → Different person → "Rejected" (score 0-59)
- When in doubt, choose "Flagged" or "Rejected", NEVER "Approved"

ANTI-FRAUD WARNING: Two people of the same gender, ethnicity, and age group can look superficially similar. Do NOT approve based on general resemblance alone. You must verify SPECIFIC structural features match.

Return ONLY a raw JSON object. No markdown, no backticks, no extra text:
{
  "extractedData": {
    "name": "extracted name",
    "dob": "extracted dob",
    "idNumber": "extracted ID number"
  },
  "reasoning": "Brief comparison: Eye spacing - MATCH/MISMATCH, Nose - MATCH/MISMATCH, Jaw - MATCH/MISMATCH, etc.",
  "featuresMatched": 5,
  "matchScore": 45,
  "status": "Rejected"
}`;
        
        console.log("Sending images to Gemini AI for verification...");
        
        // Retry logic for rate limits
        let resultText = null;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [
                        prompt,
                        { inlineData: { data: docBase64, mimeType: 'image/jpeg' } },
                        { inlineData: { data: selfieBase64, mimeType: 'image/jpeg' } }
                    ]
                });
                resultText = response.text.trim();
                break;
            } catch (apiError) {
                attempts++;
                if (apiError.status === 429 && attempts < maxAttempts) {
                    const waitTime = attempts * 10000; // 10s, 20s
                    console.log(`Rate limited. Retrying in ${waitTime/1000}s... (attempt ${attempts}/${maxAttempts})`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    throw apiError;
                }
            }
        }
        
        console.log("Raw AI response:", resultText);
        // Strip markdown code fences if present
        resultText = resultText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        
        const parsedData = JSON.parse(resultText);
        
        // Build the result record
        const record = {
            documentUrl,
            selfieUrl,
            extractedData: parsedData.extractedData,
            reasoning: parsedData.reasoning || '',
            featuresMatched: parsedData.featuresMatched,
            matchScore: parsedData.matchScore,
            status: parsedData.status,
            createdAt: new Date()
        };
        
        // Try to save to MongoDB (best-effort, don't block result)
        try {
            const verificationRecord = new VerificationRequest(record);
            await verificationRecord.save();
            record._id = verificationRecord._id;
            console.log("Verification saved to MongoDB:", record._id);
        } catch (dbError) {
            console.warn("MongoDB save failed (non-blocking):", dbError.message);
        }
        
        res.status(200).json({ success: true, record });
    } catch (error) {
        console.error("AI Verification Error:", error);
        res.status(500).json({ error: 'Verification failed', details: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
