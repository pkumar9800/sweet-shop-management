import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Blacklist from '../models/blacklist.model.js';

// 1. Authenticate User (Verify Token & Check Blacklist)
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Invalid token format.' });

    // Check Blacklist
    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) return res.status(401).json({ message: 'Token expired or invalid.' });

    // Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    
    // Attach User to Request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found.' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// 2. Authorize Admin (Check Role)
export const isAdmin = (req, res, next) => {
  // req.user is already attached by 'authenticate' middleware
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};