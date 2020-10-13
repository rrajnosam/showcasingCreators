const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    max: 12,
    required: true,
    unique: true,
    lowercase: true
  },
  googleId: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String

  },
  email: {
    type: String,
    required: true
  },
  votedChannels: [{
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      unique: true
    },
    direction: String
  }]

});

const User = mongoose.model("user", userSchema);

module.exports = User;
