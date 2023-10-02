const mongoose = require('mongoose');

const NewsletterSubsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        // unique: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// const getNewsletterSubsModel = (database) => {
//     if (database) {
//         const conn = mongoose.connection.useDb(database);
//         return conn.model('newsletterSubs', NewsletterSubsSchema);
//     } else {
//         return mongoose.model('newsletterSubs', NewsletterSubsSchema);
//     }
// }

// module.exports = getNewsletterSubsModel;

module.exports = mongoose.model('newsletterSubs', NewsletterSubsSchema);
