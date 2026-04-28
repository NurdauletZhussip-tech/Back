// index.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const { swaggerUi, specs } = require('./swagger');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Rate limiting (бонус)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);

// Важно для фронтенда — добавляем поддержку /api/parents/children
app.use('/api/parents', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Children Literacy Platform Backend is running' 
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  try {
    const pool = require('./db');
    await pool.query('SELECT 1');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Database connected successfully`);
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
});