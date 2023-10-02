const mongoose = require('mongoose');

const AppointmentsSchema = new mongoose.Schema({
    appointmentId: {
        type: String,
        // required: true,
        // unique: true
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
    appointmentStatus: {
        type: String,
        required: true,
        default: 'pending'
    },
    prescription: {
        type: Object
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'clinics',
        required: false
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'doctors',
        required: false
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patients',
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// const getAppointmentModel = (database) => {
//     if (database) {
//         const conn = mongoose.connection.useDb(database);
//         return conn.model('appointment', AppointmentsSchema);
//     } else {
//         return mongoose.model('appointment', AppointmentsSchema);
//     }
// }

// module.exports = getAppointmentModel;

module.exports = mongoose.model('appointment', AppointmentsSchema);
