require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many auth requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);
app.use('/api/lessons', limiter);
app.use('/api/admin', limiter);
app.use('/api/badges', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/parents', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/admin', adminRoutes);

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
