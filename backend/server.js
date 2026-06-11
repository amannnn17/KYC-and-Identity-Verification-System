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
        const { documentUrl, selfieUrl, mlMatchScore, mlDistance } = req.body;
        
        if (!documentUrl || !selfieUrl) {
            return res.status(400).json({ error: 'Missing document or selfie url' });
        }

        const docPath = path.join(__dirname, documentUrl);
        
        if (!fs.existsSync(docPath)) {
            return res.status(400).json({ error: 'Uploaded files not found on server' });
        }
        
        const docBase64 = fs.readFileSync(docPath).toString('base64');
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are a strict data extraction tool for KYC identity verification.
You are given an image of a government-issued ID document (e.g., Aadhaar card, passport, driver's license).

TASK - DATA EXTRACTION:
Extract the following exact details from the document:
- Full Name
- Date of Birth (DOB)  
- ID Number (Aadhaar number, passport number, etc.)

If partially obscured, extract what you can. Do NOT hallucinate data not visible in the document.

Return ONLY a raw JSON object. No markdown, no backticks, no extra text:
{
  "extractedData": {
    "name": "extracted name",
    "dob": "extracted dob",
    "idNumber": "extracted ID number"
  }
}`;
        
        console.log("Sending document to Gemini AI for OCR...");
        
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
                        { inlineData: { data: docBase64, mimeType: 'image/jpeg' } }
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
        
        // Build the result record using Gemini for OCR and frontend ML for biometric matching
        let finalStatus = 'Flagged';
        if (mlMatchScore >= 85) finalStatus = 'Approved';
        else if (mlMatchScore < 60) finalStatus = 'Rejected';

        const record = {
            documentUrl,
            selfieUrl,
            extractedData: parsedData.extractedData,
            reasoning: `Automated ML Biometric Check: Euclidean Distance ${mlDistance.toFixed(4)}`,
            featuresMatched: 8, // face-api uses 128 point descriptor, we can just hardcode or omit
            matchScore: mlMatchScore,
            status: finalStatus,
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

// Admin Routes (Phase 4)
app.get('/api/admin/submissions', async (req, res) => {
    try {
        const submissions = await VerificationRequest.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, submissions });
    } catch (error) {
        console.error("Fetch Submissions Error:", error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

app.get('/api/admin/submissions/:id', async (req, res) => {
    try {
        const submission = await VerificationRequest.findById(req.params.id);
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        res.status(200).json({ success: true, submission });
    } catch (error) {
        console.error("Fetch Submission Error:", error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
});

app.put('/api/admin/submissions/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Approved', 'Rejected', 'Flagged', 'Pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const submission = await VerificationRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        res.status(200).json({ success: true, submission });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
