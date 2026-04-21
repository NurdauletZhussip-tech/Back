require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const pool = require('./db');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT;
app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log(`Server running on port ${PORT}, DB connected`);
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
});