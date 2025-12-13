import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import Blacklist from '../models/blacklist.model.js';

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email or username already exists" });
    }

    const newUser = await User.create({
      username,
      email,
      password
    });

    res.status(201).json({ message: "User registered successfully",
      user: { id: newUser._id, username: newUser.username, email: newUser.email }
     });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // 1. Find user by Email OR Username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    // 2. Verify User existence & Password
    // We use a generic message to prevent user enumeration
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT Token
    // In a real app, use process.env.JWT_SECRET
    const token = user.generateAccessToken();

    // 4. Send Response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    
    // 1. Check if token exists
    if (!authHeader) {
      // If we are strictly secure, we expect a token to blacklist.
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Remove "Bearer " prefix

    if (!token) {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    // 2. Add to Blacklist
    // We use .create which will throw if duplicate, so we catch errors
    await Blacklist.create({ token });

    res.status(200).json({ message: 'Logged out successfully' });

  } catch (error) {
    // If token is already blacklisted (duplicate key error 11000), 
    // we still consider them logged out.
    if (error.code === 11000) {
        return res.status(200).json({ message: 'Logged out successfully' });
    }
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
