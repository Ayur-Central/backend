const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const Patient = require('../../models/Patients');
const auth = require('../../middleware/auth');
const generateId = require('../../utils/uuidGenerator');


// @route   GET api/patients/test
// @desc    Tests patients route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Patients Works' }));

// @route   GET api/patients/me
// @desc    Get one patient checking his id 
// @access  Public
router.get('/me', auth, async (req, res) => {
    try {
        const user = await Patient.findOne({
            _id: req.entity.id
        }).populate('patients', ['name', 'avatar', 'email']);

        if (!user) {
            return res.status(400).json({ msg: 'There is no profile for this patient' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/patients
// @desc     Register patient
// @access   Public
router.post(
    '/create',
    check('phoneNo', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    // check(
    //     'password',
    //     'Please enter a password with 6 or more characters'
    // ).isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phoneNo, password } = req.body;

        try {
            let patient = await Patient.findOne({ patientPhoneNo : phoneNo });

            if (patient) {
                return res.status(400).json({ msg: 'There is already a profile for this patient' });
            }

            // const avatar = normalize(
            //   gravatar.url(email, {
            //     s: '200',
            //     r: 'pg',
            //     d: 'mm'
            //   }),
            //   { forceHttps: true }
            // );

            patient = new Patient({
                ...req.body,
                patientId: generateId()
            });

            const salt = await bcrypt.genSalt(10);

            patient.password = await bcrypt.hash(password ?? 'Patient@123', salt);

            await patient.save();

            res.json({ msg: 'Patient registered successfully!', patient: patient });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   GET api/patients/all
// @desc    Get all patients 
// @access  Public
router.get('/all', async (req, res) => {
    try {
        const patients = await Patient.find()
  
        if (patients.length == 0) {
            return res.status(400).json({ msg: 'No patients available', data: [] });
        }
  
        res.json({data: patients});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});
  
// @route   GET api/patients/all
// @desc    Get all patients 
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const patients = await Patient.find({patientId: id})

        if (patients.length == 0) {
            return res.status(200).json({ msg: 'No patients available', data: [] });
        }

        res.json({data: patients});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});

// @route   GET api/appointment/filter
// @desc    Get all appointments 
// @access  Public
router.post('/filter', async (req, res) => {
    try {
        // const Appointment = getAppointmentModel(req.headers.client_id);
        const body = req.body instanceof String ? JSON.stringify(req.body) : req.body;
        const patients = await Patient.find({...body})

        if (patients.length == 0) {
            return res.status(400).json([]);
        }

        res.json({data: patients});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});

module.exports = router;
