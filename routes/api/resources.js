const express = require('express');
const router = express.Router();


// @route   GET api/appointment/test
// @desc    Tests appointment route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Resources api works' }));


module.exports = router;