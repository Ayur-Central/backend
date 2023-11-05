const mongoose = require('mongoose');

const DhanvantariPromotionSchema = new mongoose.Schema({
    promotionId: {
        type: String
    },
    promotionName: {
        type: String,
    },
    promotionType: {
        type: String,
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
        default: 1
    },
    redirectUrl: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// const getPromotionModel = (database) => {
//     if (database) {
//         const conn = mongoose.connection.useDb(database);
//         return conn.model('appointment', DhanvantariPromotionSchema);
//     } else {
//         return mongoose.model('appointment', DhanvantariPromotionSchema);
//     }
// }

// module.exports = getPromotionModel;

module.exports = mongoose.model('dhanvantari_promotions', DhanvantariPromotionSchema);;
