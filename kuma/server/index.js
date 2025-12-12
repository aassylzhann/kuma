const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('server/public'));

// MongoDB байланысы
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edu_platform')
.then(() => console.log('✅ MongoDB қосылды'))
.catch((err) => console.error('❌ MongoDB қате:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lesson-plan', require('./routes/lessonPlan'));
app.use('/api/assessment', require('./routes/assessment'));
app.use('/api/grading', require('./routes/grading'));

// Негізгі route
app.get('/', (req, res) => {
  res.json({ message: 'Білім беру платформасы API' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Сервер іске қосылды: http://localhost:${PORT}`);
});
