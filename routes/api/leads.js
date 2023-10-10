const express = require('express');
const router = express.Router();
const path = require('path');
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const generateId = require('../../utils/uuidGenerator');
const EmailService = require('../../utils/emailService');
const moment = require('moment');

const email = config.get('email');
const bccemail = config.get('bccemail');
const organisation = config.get('organisation');
const Lead = require('../../models/Leads');
const checkObjectId = require('../../middleware/checkObjectId');
const { createMeeting } = require('../../utils/helpers');
const { sendSms } = require('../../utils/smsService');

// @route   GET api/leads/test
// @desc    Tests leads route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Leads api works' }));

// @route   GET api/leads/all
// @desc    Get all leads 
// @access  Public
router.get('/all', async (req, res) => {
    try {
        // const Appointment = getAppointmentModel(req.headers.client_id);
        const leads = await Leads.find()

        if (leads.length == 0) {
            return res.status(400).json(leads);
        }

        res.json(leads);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});

// @route    POST api/leads/create
// @desc     Create leads
// @access   Public
router.post(
    '/create',
    check('leadName', 'Name is required').notEmpty(),
    check('leadPhoneNo', 'Phone no. is required').notEmpty(),
    // check('appointmentDate', 'appointmentDate is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const leadBody = req.body;
        const leadId = generateId();

        // TODO:// Future
        // Check if there is duplicate leads using phone and email
        try {

            let lead = new Lead({
                ...leadBody,
                leadId: leadId
            });

            await lead.save();

            // res.json({ msg: 'Appointment created successfully!', appointment: appointment });

            try {
                let info = await EmailService.sendMail({
                    from: `"${organisation}" <${email}>`, // sender address
                    to: `${ leadBody?.leadName }, ${ leadBody?.leadEmail }`, // list of receivers
                    cc: `${email}`,
                    bcc: `${ bccemail }`,
                    subject: 'Appointment Request Received - AyurCentral', // Subject line
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
                                    <p style="white-space: pre-line;">
                                        Dear ${leadBody?.leadName}, 

                                        Greetings from AyurCentral - India's largest chain of Ayurvedic Clinics & Pharmacies.

                                        We're delighted to inform you that we've received your appointment request. Our dedicated team is already working on confirming your appointment, and you can expect to hear from us shortly.

                                        While you await confirmation, why not explore our diverse range of authentic Ayurvedic products? Visit our e-commerce store at www.ayurcentralonline.com, where you'll find over 10,000+ products carefully curated for your well-being.

                                        If you require any assistance, feel free to get in touch with us at +91 8037156655 

                                        Thank you for choosing AyurCentral. We look forward to assisting you on your Ayurvedic journey.
                                    </p>
                                    <p style="white-space: pre-line;">
                                        - Team AyurCentral
                                    </p>
                                </body>
                            </html>
                            `, // html body
                });
                
                console.log("Lead email sent... ", info.messageId);
                let pno = leadBody?.leadPhoneNo?.replace('+91', "");
                let body = `
                    Hi ${leadBody?.leadName},

                    We received your lead request.
                
                    Regards,
                    Team Ayurcentral
                `
                await sendSms(pno, body);
            } catch (error) {
                console.log("Error sending lead email : ", error.message);
            }
                
            res.json({ msg: 'Lead created successfully!', appointment: lead });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);


// @route   GET api/leads/filter
// @desc    Get all filtered leads 
// @access  Public
router.post('/filter', async (req, res) => {
    try {
        // const Appointment = getAppointmentModel(req.headers.client_id);
        const body = req.body instanceof String ? JSON.stringify(req.body) : req.body;
        const lead = await Leads.find({...body})

        if (lead.length == 0) {
            return res.status(400).json([]);
        }

        res.json(lead);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});

module.exports = router;
