const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  answers: [{
    questionId: String,
    answer: String,
    isCorrect: Boolean,
    points: Number,
  }],
  fileUrl: String, // эссе немесе тапсырма файлы
  totalScore: Number,
  maxScore: Number,
  feedback: String,
  aiAnalysis: {
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
  },
  gradedBy: {
    type: String,
    enum: ['ai', 'teacher', 'hybrid'],
    default: 'ai',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  gradedAt: Date,
});

module.exports = mongoose.model('Submission', SubmissionSchema);
