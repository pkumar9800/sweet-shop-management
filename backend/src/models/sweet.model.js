import mongoose from 'mongoose';

const sweetSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  category: { 
    type: String, 
    required: true,
    index: true // Indexed for faster search later
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 0 
  },
  imageUrl: { 
    type: String,
    default: '' 
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [99, 'Discount cannot exceed 99%']
  }
}, { timestamps: true });

const Sweet = mongoose.model('Sweet', sweetSchema);
export default Sweet