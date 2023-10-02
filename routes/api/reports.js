const { initializeApp } = require('firebase-admin/app');
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const Report = require('../../models/Reports');
const User = require('../../models/Users');
const generateId = require('../../utils/uuidGenerator');

// Your web app's Firebase configuration
const firebaseConfig = {};
  
// Initialize Firebase
// const app = initializeApp(firebaseConfig);

// @route   GET api/reports/test
// @desc    Tests reports route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Reports api works' }));

// @route    GET api/reports/:id/all
// @desc     Get all reports of id
// @access   Public
router.get('/:id/all', async (req, res) => {
    const id = req.params?.id
    try {

        if (!id) {
            res.json({ msg: 'Please include a valid id.' });
            return;
        }

        const ns = await Report.find({user: id});

        if (ns.length == 0) {
            return res.status(400).json({ msg: 'No reports available' });
        }

        res.json(ns);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});

// @route    POST api/reports/:id/upload
// @desc     Upload reports of id
// @access   Public
router.post(
    '/:id/upload',
    // check('email', 'Please include a valid email').isEmail(),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const id = req.params.id;
        const body = req.body;
        const phoneNo = body.phoneNo;
        const files = body.files;

        console.log('Files : ', files);

        try {
            // let user = User.find({ phoneNo: phoneNo });
            // const report = {
            //     id: generateId(),
            //     name: files[0].name,
            //     description: files[0].name,
            //     url
            // }
            // let report = new Report({
            //     user: userId,
            //     report: report
            // });
            // await report.save();
            res.json({ msg: 'Your report has been uploaded.' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);

module.exports = router;