const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const Schedule = require('../../models/Schedules');
const generateId = require('../../utils/uuidGenerator');

const defaultSchedules = [
    
]

// @route   GET api/schedules/test
// @desc    Tests schedules route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Schedules api works' }));

// @route   GET api/schedules/all
// @desc    Get all schedules 
// @access  Public
router.get('/all', async (req, res) => {
    try {
        const schedules = await Schedule.find()

        if (schedules.length == 0) {
            return res.status(400).json({ msg: 'No schedules available', data: [] });
        }

        res.json({data: schedules});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});

// @route   GET api/schedules/all
// @desc    Get all schedules 
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const schedules = await Schedule.find({scheduleId: id})

        if (schedules.length == 0) {
            return res.status(200).json({ msg: 'No schedules available', data: [] });
        }

        res.json({data: schedules});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});

// @route   GET api/schedules/byDate
// @desc    Get all schedules 
// @access  Public
router.get('/byDate/:date', async (req, res) => {
    try {
        const date = req.params.date;
        const schedules = await Schedule.find({scheduleDate: date})

        if (schedules.length == 0) {
            return res.status(200).json({ msg: 'No schedules available', data: [] });
        }

        res.json({data: schedules});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});

// @route    POST api/schedules/create
// @desc     Create schedules
// @access   Public
router.post(
    '/create',
    check('name', 'Name is required').notEmpty(),
    check('phoneNo', 'Phone no. is required').notEmpty(),
    // check('appointmentDate', 'appointmentDate is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const appointmentBody = req.body;
        const appointmentId = generateId();

        // TODO:// Future
        // Check if there is duplicate appoints using phone and email
        try {
            // let schedules = await Schedule.findOne({ appointmentId: id });

            // if (schedules) {
            //     return res.status(400).json({ msg: 'Schedule with same Id already exists!' });
            // }

            schedules = new Schedule({
                ...appointmentBody,
                appointmentId: appointmentId
            });

            await schedules.save();
            res.json({ msg: 'Schedule created successfully!', schedules: schedules });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);

module.exports = router;
