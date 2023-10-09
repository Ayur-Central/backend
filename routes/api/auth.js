const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/Users');
const Clinic = require('../../models/Clinics');

// @route   GET api/auth/test
// @desc    Tests auth route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Auth Works' }));

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error : ' + err.message);
  }
});

// @route    GET api/auth/user
// @desc     Get user by token
// @access   Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.entity.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error : ' + err.message);
  }
});

// @route    GET api/auth/clinic
// @desc     Get clinic by token
// @access   Private
router.get('/clinic', auth, async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.entity.id).select('-password');
    res.json(clinic);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error : ' + err.message);
  }
});

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/',
  // check('email', 'Please include a valid email').isEmail(),
  // check('password', 'Password is required').exists(),
  check(
    'phoneNo',
    'Please enter a valid Phone Number'
  ).isLength({ min: 10 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNo } = req.body;

    try {
      let user = await User.findOne({ phoneNo })

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      // const isMatch = await bcrypt.compare(password, user.password);

      // if (!isMatch) {
      //   return res
      //     .status(400)
      //     .json({ errors: [{ msg: 'Invalid Credentials' }] });
      // }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ token, name: user.name, email: user.email, phoneNo: user.phoneNo, licenseNo: user.licenseNo, licenseLinked: user.licenseLinked });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error : ' + err.message);
    }
  }
);

// @route    POST api/auth/login
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/login',
  // check('email', 'Please include a valid email').isEmail(),
  // check('password', 'Password is required').exists(),
  check(
    'phoneNo',
    'Please enter a valid Phone Number'
  ).isLength({ min: 10 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phoneNo } = req.body;

    try {
      let user = await User.findOne({ phoneNo })

      // commenting this invalid credentials methods as this will be re-used for login api
      // if (!user) {
      //   return res
      //     .status(400)
      //     .json({ errors: [{ msg: 'Invalid Credentials' }] });
      // }

      // If there is no user created, will create a new user
      if (!user) {
        
        user = new User({
          ...req.body,
          name: '', email: '', licenseNo: '', licenseLinked: false
        });

        await user.save();

        const payload = {
          user: {
            id: user.id
          }
        };

        jwt.sign(
          payload,
          config.get('jwtSecret'),
          { expiresIn: '5 days' },
          (err, token) => {
            if (err) throw err;
            res.json({ token, name: user.name, email: user.email, phoneNo: user.phoneNo, licenseNo: user.licenseNo, licenseLinked: user.licenseLinked });
          }
        );

        return;
      }

      // const isMatch = await bcrypt.compare(password, user.password);

      // if (!isMatch) {
      //   return res
      //     .status(400)
      //     .json({ errors: [{ msg: 'Invalid Credentials' }] });
      // }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '5 days' },
        (err, token) => {
          if (err) throw err;
          res.json({ token, name: user.name, email: user.email, phoneNo: user.phoneNo, licenseNo: user.licenseNo, licenseLinked: user.licenseLinked });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error : ' + err.message);
    }
  }
);

// @route    POST api/auth/login
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/clinicLogin',
  check('clinicId', 'ClinicId is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
  // check(
  //   'phoneNo',
  //   'Please enter a valid Phone Number'
  // ).isLength({ min: 10 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, clinicId } = req.body;

    try {
      let user = await User.findOne({ email })

      // commenting this invalid credentials methods as this will be re-used for login api
      if (!user) {
        return res
          .status(400)
          .json('Invalid Credentials');
      }

      // If there is no user created, will create a new user
      // if (!user) {
        
      //   user = new User({
      //     ...req.body,
      //     name: '', email: '', licenseNo: '', licenseLinked: false
      //   });

      //   await user.save();

      //   const payload = {
      //     user: {
      //       id: user.id
      //     }
      //   };

      //   jwt.sign(
      //     payload,
      //     config.get('jwtSecret'),
      //     { expiresIn: '5 days' },
      //     (err, token) => {
      //       if (err) throw err;
      //       res.json({ token, name: user.name, email: user.email, phoneNo: user.phoneNo, licenseNo: user.licenseNo, licenseLinked: user.licenseLinked });
      //     }
      //   );

      //   return;
      // }

      const isMatch = await bcrypt.compare(password, user.password);
      const isClinicMatch = clinicId === user.clinic;

      console.log({isMatch, isClinicMatch})

      if (!isMatch || !isClinicMatch) {
        return res
          .status(400)
          .json('Invalid Credentials');
      }

      // const payload = {
      //   user: {
      //     id: user.id
      //   }
      // };

      // jwt.sign(
      //   payload,
      //   config.get('jwtSecret'),
      //   { expiresIn: '5 days' },
      //   (err, token) => {
      //     if (err) throw err;
      //     res.json({ token, name: user.name, email: user.email, phoneNo: user.phoneNo, licenseNo: user.licenseNo, licenseLinked: user.licenseLinked });
      //   }
      // );

      res.json('Login Successful')
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error : ' + err.message);
    }
  }
);

module.exports = router;
