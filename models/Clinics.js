const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClinicsSchema = new mongoose.Schema({
    clinicId: {
        type: String,
        // required: true,
        // unique: true
    },
    clinicName: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
    },
    clinicEmail: {
        type: String,
        // required: true,
        required: false,   // Change this to true in future
        // unique: true
    },
    clinicPhoneNo: {
        type: String,
        required: true
    },
    clinicPhoneVerified: {
        type: String,
        required: false   // Change this to true if required
    },
    clinicAddress: {
        type: String,
        required: false
    },
    clinicType: {
        type: String,
    },
    clinicMapLink: {
        type: String,
    },
    // licenseNo: {
    //     type: String,
    //     required: false
    // },
    // password: {
    //     type: String,
    //     required: false
    // },
    // photoURL: {
    //     type: String
    // },
    doctors: [
        {
            doctorId: {
                type: Schema.Types.ObjectId
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    patients: [
        {
            patientId: {
                type: Schema.Types.ObjectId
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    creationDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('clinics', ClinicsSchema);
