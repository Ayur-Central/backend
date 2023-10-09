const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const User = require('../../models/Users');
const auth = require('../../middleware/auth');


// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));

// @route   GET api/users/me
// @desc    Get one user checking his id 
// @access  Public
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.user.id
    }).populate('user', ['name', 'avatar', 'email']);

    if (!user) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/create',
  check('phoneNo', 'Name is required').notEmpty(),
  // check('email', 'Please include a valid email').isEmail(),
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
      let user = await User.findOne({ phoneNo });

      if (user) {
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
            res.json({ token });
          }
        );
        
        return;
      }

      // const avatar = normalize(
      //   gravatar.url(email, {
      //     s: '200',
      //     r: 'pg',
      //     d: 'mm'
      //   }),
      //   { forceHttps: true }
      // );

      user = new User({
        ...req.body
      });

      // const salt = await bcrypt.genSalt(10);

      // user.password = await bcrypt.hash(password, salt);

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
          res.json({ token, ...user });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/createGuestUser',
  check('name', 'Name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check(
    'phoneNo',
    'Please enter a valid Phone Number'
  ).isLength({ min: 10 }),
  check('licenseNo', 'License No is required').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phoneNo, licenseNo } = req.body;

    try {
      let user = await User.findOne({ phoneNo });

      if (user) {
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

      if (licenseNo != null && licenseNo != '') {
        user = new User({
          ...req.body,
          licenseLinked: true
        });
      } else {
        user = new User({
          ...req.body,
          licenseLinked: false
        });
      }

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
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/create/clinicLogin',
  check('clinicId', 'ClinicId is required').notEmpty(),
  // check('phoneNo', 'Name is required').notEmpty(),
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

    const { email, password, clinicId } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json('User with email already exists!');
      }

      user = new User({
        ...req.body,
        clinic: clinicId
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();
      res.json('User created successfully!');

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
      //     res.json({ token, ...user });
      //   }
      // );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error : ' + err.message);
    }
  }
);

module.exports = router;
