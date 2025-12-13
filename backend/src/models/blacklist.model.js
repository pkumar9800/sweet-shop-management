import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true // Prevent duplicate blacklisting
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // 24 hours (matches JWT expiry)
  }
});

const Blacklist = mongoose.model('Blacklist', blacklistSchema);

export default Blacklist;