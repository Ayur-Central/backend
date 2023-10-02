const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const Doctor = require('../../models/Doctors');
const auth = require('../../middleware/auth');
const generateId = require('../../utils/uuidGenerator');


// @route   GET api/doctors/test
// @desc    Tests doctors route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Doctors Works' }));

// @route   GET api/doctors/me
// @desc    Get one doctor checking his id 
// @access  Public
router.get('/me', auth, async (req, res) => {
    try {
        const user = await Doctor.findOne({
            _id: req.entity.id
        }).populate('doctors', ['name', 'avatar', 'email']);

        if (!user) {
            return res.status(400).json({ msg: 'There is no profile for this doctor' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    POST api/doctors
// @desc     Register doctor
// @access   Public
router.post(
    '/create',
    check('phoneNo', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
        'password',
        'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { phoneNo, password } = req.body;

        try {
            let doctor = await Doctor.findOne({ phoneNo });

            if (doctor) {
                return res.status(400).json({ msg: 'There is already a profile for this doctor' });
            }

            // const avatar = normalize(
            //   gravatar.url(email, {
            //     s: '200',
            //     r: 'pg',
            //     d: 'mm'
            //   }),
            //   { forceHttps: true }
            // );

            doctor = new Doctor({
                ...req.body,
                doctorId: generateId()
            });

            const salt = await bcrypt.genSalt(10);

            doctor.password = await bcrypt.hash(password ?? 'Doctor@123', salt);

            await doctor.save();

            res.json({ msg: 'Doctor registered successfully!', doctor: doctor });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   GET api/doctors/all
// @desc    Get all doctors 
// @access  Public
router.get('/all', async (req, res) => {
    try {
        const doctors = await Doctor.find()
  
        if (doctors.length == 0) {
            return res.status(400).json({ msg: 'No doctors available', data: [] });
        }
  
        res.json({data: doctors});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
  });
  
  // @route   GET api/doctors/all
  // @desc    Get all doctors 
  // @access  Public
  router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const doctors = await Doctor.find({doctorId: id})
  
        if (doctors.length == 0) {
            return res.status(200).json({ msg: 'No doctors available', data: [] });
        }
  
        res.json({data: doctors});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
  });

module.exports = router;
