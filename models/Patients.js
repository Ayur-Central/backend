const mongoose = require('mongoose');

const PatientsSchema = new mongoose.Schema({
    patientId: {
        type: String,
        // required: true,
        // unique: true
    },
    patientName: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
    },
    patientAge: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
    },
    patientGender: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
    },
    patientAddress: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
    },
    patientEmail: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
        // unique: true
    },
    patientPhoneNo: {
        type: String,
        required: true
    },
    phoneVerified: {
        type: String,
        required: false   // Change this to true if required
    },
    clinic: {
        type: mongoose.Schema.Types.String,
        ref: 'clinics',
        required: false
    },
    doctor: {
        type: mongoose.Schema.Types.String,
        ref: 'doctors',
        required: false
    },
    patientLastVisitDate: {
        type: String,
    },
    patientNextVisitDate: {
        type: String,
    },
    patientMedicalHistory: {
        type: String,
    },
    patientPrescriptions: {
        type: Array
    },
    patientPhotoURL: {
        type: String
    },
    creationDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('patients', PatientsSchema);
