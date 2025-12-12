const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  grade: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['formative', 'summative', 'test', 'open-question', 'descriptor'],
    required: true,
  },
  questions: [{
    question: String,
    type: String, // multiple-choice, short-answer, essay
    options: [String], // тест үшін
    correctAnswer: String,
    bloomLevel: {
      type: String,
      enum: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'],
    },
    points: Number,
  }],
  descriptors: [String],
  criteria: String,
  totalPoints: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
