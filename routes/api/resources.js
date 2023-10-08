const express = require('express');
const router = express.Router();


// @route   GET api/appointment/test
// @desc    Tests appointment route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Resources api works' }));


// Appointment Request
// Doctor Assigned
// 15 Mins before Appointment
// Thank-you
// Feedback
router.post('/sendEmail', async (req, res) => {
    try {
        let info = await EmailService.sendMail({
            from: '"DigiClinik"', // sender address
            to: "Chandan, chandan@siano.in", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        });
        
        res.json({ msg: 'Email Sent' })

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
})


module.exports = router;