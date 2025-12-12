const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Assessment = require('../models/Assessment');
const auth = require('../middleware/auth');

const router = express.Router();

// Google Gemini клиенті
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Бағалау тапсырмасын генерациялау
router.post('/generate', auth, async (req, res) => {
  try {
    const { subject, grade, topic, type, questionCount = 10 } = req.body;

    let prompt = '';

    if (type === 'test') {
      prompt = `
Сен Қазақстанның білікті мұғаліміссің. Келесі параметрлер бойынша ТЕСТ тапсырмасын жаса:

Пән: ${subject}
Сынып: ${grade}
Тақырып: ${topic}
Сұрақ саны: ${questionCount}

ТАЛАПТАР:
1. Bloom таксономиясы бойынша әр түрлі деңгей:
   - L1-L2 (Білу, Түсіну): 40%
   - L3-L4 (Қолдану, Талдау): 40%
   - L5-L6 (Синтез, Бағалау): 20%

2. Әр сұраққа:
   - 4 нұсқа (A, B, C, D)
   - 1 дұрыс жауап
   - Bloom деңгейі
   - Балл

3. Сұрақтар жас ерекшелігіне сәйкес
4. Қазақ тілінде, түсінікті

JSON форматында қайтар:
{
  "questions": [
    {
      "question": "Сұрақ мәтіні",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": "A",
      "bloomLevel": "L1",
      "points": 1
    }
  ]
}
`;
    } else if (type === 'descriptor') {
      prompt = `
Сен Қазақстанның білікті мұғаліміссің. Келесі параметрлер бойынша ДЕСКРИПТОРЛЫҚ ТАПСЫРМА жаса:

Пән: ${subject}
Сынып: ${grade}
Тақырып: ${topic}

ТАЛАПТАР:
1. 3-5 тапсырма (төмен, орта, жоғары деңгей)
2. Әр тапсырмаға нақты дескрипторлар
3. Бағалау критерийлері
4. SMART мақсаттарға сәйкес

JSON форматында қайтар:
{
  "tasks": [
    {
      "task": "Тапсырма мәтіні",
      "level": "low/medium/high",
      "descriptors": ["Дескриптор 1", "Дескриптор 2"],
      "points": 5
    }
  ],
  "criteria": "Жалпы бағалау критерийлері"
}
`;
    }

    let generatedContent;
    let parsedData;
    
    try {
      console.log('Gemini API шақыру басталды...');
      const result = await model.generateContent(prompt + '\n\nJSON форматында жауап бер.');
      generatedContent = result.response.text();
      console.log('Gemini жауап алынды!');
      
      // JSON-ды парсинг
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : generatedContent);
    } catch (apiError) {
      console.log('API қатесі, демо режимі қолданылады:', apiError.message);
      // Демо контент
      if (type === 'test') {
        parsedData = generateDemoTest(subject, grade, topic, questionCount);
      } else {
        parsedData = generateDemoDescriptor(subject, grade, topic);
      }
      generatedContent = JSON.stringify(parsedData, null, 2);
    }

    // Деректер базасына сақтау
    const assessment = new Assessment({
      userId: req.user.id,
      subject,
      grade,
      topic,
      type,
      questions: parsedData.questions || parsedData.tasks || [],
      descriptors: parsedData.tasks ? parsedData.tasks.flatMap(t => t.descriptors) : [],
      criteria: parsedData.criteria || '',
      totalPoints: calculateTotalPoints(parsedData),
    });

    await assessment.save();

    res.json({ assessment, rawContent: generatedContent });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Генерация қатесі', error: err.message });
  }
});

function calculateTotalPoints(data) {
  if (data.questions) {
    return data.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  }
  if (data.tasks) {
    return data.tasks.reduce((sum, t) => sum + (t.points || 0), 0);
  }
  return 0;
}

// Демо тест генерациясы
function generateDemoTest(subject, grade, topic, questionCount) {
  const questions = [];
  const bloomLevels = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
  
  for (let i = 1; i <= Math.min(questionCount, 10); i++) {
    const level = bloomLevels[Math.min(Math.floor((i - 1) / 2), 5)];
    questions.push({
      question: `${topic} тақырыбы бойынша ${i}-сұрақ: ${getQuestionByLevel(level, topic, i)}`,
      options: [
        `A) Бірінші нұсқа - ${topic} туралы`,
        `B) Екінші нұсқа - ${topic} туралы`,
        `C) Үшінші нұсқа - ${topic} туралы`,
        `D) Төртінші нұсқа - ${topic} туралы`
      ],
      correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      bloomLevel: level,
      points: level === 'L1' || level === 'L2' ? 1 : level === 'L3' || level === 'L4' ? 2 : 3
    });
  }
  
  return { questions };
}

function getQuestionByLevel(level, topic, num) {
  const templates = {
    'L1': `"${topic}" ұғымының анықтамасы қандай?`,
    'L2': `"${topic}" тақырыбындағы негізгі идеяны түсіндіріңіз`,
    'L3': `"${topic}" білімін практикада қалай қолданасыз?`,
    'L4': `"${topic}" тақырыбындағы ақпаратты талдаңыз`,
    'L5': `"${topic}" бойынша өз ойыңызды қорытындылаңыз`,
    'L6': `"${topic}" тақырыбын бағалап, пікір білдіріңіз`
  };
  return templates[level] || `${topic} туралы сұрақ №${num}`;
}

// Демо дескриптор генерациясы
function generateDemoDescriptor(subject, grade, topic) {
  return {
    tasks: [
      {
        task: `"${topic}" тақырыбы бойынша негізгі ұғымдарды анықтаңыз`,
        level: 'low',
        descriptors: [
          'Негізгі терминдерді дұрыс жазады',
          'Анықтамаларды дәл келтіреді',
          'Мысалдар келтіреді'
        ],
        points: 3
      },
      {
        task: `"${topic}" тақырыбы бойынша салыстырмалы талдау жасаңыз`,
        level: 'medium',
        descriptors: [
          'Ұқсастықтар мен айырмашылықтарды анықтайды',
          'Кестеде дұрыс көрсетеді',
          'Қорытынды жасайды'
        ],
        points: 5
      },
      {
        task: `"${topic}" тақырыбы бойынша шығармашылық жұмыс жазыңыз`,
        level: 'high',
        descriptors: [
          'Өз ойын дәлелдермен негіздейді',
          'Шығармашылық тәсілдер қолданады',
          'Жаңа идеялар ұсынады',
          'Логикалық байланыс сақталған'
        ],
        points: 7
      }
    ],
    criteria: `${subject} пәні, ${grade} сынып. "${topic}" тақырыбы бойынша бағалау критерийлері: толықтық, дәлдік, шығармашылық.`
  };
}

// Пайдаланушының барлық тапсырмаларын алу
router.get('/my-assessments', auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(assessments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Сервер қатесі');
  }
});

// Тапсырманы ID бойынша алу
router.get('/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Тапсырма табылмады' });
    }

    if (assessment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Қатынау құқығы жоқ' });
    }

    res.json(assessment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Сервер қатесі');
  }
});

module.exports = router;
