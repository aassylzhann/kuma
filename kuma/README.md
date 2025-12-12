=# Образовательная платформа для учителей Казахстана

Платформа для автоматического создания планов уроков (КМЖ), оценочных заданий и проверки работ учащихся с использованием ИИ.

## Возможности

- **Генератор планов уроков (КМЖ)** - автоматическое создание краткосрочных планов по стандартам Казахстана
- **Генератор оценочных заданий** - создание тестов и дескрипторных заданий по таксономии Блума
- **Автопроверка работ** - проверка тестов и эссе с обратной связью

## Технологии

- Frontend: Next.js 14, React, Tailwind CSS
- Backend: Node.js, Express
- База данных: MongoDB
- ИИ: Google Gemini API (с демо-режимом при недоступности API)

## Требования

- Node.js 18+
- MongoDB (локальный или Atlas)
- npm или yarn

## Установка и запуск

### 1. Клонирование и установка зависимостей

```bash
cd kuma
npm install
```

### 2. Настройка переменных окружения

Файл `.env` уже создан. При необходимости измените:

```env
# Google Gemini API (опционально - есть демо-режим)
GEMINI_API_KEY=ваш_ключ_api

# MongoDB
MONGODB_URI=mongodb://localhost:27017/edu_platform

# JWT секрет
JWT_SECRET=ваш_секретный_ключ

# Порт сервера
PORT=5001
```

### 3. Запуск MongoDB

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
```bash
net start MongoDB
```

### 4. Запуск серверов

**Терминал 1 - Backend сервер:**
```bash
node server/index.js
```
Сервер запустится на http://localhost:5001

**Терминал 2 - Frontend сервер:**
```bash
npm run dev
```
Приложение откроется на http://localhost:3000

### 5. Использование

1. Откройте http://localhost:3000
2. Зарегистрируйтесь или войдите в систему
3. Выберите нужный модуль:
   - **План урока** - создание КМЖ
   - **Оценивание** - создание тестов и заданий
   - **Проверка** - проверка работ учащихся

## Структура проекта

```
kuma/
├── pages/              # Next.js страницы
│   ├── index.js        # Главная страница
│   ├── login.js        # Вход
│   ├── register.js     # Регистрация
│   ├── lesson-plan.js  # Генератор планов
│   ├── assessment.js   # Генератор заданий
│   └── grading.js      # Проверка работ
├── server/
│   ├── index.js        # Express сервер
│   ├── routes/         # API маршруты
│   │   ├── auth.js
│   │   ├── lessonPlan.js
│   │   ├── assessment.js
│   │   └── grading.js
│   ├── models/         # Mongoose модели
│   └── middleware/     # Middleware (auth)
├── styles/
│   └── globals.css     # Глобальные стили
├── .env                # Переменные окружения
└── package.json
```

## Демо-режим

Если API ключ недоступен или превышен лимит запросов, система автоматически переключается на демо-режим с заранее подготовленным контентом.

## Решение проблем

**MongoDB не запускается:**
```bash
# Проверить статус
brew services list | grep mongodb

# Перезапустить
brew services restart mongodb-community
```

**Порт занят:**
```bash
# Найти процесс и остановить
lsof -ti:5001 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

**Ошибка API:**
- Проверьте ключ API в файле .env
- Система автоматически использует демо-режим

## Быстрый старт (одной командой)

```bash
# Установить зависимости и запустить
npm install && npm run dev
```

В другом терминале:
```bash
node server/index.js
```

## Лицензия

MIT
