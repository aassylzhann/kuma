const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Submission = require('../models/Submission');
const Assessment = require('../models/Assessment');
const auth = require('../middleware/auth');

const router = express.Router();

// Google Gemini клиенті
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Оқушы жұмысын тексеру
router.post('/check', auth, async (req, res) => {
  try {
    const { assessmentId, studentName, answers, essayText } = req.body;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Тапсырма табылмады' });
    }

    let gradedAnswers = [];
    let totalScore = 0;
    let feedback = '';

    if (assessment.type === 'test') {
      // Тестті автоматты тексеру
      gradedAnswers = answers.map((ans, index) => {
        const question = assessment.questions[index];
        const isCorrect = ans.answer === question.correctAnswer;
        const points = isCorrect ? (question.points || 1) : 0;
        totalScore += points;

        return {
          questionId: question._id,
          answer: ans.answer,
          isCorrect,
          points,
        };
      });

      feedback = `Сіз ${assessment.questions.length} сұрақтың ${gradedAnswers.filter(a => a.isCorrect).length} дұрыс жауап бердіңіз.`;

    } else if (essayText) {
      // Эссені AI арқылы тексеру
      const prompt = `
Сен Қазақстанның білікті мұғаліміссің. Оқушы эссесін тексеріп, бағала.

ТАПСЫРМА:
Пән: ${assessment.subject}
Тақырып: ${assessment.topic}
Критерийлер: ${assessment.criteria}

ОҚУШЫ ЖАУАБЫ:
${essayText}

ТЕКСЕРУ КРИТЕРИЙЛЕРІ:
1. Мазмұн (40%)
2. Құрылым (20%)
3. Тіл сауаттылығы (20%)
4. Шығармашылық (20%)

JSON форматында қайтар:
{
  "score": 0-100,
  "strengths": ["Күшті жақтары"],
  "weaknesses": ["Әлсіз жақтары"],
  "suggestions": ["Жақсарту ұсыныстары"],
  "feedback": "Жалпы кері байланыс"
}
`;

      let result;
      try {
        console.log('Gemini API шақыру басталды...');
        const geminiResult = await model.generateContent(prompt + '\n\nJSON форматында жауап бер.');
        const generatedText = geminiResult.response.text();
        console.log('Gemini жауап алынды!');
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        result = JSON.parse(jsonMatch ? jsonMatch[0] : generatedText);
      } catch (apiError) {
        console.log('API қатесі, демо режимі қолданылады:', apiError.message);
        // Демо бағалау
        result = generateDemoGrading(essayText, assessment.topic);
      }
      
      totalScore = result.score;
      feedback = result.feedback;

      const submission = new Submission({
        assessmentId,
        studentName,
        answers: gradedAnswers,
        totalScore,
        maxScore: assessment.totalPoints || 100,
        feedback,
        aiAnalysis: {
          strengths: result.strengths,
          weaknesses: result.weaknesses,
          suggestions: result.suggestions,
        },
        gradedBy: 'ai',
        gradedAt: new Date(),
      });

      await submission.save();

      return res.json({ submission });
    }

    // Тест үшін submission жасау
    const submission = new Submission({
      assessmentId,
      studentName,
      answers: gradedAnswers,
      totalScore,
      maxScore: assessment.totalPoints,
      feedback,
      gradedBy: 'ai',
      gradedAt: new Date(),
    });

    await submission.save();

    res.json({ submission });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Тексеру қатесі', error: err.message });
  }
});

// Демо бағалау генерациясы
function generateDemoGrading(essayText, topic) {
  const wordCount = essayText.split(/\s+/).length;
  const hasStructure = essayText.includes('\n') || essayText.length > 200;
  const mentionsTopic = essayText.toLowerCase().includes(topic.toLowerCase());
  
  // Балл есептеу
  let score = 50; // Базалық балл
  if (wordCount > 100) score += 10;
  if (wordCount > 200) score += 10;
  if (hasStructure) score += 10;
  if (mentionsTopic) score += 15;
  if (wordCount > 300) score += 5;
  
  score = Math.min(score, 95); // Максимум 95
  
  return {
    score: score,
    strengths: [
      mentionsTopic ? 'Тақырыпты дұрыс ашқан' : 'Жұмысты аяқтаған',
      wordCount > 150 ? 'Жеткілікті көлемде жазған' : 'Негізгі ойларды білдірген',
      hasStructure ? 'Құрылымы бар' : 'Ойын жеткізген'
    ],
    weaknesses: [
      wordCount < 150 ? 'Көлемін ұлғайту керек' : null,
      !mentionsTopic ? 'Тақырыпты толық ашу керек' : null,
      'Мысалдар көбірек келтіру керек'
    ].filter(Boolean),
    suggestions: [
      'Қосымша дәлелдер келтіріңіз',
      'Қорытынды бөлімін күшейтіңіз',
      'Тақырыпты тереңірек талдаңыз'
    ],
    feedback: `Жұмыс ${score >= 70 ? 'жақсы' : score >= 50 ? 'қанағаттанарлық' : 'жетілдіруді қажет етеді'} деңгейде орындалған. "${topic}" тақырыбы ${mentionsTopic ? 'қарастырылған' : 'толық ашылмаған'}. Жалпы ${wordCount} сөз жазылған.`
  };
}

// Барлық тапсырыс нәтижелерін алу
router.get('/results/:assessmentId', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      assessmentId: req.params.assessmentId 
    }).sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Сервер қатесі');
  }
});

// Нақты оқушының нәтижесін алу
router.get('/result/:id', auth, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assessmentId');

    if (!submission) {
      return res.status(404).json({ message: 'Нәтиже табылмады' });
    }

    res.json(submission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Сервер қатесі');
  }
});

module.exports = router;
