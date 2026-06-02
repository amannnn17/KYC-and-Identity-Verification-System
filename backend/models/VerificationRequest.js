const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Flagged'], default: 'Pending' },
    documentUrl: { type: String, required: false },
    selfieUrl: { type: String, required: false },
    extractedData: {
        name: { type: String },
        dob: { type: String },
        idNumber: { type: String }
    },
    matchScore: { type: mongoose.Schema.Types.Mixed }, // Can be a confidence number or a qualitative string
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VerificationRequest', verificationRequestSchema);
