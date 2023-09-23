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

module.exports = mongoose.model('newsletterSubs', NewsletterSubsSchema);
