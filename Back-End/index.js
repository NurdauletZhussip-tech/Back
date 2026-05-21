require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const { apiLimiter, authUserLimiter } = require('./middleware/rateLimiters');
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authUserLimiter);
app.use('/api/lessons', apiLimiter);
app.use('/api/admin', apiLimiter);
app.use('/api/badges', apiLimiter);
app.use('/api/leaderboard', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/parents', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Children Literacy Platform Backend is running' 
  });
});

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  try {
    const pool = require('./db');
    await pool.query('SELECT 1');
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Database connected successfully`);
  } catch (err) {
    console.error(' DB connection failed:', err.message);
    process.exit(1);
  }
});
