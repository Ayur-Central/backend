const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema({
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
    required: false
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
  clinic: {
    type: mongoose.Schema.Types.String,
    ref: 'clinics',
    required: false
  },
  creationDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('users', UsersSchema);
