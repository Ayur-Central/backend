const mongoose = require('mongoose');

const LeadsSchema = new mongoose.Schema({
    leadId: {
        type: String,
        // required: true,
        // unique: true
    },
    leadName: {
        type: String,
        required: false,
    },
    leadEmail: {
        type: String,
        required: false,
        // unique: true
    },
    leadPhoneNo: {
        type: String,
        required: false
    },
    promotionType: {
        type: String,
    },
    leadRequestedAppointmentDate: {
        type: String,
        required: false
    },
    leadRequestedAppointmentTime: {
        type: String,
        required: false
    },
    leadAppointmentStatus: {
        type: String,
        required: false,
        default: 'Requested'
    },
    leadEnquiryTag: {
        type: Object
    },
    creationDate: {
        type: Date,
        default: Date.now
    }
});

// const getLeadModel = (database) => {
//     if (database) {
//         const conn = mongoose.connection.useDb(database);
//         return conn.model('leads', LeadsSchema);
//     } else {
//         return mongoose.model('leads', LeadsSchema);
//     }
// }

// module.exports = getLeadModel;

module.exports = mongoose.model('promotionLeads', LeadsSchema);
