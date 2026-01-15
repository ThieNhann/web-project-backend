require('dotenv').config();

const express = require('express');
const cors = require('cors');

const gameRoutes = require('./routes/gameRoutes');    // Game routes
const authRoutes = require('./routes/authRoutes')     // Auth routes

const { verifyToken } = require('./middleware/authMiddleware');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Để đọc body request jsonn

app.use('/api/games', gameRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('chạy ok');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});