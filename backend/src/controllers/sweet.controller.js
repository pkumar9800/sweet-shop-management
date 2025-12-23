import Sweet from '../models/sweet.model.js';
import { uploadImage } from '../utils/cloudinary.js';

const addSweet = async (req, res) => {
  try {
    const { name, category, price, quantity, discount } = req.body;

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
      discount: discount || 0,
      imageUrl
    });

    res.status(201).json(sweet);

  } catch (error) {
    console.error('Add Sweet Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const getAllSweets = async (req, res) => {
  try {
    // 1. Destructure Query Parameters
    const { page = 1, limit = 10, search, category, minPrice, maxPrice } = req.query;

    // 2. Build the MongoDB Query Object
    const query = {};

    // Search by Name (Partial, Case-Insensitive)
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    // Filter by Category (Exact Match)
    if (category) {
        query.category = category;
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 3. Execute Query with Pagination
    const sweets = await Sweet.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

    // 4. Get Total Count for Frontend Pagination
    const count = await Sweet.countDocuments(query);

    // 5. Return Response
    res.status(200).json({
        sweets,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        totalItems: count
    });

  } catch (error) {
    console.error('Get Sweets Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const restockSweet = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validation
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    // Find and Update
    const sweet = await Sweet.findByIdAndUpdate(
      id,
      { $inc: { quantity: quantity } }, 
      { new: true }
    );

    if (!sweet) {
      return res.status(404).json({ message: 'Sweet not found' });
    }

    res.status(200).json({
      message: 'Restock successful',
      newQuantity: sweet.quantity
    });

  } catch (error) {
    console.error('Restock Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export {
  addSweet,
  getAllSweets,
  restockSweet
}