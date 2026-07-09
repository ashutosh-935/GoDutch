require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const groupRoutes = require('./routes/groupRoutes');
const memberRoutes = require('./routes/memberRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

connectDB();

const app = express();

// Allow any localhost port (dev) + Vercel (prod)
const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||                                   // same-origin / curl / Postman
      /^http:\/\/localhost:\d+$/.test(origin) ||  // any localhost port
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
      origin === 'https://godutch.vercel.app' ||
      /\.vercel\.app$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// API routes
app.use('/api/groups', groupRoutes);
app.use('/api/groups', memberRoutes);
app.use('/api/groups', expenseRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('GoDutch API is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
