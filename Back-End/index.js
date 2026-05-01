require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/admin', adminRoutes);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);

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