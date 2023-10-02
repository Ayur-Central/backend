const mongoose = require('mongoose');

const ContacstSchema = new mongoose.Schema({
    contactId: {
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
    message: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// const getContactModel = (database) => {
//     if (database) {
//         const conn = mongoose.connection.useDb(database);
//         return conn.model('contact', ContacstSchema);
//     } else {
//         return mongoose.model('contact', ContacstSchema);
//     }
// }
// module.exports = getContactModel;

module.exports = mongoose.model('contacts', ContacstSchema);
