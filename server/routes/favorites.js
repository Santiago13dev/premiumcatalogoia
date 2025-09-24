import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import Component from '../models/Component.js';

const router = express.Router();

// Get user favorites
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favorites', 'name type description image tags');
    
    res.json({
      favorites: user.favorites || []
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add to favorites
router.post('/:componentId', authenticate, async (req, res) => {
  try {
    const { componentId } = req.params;
    
    // Check if component exists
    const component = await Component.findById(componentId);
    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }
    
    // Add to favorites if not already there
    const user = await User.findById(req.user.id);
    
    if (!user.favorites.includes(componentId)) {
      user.favorites.push(componentId);
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Added to favorites'
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove from favorites
router.delete('/:componentId', authenticate, async (req, res) => {
  try {
    const { componentId } = req.params;
    
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(
      favId => favId.toString() !== componentId
    );
    await user.save();
    
    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Check if component is in favorites
router.get('/check/:componentId', authenticate, async (req, res) => {
  try {
    const { componentId } = req.params;
    
    const user = await User.findById(req.user.id);
    const isFavorite = user.favorites.includes(componentId);
    
    res.json({ isFavorite });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

export default router;