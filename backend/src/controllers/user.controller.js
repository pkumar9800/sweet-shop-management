import User from "../models/user.model.js";

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
