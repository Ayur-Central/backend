const mongoose = require('mongoose');

const DoctorsSchema = new mongoose.Schema({
    doctorId: {
        type: String,
        // required: true,
        // unique: true
    },
    doctorName: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
    },
    doctorEmail: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
        // unique: true
    },
    doctorPhoneNo: {
        type: String,
        required: true
    },
    doctorPhoneVerified: {
        type: String,
        required: false   // Change this to true if required
    },
    doctorWebsite: {
        type: String,
        required: false   // Change this to true if required
    },
    doctorConsultationFee: {
        type: String,
        default: "0"
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
    doctorPhotoURL: {
        type: String
    },
    creationDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('doctors', DoctorsSchema);
