const mongoose = require('mongoose');

const ConatactSchema = new mongoose.Schema({
    contactId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
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
    message: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('contact', ConatactSchema);
