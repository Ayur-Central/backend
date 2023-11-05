const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema({
    promotionId: {
        type: String,
        required: true,
        unique: true
    },
    promotionName: {
        type: String,
        required: true,
    },
    promotionType: {
        type: String,
        required: true,
    },
    devicedId: {
        type: String
    },
    ipAddress: {
        type: String
    },
    coords: {
        type: Object
    },
    deviceDetails: {
        type: Object
    },
    frequency: {
        type: Number,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// const getPromotionModel = (database) => {
//     if (database) {
//         const conn = mongoose.connection.useDb(database);
//         return conn.model('appointment', PromotionSchema);
//     } else {
//         return mongoose.model('appointment', PromotionSchema);
//     }
// }

// module.exports = getPromotionModel;

module.exports = mongoose.model('promotion', PromotionSchema);;
