import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
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
    const token = jwt.sign(
      { id: user._id, role: user.role || 'user' }, 
      process.env.JWT_SECRET || 'dev_secret', 
      { expiresIn: '1d' }
    );

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
