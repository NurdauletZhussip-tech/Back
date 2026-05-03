require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const badgeRoutes = require('./routes/badgeRoutes');
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use('/api/admin', adminRoutes);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,                    
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
app.use('/api/lessons', limiter);
app.use('/api/admin', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/badges', badgeRoutes);

// centralized error handler (must be after routes)
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.use('/api/parents', authRoutes);

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Children Literacy Platform Backend is running' 
  });
});

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