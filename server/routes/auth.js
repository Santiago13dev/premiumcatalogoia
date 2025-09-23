import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { validateAuth } from '../middleware/validation.js';

const router = express.Router();

// Register
router.post('/register', validateAuth.register, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email or username'
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', validateAuth.login, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = user.generateAuthToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favorites', 'name type image');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences,
        favorites: user.favorites,
        stats: user.stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const updates = {
      profile: req.body.profile,
      preferences: req.body.preferences
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    );

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate API key
router.post('/api-key', authenticate, async (req, res) => {
  try {
    const { name } = req.body;

    const user = await User.findById(req.user.id);
    const apiKey = user.generateApiKey(name);
    await user.save();

    res.json({
      success: true,
      apiKey
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;