const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const Clinic = require('../../models/Clinics');
const auth = require('../../middleware/auth');
const generateId = require('../../utils/uuidGenerator');
const { ClinicTypes } = require('../../utils/helpers');

// @route   GET api/clinics/test
// @desc    Tests clinics route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Clinics Api Works' }));

// @route   GET api/clinics/me
// @desc    Get one clinic checking his id 
// @access  Public
router.get('/me', auth, async (req, res) => {
  try {
    const clinic = await Clinic.findOne({
      _id: req.entity.id
    }).populate('clinics', ['clinicId', 'name', 'email', 'phoneNo', 'address']);

    if (!clinic) {
      return res.status(400).json({ msg: 'There is no profile for this clinic' });
    }

    res.json(clinic);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/clinic
// @desc     Register clinic
// @access   Public
router.post(
  '/create',
  check('phoneNo', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  // check(
  //   'password',
  //   'Please enter a password with 6 or more characters'
  // ).isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNo } = req.body;

    try {
      let clinic = await Clinic.findOne({ phoneNo });

      if (clinic) {
        return res.status(400).json({ msg: 'There is a clinic registered with this mobile & email' });
      }

      clinic = new Clinic({
          ...req.body,
          clinicId: generateId()
      });

      await clinic.save();

      res.json({ msg: 'Clinic registered successfully!', clinic: clinic });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/clinics/all
// @desc    Get all clinics 
// @access  Public
router.get('/all', async (req, res) => {
  try {
      const clinics = await Clinic.find()

      if (clinics.length == 0) {
          return res.status(400).json({ msg: 'No clinics available', data: [] });
      }

      res.json({data: clinics});
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error : ' + err.message);
  }
});

// @route   GET api/clinics/all
// @desc    Get all clinics 
// @access  Public
router.get('/:id', async (req, res) => {
  try {
      const id = req.params.id;
      const clinics = await Clinic.find({clinicId: id})

      if (clinics.length == 0) {
          return res.status(200).json({ msg: 'No clinics available', data: [] });
      }

      res.json({data: clinics});
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error : ' + err.message);
  }
});

// @route   GET api/clinics/types
// @desc    Get clinic types
// @access  Public
router.get('/types', async (req, res) => {
    try {
      res.json(ClinicTypes);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;
