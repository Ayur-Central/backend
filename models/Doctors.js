const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    doctorId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
    },
    email: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
        // unique: true
    },
    phoneNo: {
        type: String,
        required: true
    },
    phoneVerified: {
        type: String,
        required: false   // Change this to true if required
    },
    // licenseNo: {
    //     type: String,
    //     required: false
    // },
    // password: {
    //     type: String,
    //     required: false
    // },
    photoURL: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('doctor', UserSchema);
