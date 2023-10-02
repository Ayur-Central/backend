const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClinicsSchema = new mongoose.Schema({
    clinicId: {
        type: String,
        // required: true,
        // unique: true
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
    address: {
        type: String,
        required: false
    },
    type: {
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
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('clinics', ClinicsSchema);
