import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sweet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Sweet', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
  razorpayOrderId: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;