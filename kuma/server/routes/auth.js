const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Тіркелу
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, subject, school } = req.body;

    // Пайдаланушы бар ма тексеру
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Бұл email тіркелген' });
    }

    // Парольді хэштеу
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Жаңа пайдаланушы
    user = new User({
      name,
      email,
      password: hashedPassword,
      subject,
      school,
    });

    await user.save();

    // JWT Token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Сервер қатесі');
  }
});

// Кіру
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Пайдаланушыны тексеру
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Қате email немесе пароль' });
    }

    // Парольді тексеру
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Қате email немесе пароль' });
    }

    // JWT Token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Сервер қатесі');
  }
});

module.exports = router;
