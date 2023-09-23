const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');


const Appointment = require('../../models/Appointment');
const generateId = require('../../utils/uuidGenerator');
const EmailService = require('../../utils/emailService');
const moment = require('moment');

const email = config.get('email');
const ccemail = config.get('ccemail');
const bccemail = config.get('bccemail');
const organisation = config.get('organisation');

// @route   GET api/appointment/test
// @desc    Tests appointment route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Appointment api works' }));

// @route   GET api/appointment/all
// @desc    Get all appointments 
// @access  Public
router.get('/all', async (req, res) => {
    try {
        const appointments = await Appointment.find()

        if (appointments.length == 0) {
            return res.status(400).json({ msg: 'No appointments available' });
        }

        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});

// @route    POST api/appointment/create
// @desc     Create appointment
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
            // let appointment = await Appointment.findOne({ appointmentId: id });

            // if (appointment) {
            //     return res.status(400).json({ msg: 'Appointment with same Id already exists!' });
            // }

            appointment = new Appointment({
                ...appointmentBody,
                appointmentId: appointmentId
            });

            await appointment.save();

            // res.json({ msg: 'Appointment created successfully!', appointment: appointment });

            let info = await EmailService.sendMail({
                from: `"${organisation}" <${email}>`, // sender address
                to: `${ appointmentBody?.name }, ${ appointmentBody?.email }`, // list of receivers
                cc: `${email}`,
                bcc: `${ bccemail }`,
                subject: 'Appointment Request', // Subject line
                text: `There is a new appointment scheduled for ${appointmentBody?.name} on ${moment(appointmentBody?.appointmentDate).format('DD MMM YYYY, ddd')}`, // plain text body
                html: ` <!DOCTYPE html>
                        <html>
                            <head>
                                <style>
                                    table {
                                        font-family: arial, sans-serif;
                                        border-collapse: collapse;
                                    }
                                    td, th {
                                        border: 1px solid #dddddd;
                                        text-align: left;
                                        padding: 8px;
                                    }
                                </style>
                            </head>
                            <body>
                                <b>There is a new appointment scheduled for ${ appointmentBody?.name } on ${ moment(appointmentBody?.appointmentDate).format('DD MMM YYYY, ddd') }</b> 
                                <br /><br />
                                <table>
                                    <tr>
                                        <td>Name</td>
                                        <td>${appointmentBody?.name}</td>
                                    </tr>
                                    <tr>
                                        <td>Phone Number</td>
                                        <td><a href='tel:${appointmentBody?.phoneNo}'>${appointmentBody?.phoneNo}</a></td>
                                    </tr>
                                    <tr>
                                        <td>Email</td>
                                        <td>${appointmentBody?.email ?? ''}</td>
                                    </tr>
                                    <tr>
                                        <td>Appointment Date</td>
                                        <td>${moment(appointmentBody?.appointmentDate).format('DD MMM YYYY, ddd')}</td>
                                    </tr>
                                    <tr>
                                        <td>Appointment Time</td>
                                        <td>${appointmentBody?.appointmentTime}</td>
                                    </tr>
                                </table>
                            </body>
                        </html>
                        `, // html body
            });
            
            console.log("Appointment email sent... ", info.messageId);

            res.json({ msg: 'Appointment created successfully!', appointment: appointment });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);

router.get('/sendEmail', async (req, res) => {
    try {
        let info = await EmailService.sendMail({
            from: '"Dr Swetha Clinic"', // sender address
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
