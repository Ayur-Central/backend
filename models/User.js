const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // userId: {
  //   type: String,
  //   // required: true,
  //   required: true,   // Change this to true in future
  //   unique: true
  // },
  name: {
    type: String,
    // required: true,
    required: false,   // Change this to true in future
  },
  email: {
    type: String,
    // required: true,
    required: false,   // Change this to true in future
    unique: true
  },
  phoneNo: {
    type: String,
    required: true
  },
  phoneVerified: {
    type: String,
    required: false   // Change this to true if required
  },
  password: {
    type: String,
    required: false
  },
  photoURL: {
    type: String
  },
  emailVerified: {
    type: Boolean
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('user', UserSchema);
