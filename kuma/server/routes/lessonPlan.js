const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const LessonPlan = require('../models/LessonPlan');
const auth = require('../middleware/auth');

const router = express.Router();

// Google Gemini клиенті
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Сабақ жоспарын генерациялау
router.post('/generate', auth, async (req, res) => {
  try {
    const { subject, grade, topic, learningObjectives, duration } = req.body;

    const prompt = `
Сен Қазақстанның жоғары білікті мұғаліміссің. Келесі параметрлер бойынша ҚМЖ (қысқа мерзімді жоспар) жаса:

Пән: ${subject}
Сынып: ${grade}
Тақырып: ${topic}
Оқу мақсаттары: ${learningObjectives.join(', ')}
Ұзақтығы: ${duration} минут

ҚМЖ құрылымы:

1. КІРІСПЕ (5 минут)
- Оқушыларды сабаққа дайындау
- Мотивация
- Өткен тақырыппен байланыс

2. САБАҚТЫҢ МАҚСАТТАРЫ
- SMART принципі бойынша
- Оқушыларға түсінікті тілмен

3. ӘДІС-ТӘСІЛДЕР
- Белсенді оқыту әдістері
- Топтық/жұптық жұмыс
- Дифференциация

4. НЕГІЗГІ БӨЛІМ (25-30 минут)
- Жаңа материалды түсіндіру
- Практикалық тапсырмалар
- Оқушы белсенділігі

5. БАҒАЛАУ (5 минут)
- Формативті бағалау
- Критерийлер
- Кері байланыс

6. РЕФЛЕКСИЯ (3 минут)
- Не білдім? Не үйрендім?
- Эмоциялық рефлексия

7. ҮЙ ТАПСЫРМАСЫ (2 минут)
- Нақты тапсырма
- Дифференциацияланған

Педагогикалық талаптар:
- Bloom таксономиясы (L1-L6)
- Оқушы орталық оқыту
- Жас ерекшелігіне сәйкестік
`;

    // Gemini арқылы генерация немесе демо режимі
    let generatedContent;
    
    try {
      console.log('Gemini API шақыру басталды...');
      const result = await model.generateContent(prompt);
      generatedContent = result.response.text();
      console.log('Gemini жауап алынды!');
    } catch (apiError) {
      console.log('API қатесі, демо режимі қолданылады:', apiError.message);
      // Демо контент
      generatedContent = generateDemoLessonPlan(subject, grade, topic, learningObjectives, duration);
    }

    // Мәтінді бөліктерге бөлу
    const sections = parseGeneratedContent(generatedContent);

    // Деректер базасына сақтау
    const lessonPlan = new LessonPlan({
      userId: req.user.id,
      subject,
      grade,
      topic,
      learningObjectives,
      duration,
      ...sections,
    });

    await lessonPlan.save();

    res.json({ lessonPlan, rawContent: generatedContent });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Генерация қатесі', error: err.message });
  }
});

// Генерацияланған мәтінді бөліктерге бөлу
function parseGeneratedContent(content) {
  return {
    introduction: extractSection(content, 'КІРІСПЕ', 'САБАҚТЫҢ МАҚСАТТАРЫ'),
    lessonGoals: extractSection(content, 'САБАҚТЫҢ МАҚСАТТАРЫ', 'ӘДІС-ТӘСІЛДЕР'),
    methods: extractSection(content, 'ӘДІС-ТӘСІЛДЕР', 'НЕГІЗГІ БӨЛІМ'),
    mainPart: extractSection(content, 'НЕГІЗГІ БӨЛІМ', 'БАҒАЛАУ'),
    assessment: extractSection(content, 'БАҒАЛАУ', 'РЕФЛЕКСИЯ'),
    reflection: extractSection(content, 'РЕФЛЕКСИЯ', 'ҮЙ ТАПСЫРМАСЫ'),
    homework: extractSection(content, 'ҮЙ ТАПСЫРМАСЫ'),
  };
}

function extractSection(content, startMarker, endMarker = null) {
  const startRegex = new RegExp(`${startMarker}[\\s\\S]*?(?=\\n)`, 'i');
  const startMatch = content.match(startRegex);
  
  if (!startMatch) return '';

  const startIndex = content.indexOf(startMatch[0]) + startMatch[0].length;
  const endIndex = endMarker 
    ? content.indexOf(endMarker, startIndex)
    : content.length;

  return content.substring(startIndex, endIndex > -1 ? endIndex : content.length).trim();
}

// Демо сабақ жоспары генерациясы
function generateDemoLessonPlan(subject, grade, topic, learningObjectives, duration) {
  return `КІРІСПЕ (5 минут)
Сәлемдесу және оқушылардың сабаққа дайындығын тексеру.
"${topic}" тақырыбына кіріспе жасау.
Өткен сабақпен байланыс орнату: алдыңғы тақырыптан негізгі түсініктерді еске түсіру.
Мотивация: тақырыптың өмірдегі маңыздылығын түсіндіру.

САБАҚТЫҢ МАҚСАТТАРЫ
Білімділік мақсаты:
- ${learningObjectives[0] || 'Тақырып бойынша негізгі ұғымдарды меңгеру'}
- ${learningObjectives[1] || 'Теориялық білімді практикада қолдану'}

Дамытушылық мақсаты:
- Сыни ойлау дағдыларын дамыту
- Ақпаратты талдау және жүйелеу қабілетін арттыру

Тәрбиелік мақсаты:
- Топта жұмыс істеу мәдениетін қалыптастыру
- Өзіндік жұмыс дағдыларын дамыту

ӘДІС-ТӘСІЛДЕР
Оқыту әдістері:
- Интерактивті әдіс (сұрақ-жауап)
- Топтық жұмыс (4-5 адамнан)
- Жұптық талқылау
- Практикалық тапсырмалар

Дифференциация:
- Төмен деңгей: үлгі бойынша тапсырма
- Орта деңгей: стандартты тапсырма
- Жоғары деңгей: шығармашылық тапсырма

НЕГІЗГІ БӨЛІМ (${duration - 15} минут)
1. Жаңа материалды түсіндіру (15 мин)
   - "${topic}" тақырыбының негізгі ұғымдары
   - Визуалды материалдар көрсету
   - Мысалдар келтіру

2. Топтық тапсырма (10 мин)
   - Оқушыларды топқа бөлу
   - Әр топқа тапсырма беру
   - Мұғалімнің бақылауы мен көмегі

3. Презентация және талқылау (10 мин)
   - Топтардың жұмысын көрсету
   - Сұрақтар мен жауаптар
   - Қорытынды жасау

БАҒАЛАУ (5 минут)
Формативті бағалау:
- Бас бармақ әдісі (түсіндім/түсінбедім)
- Өзін-өзі бағалау парағы

Дескрипторлар:
- Тақырыпты толық түсінеді - 3 балл
- Негізгі ұғымдарды біледі - 2 балл
- Қосымша көмек қажет - 1 балл

РЕФЛЕКСИЯ (3 минут)
"Бүгін мен не білдім?" - оқушылар жауап жазады
"Маған не қиын болды?" - қиындықтарды талқылау
"Келесі сабақта нені білгім келеді?" - болашаққа жоспар

ҮЙ ТАПСЫРМАСЫ (2 минут)
Негізгі деңгей:
- Оқулықтан ${topic} тақырыбын оқу
- 5 сұраққа жауап жазу

Қосымша тапсырма (қалауы бойынша):
- Тақырып бойынша постер дайындау
- Қосымша мысалдар табу`;
}

// Пайдаланушының барлық жоспарларын алу
router.get('/my-plans', auth, async (req, res) => {
  try {
    const lessonPlans = await LessonPlan.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(lessonPlans);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Сервер қатесі');
  }
});

// Жоспарды ID бойынша алу
router.get('/:id', auth, async (req, res) => {
  try {
    const lessonPlan = await LessonPlan.findById(req.params.id);
    
    if (!lessonPlan) {
      return res.status(404).json({ message: 'Жоспар табылмады' });
    }

    // Тек өз жоспарын көре алады
    if (lessonPlan.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Қатынау құқығы жоқ' });
    }

    res.json(lessonPlan);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Сервер қатесі');
  }
});

module.exports = router;
