// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      walletBalance: 50000 // Default wallet amount
    });
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '30d'
    });
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      walletBalance: user.walletBalance,
      phoneNumber: user.phoneNumber,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: '30d'
    });
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      walletBalance: user.walletBalance,
      phoneNumber: user.phoneNumber,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getWalletBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateWalletBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.walletBalance = amount;
    await user.save();
    
    res.json({ walletBalance: user.walletBalance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};