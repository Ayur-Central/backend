const mongoose = require('mongoose');

const ReportsSchema = new mongoose.Schema({
    // reportId: {
    //     type: String,
    //     required: true
    // },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    report: {
        id: {
            type: String
        },
        name: {
            type: String
        },
        description: {
            type: String
        },
        url: {
            type: String
        }
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('reports', ReportsSchema);
