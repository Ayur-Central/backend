const mongoose = require('mongoose');

const SchedulesSchema = new mongoose.Schema({
    scheduleId: {
        type: String,
        required: true
    },
    scheduleDate: {
        type: Date,
        required: true
    },
    scheduleTimes: [
        {
            slotId: {
                type: String,
                required: true
            },
            startTime: {
                type: Date,
                required: true
            },
            endTime: {
                type: Date,
                required: true
            },
            slotDuration: {
                type: String
            },
            appointmentId: {
                type: mongoose.Schema.Types.ObjectId,
                // required: true
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('schedules', SchedulesSchema);
