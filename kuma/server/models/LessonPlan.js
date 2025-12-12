const mongoose = require('mongoose');

const LessonPlanSchema = new mongoose.Schema({
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
  learningObjectives: [String],
  introduction: String,
  lessonGoals: String,
  methods: String,
  mainPart: String,
  assessment: String,
  reflection: String,
  homework: String,
  duration: {
    type: Number,
    default: 45, // минут
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LessonPlan', LessonPlanSchema);
