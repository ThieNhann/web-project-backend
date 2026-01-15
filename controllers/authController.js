const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// ĐĂNG KÝ
const register = async (req, res) => {
  // Check validation từ route gửi sang
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, password, full_name } = req.body;

  try {
    // check trùng username
    const existingUser = await db('users').where({ username }).first();
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already existed.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert DB
    const [newUser] = await db('users').insert({
      username,
      password: hashedPassword,
      full_name,
      role: 'user' //default
    }).returning(['id', 'username', 'full_name', 'role']);

    res.status(201).json({ success: true, message: 'Registered successfully.', user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// ĐĂNG NHẬP
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Tìm user
    const user = await db('users').where({ username }).first();
    if (!user) {
      console.log(">>> Debug: User not found in DB");
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    console.log(">>> Debug: User found:", user.username);
    console.log(">>> Debug: Hashed Pass in DB:", user.password);

    // So sánh pass
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(">>> Debug: Password Match:", isMatch);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    // JWT Token
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// 3. GET ME
const getMe = async (req, res) => {
  try {
    // req.user.id được authMiddleware gắn lên req
    const user = await db('users').where({ id: req.user.id }).first();
    
    if (!user) return res.status(404).json({ message: 'Non-existent user.' });

    // Loại bỏ password!!!
    const { password, ...userInfo } = user;
    res.json({ success: true, user: userInfo });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  const { full_name, bio, avatar_url } = req.body;
  try {
    const [updatedUser] = await db('users')
      .where({ id: req.user.id })
      .update({ full_name, bio, avatar_url, updated_at: new Date() })
      .returning(['id', 'username', 'full_name', 'bio', 'avatar_url']);

    res.json({ success: true, message: 'Updated successfully.', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
};

module.exports = { register, login, getMe, updateProfile };