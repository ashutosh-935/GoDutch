require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const groupRoutes = require('./routes/groupRoutes');
const memberRoutes = require('./routes/memberRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/groups', groupRoutes);
app.use('/api/groups', memberRoutes);
app.use('/api/groups', expenseRoutes);

app.get('/', (req, res) => {
  res.send('GoDutch API is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
