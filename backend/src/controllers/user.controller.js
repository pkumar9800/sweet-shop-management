import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import Blacklist from '../models/blacklist.model.js';

const registerUser = async (req, res) => {
  try {
    const { fullname, username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User with this email or username already exists" });
    }

    const newUser = await User.create({
      fullname,
      username,
      email,
      password
    });

    res.status(201).json({ message: "User registered successfully",
      user: { id: newUser._id, fullname: newUser.fullname, username: newUser.username, email: newUser.email }
     });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // 1. Find user by Email OR Username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });

    // 2. Verify User existence & Password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Generate JWT Token
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

const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    
    // 1. Check if token exists
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    // 2. Add to Blacklist
    await Blacklist.create({ token });

    res.status(200).json({ message: 'Logged out successfully' });

  } catch (error) {
    if (error.code === 11000) {
        return res.status(200).json({ message: 'Logged out successfully' });
    }
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser
}