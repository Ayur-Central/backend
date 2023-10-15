const express = require('express');
const router = express.Router();
const config = require('config');
const { check, validationResult } = require('express-validator');
const normalize = require('normalize-url');

const generateId = require('../../utils/uuidGenerator');
const EmailService = require('../../utils/emailService');
const getContactModel = require('../../models/Contacts');

const email = config.get('email');
const bccemail = config.get('bccemail');
const organisation = config.get('organisation');
const checkClientId = require('../../middleware/checkClientId');

// @route   GET api/contact/test
// @desc    Tests contact route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Contact api works' }));

// @route    GET api/contact/all
// @desc     Get all Contacts
// @access   Public
router.get('/all', async (req, res) => {
    try {
        const Contact = getContactModel(req.headers.client_id);
        // const contact = await Contact.find();
        const contact = await Contact.find();

        if (contact.length == 0) {
            return res.status(400).json({ msg: 'No contacts available' });
        }

        res.json(contact);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});

// @route    POST api/contact/create
// @desc     Create Contact
// @access   Public
router.post(
    '/create',
    check('name', 'Name is required').notEmpty(),
    check('phoneNo', 'Phone No. is required').notEmpty(),
    // check('email', 'Please include a valid email').isEmail(),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const body = req.body;
        const phoneNo = body.phoneNo;
        const id = generateId();

        try {
            const Contact = getContactModel(req.headers.client_id);
            let contact = await Contact.findOne({ phoneNo: phoneNo });

            if (contact) {
                console.log('Update...')
                contact.modified = Date.now;
                await contact.updateOne({ phoneNo: phoneNo });
                // res.json({ msg: 'Thank you! Our team will contact you shortly.' });
            } else {
                contact = new Contact({
                    ...body,
                    contactId: id
                });
                await contact.save();
                // res.json({ msg: 'Thank you! Our team will contact you shortly.' });
            }

            // Handle Email sending error
            try {
                let info = await EmailService.sendMail({
                    from: `"${organisation}" <${email}>`, // sender address
                    // to: `${ body?.name }, ${ body?.email }`, // list of receivers
                    to: email,
                    // cc: `${ccemail} `,
                    bcc: `${ bccemail }`,
                    subject: 'Contact Request', // Subject line
                    text: `${body?.name} has sent a message`, // plain text body
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
                                    <b>${body?.name} has sent a message</b> 
                                    <br /><br />
                                    <table>
                                        <tr>
                                            <td>Name</td>
                                            <td>${body?.name}</td>
                                        </tr>
                                        <tr>
                                            <td>Phone Number</td>
                                            <td><a href='tel:${body?.phoneNo}'>${body?.phoneNo}</a></td>
                                        </tr>
                                        <tr>
                                            <td>Email</td>
                                            <td>${body?.email}</td>
                                        </tr>
                                        <tr>
                                            <td>City</td>
                                            <td>${body?.city}</td>
                                        </tr>
                                        <tr>
                                            <td>Message</td>
                                            <td>${body?.message}</td>
                                        </tr>
                                    </table>
                                </body>
                            </html>
                            `, // html body
                });
                console.log("Contact email sent... ", info.messageId);
            } catch (error) {
                console.log("Error sending contact email : ", error.message);
            }

            res.json({ msg: 'Thank you! Our team will contact you shortly.' });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);

module.exports = router;