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
  }
}, { timestamps: true });

const Sweet = mongoose.model('Sweet', sweetSchema);
export default Sweet