import User from '../models/User';
import bcrypt from 'bcrypt';

const seedAdmin = async () => {
  try {
    // 1. Check if an admin already exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('Admin account already exists.');
      return;
    }

    // 2. If not, create the single admin
    const adminUser = new User({
      fullname: process.env.ADMIN_FULLNAME,
      username: process.env.ADMIN_USERNAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    });
    await adminUser.save();

    console.log('Admin account created successfully.');
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

export default seedAdmin;