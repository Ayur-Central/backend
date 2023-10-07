const mongoose = require('mongoose');

const AppointmentsSchema = new mongoose.Schema({
    appointmentId: {
        type: String,
        // required: true,
        // unique: true
    },
    name: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
        // unique: true
    },
    phoneNo: {
        type: String,
        required: false
    },
    phoneVerified: {
        type: String,
        required: false   // Change this to true if required
    },
    notes: {
        type: String,
    },
    gender: {
        type: String,
    },
    appointmentDate: {
        type: String,
        required: false
    },
    appointmentTime: {
        type: String,
        required: false
    },
    requestedAppointmentDate: {
        type: String,
        required: false
    },
    requestedAppointmentTime: {
        type: String,
        required: false
    },
    appointmentStatus: {
        type: String,
        required: false,
        default: 'pending'
    },
    appointmentType: {
        type: String,
    },
    meetingId: {
        type: String
    },
    prescription: {
        type: Object
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
    patient: {
        type: mongoose.Schema.Types.String,
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
