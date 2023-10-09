const mongoose = require('mongoose');

const DoctorsSchema = new mongoose.Schema({
    doctorId: {
        type: String,
        // required: true,
        // unique: true
    },
    docotorName: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
    },
    docotorEmail: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
        // unique: true
    },
    docotorPhoneNo: {
        type: String,
        required: true
    },
    docotorPhoneVerified: {
        type: String,
        required: false   // Change this to true if required
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clinics'
    },
    // licenseNo: {
    //     type: String,
    //     required: false
    // },
    // password: {
    //     type: String,
    //     required: false
    // },
    docotorPhotoURL: {
        type: String
    },
    creationDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('doctors', DoctorsSchema);
