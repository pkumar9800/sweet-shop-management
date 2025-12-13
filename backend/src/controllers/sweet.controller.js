import Sweet from '../models/sweet.model.js';
import { uploadImage } from '../utils/cloudinary.js';

export const addSweet = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;

    // 1. Validation
    if (!name || !category || !price || !quantity) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let imageUrl = '';

    // 2. Handle Image Upload (If file exists)
    if (req.file) {
        try {
            imageUrl = await uploadImage(req.file.buffer);
        } catch (uploadError) {
            console.error("Cloudinary Error:", uploadError);
            return res.status(500).json({ message: 'Image upload failed' });
        }
    }

    // 3. Create Sweet
    const sweet = await Sweet.create({
      name,
      category,
      price,
      quantity,
      imageUrl // Save the URL string to MongoDB
    });

    res.status(201).json(sweet);

  } catch (error) {
    console.error('Add Sweet Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};