require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const groupRoutes = require('./routes/groupRoutes');
const memberRoutes = require('./routes/memberRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

connectDB();

const app = express();

// Configure CORS for production
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://godutch.vercel.app', // Your Vercel app URL
    /\.vercel\.app$/ // Allow all Vercel subdomains
  ],
  optionsSuccessStatus: 200
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
