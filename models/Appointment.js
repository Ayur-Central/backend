const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    appointmentId: {
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
    notes: {
        type: String,
    },
    appointmentDate: {
        type: String,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('appointment', AppointmentSchema);
