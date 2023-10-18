const mongoose = require('mongoose');

const AppointmentsSchema = new mongoose.Schema({
    appointmentId: {
        type: String,
        // required: true,
        // unique: true
    },
    patientName: {
        type: String,
        required: false,
    },
    patientEmail: {
        type: String,
        required: false,
        // unique: true
    },
    patientPhoneNo: {
        type: String,
        required: false
    },
    patientPhoneVerified: {
        type: String,
        required: false   // Change this to true if required
    },
    notes: {
        type: String,
    },
    patientGender: {
        type: String,
    },
    scheduledAppointmentDate: {
        type: String,
        required: false
    },
    scheduledAppointmentTime: {
        type: String,
        required: false
    },
    appointmentStatus: {
        type: String,
        required: false,
        default: 'Scheduled'
    },
    appointmentType: {
        type: String,
    },
    videoConsultationId: {
        type: String
    },
    prescribedRxValue: {
        type: String
    },
    purchasedRxValue: {
        type: String
    },
    rxGrossMargin: {
        type: String
    },
    rxRemarks: {
        type: String
    },
    appointmentChannel: {
        type: String
    },
    paymentLink: {
        type: String
    },
    paymentStatus: {
        type: String,
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
    creationDate: {
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
