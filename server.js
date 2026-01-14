require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db'); // Test kết nối DB
// Game routes
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Để đọc body request jsonn
app.use('/api/games', gameRoutes);

// Route test kiểm tra connection DB
app.get('/api/test-db', async (req, res) => {
  try {
    const users = await db('users').select('*'); // Query thử bảng users
    res.json({ 
      message: 'Kết nối Database thành công!', 
      data: users 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});