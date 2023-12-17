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
const checkClientId = require('../../middleware/checkClientId');
// const getAppointmentModel = require('../../models/Appointment');
const Appointment = require('../../models/Appointments');
const Doctors = require('../../models/Doctors');
const Patients = require('../../models/Patients');
const Clinics = require('../../models/Clinics');
const checkObjectId = require('../../middleware/checkObjectId');
const { createMeeting } = require('../../utils/helpers');
const { sendSms, sendWhatsAppMsg, whatsappTemplatesRepo } = require('../../utils/smsService');
const { generatePaymentLink } = require('../../utils/paymentService');

// @route   GET api/appointment/test
// @desc    Tests appointment route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Appointment api works' }));

// @route   GET api/appointment/all
// @desc    Get all appointments 
// @access  Public
router.get('/all', async (req, res) => {
    try {
        // const Appointment = getAppointmentModel(req.headers.client_id);
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
    // checkClientId,
    check('name', 'Name is required').notEmpty(),
    check('phoneNo', 'Phone no. is required').notEmpty(),
    // check('appointmentDate', 'appointmentDate is required').notEmpty(),
    async (req, res) => {
        console.log(1)
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

            // const Appointment = getAppointmentModel(req.headers.client_id);
            

            let meetingId = "";
            if (appointmentBody.appointmentType === 'Online') {
                try {
                    meetingId = await createMeeting();
                    console.log('Meeting Id : ', meetingId);
                } catch (error) {
                    console.log('Error generating meeting id : ', error);
                }
            }

            let appointment = new Appointment({
                ...appointmentBody,
                appointmentId: appointmentId,
                videoConsultationId: meetingId ?? ''
            });

            await appointment.save();

            // res.json({ msg: 'Appointment created successfully!', appointment: appointment });
            

            try {
                let info = await EmailService.sendMail({
                    from: `"${organisation}" <${email}>`, // sender address
                    to: `${ appointmentBody?.name }, ${ appointmentBody?.email }`, // list of receivers
                    // cc: `${email}`,
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
                                        Dear ${appointmentBody?.name}, 

                                        Greetings from ${organisation}!

                                        We're excited to receive your appointment request. Our expert team will swiftly confirm your appointment details and provide guidance.
                                    </p>
                                    <br />
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
                                            <td>Requested Appointment Date</td>
                                            <td>${moment(appointmentBody?.requestedAppointmentDate).format('DD MMM YYYY, ddd')}</td>
                                        </tr>
                                        <tr>
                                            <td>Requested Appointment Time</td>
                                            <td>${appointmentBody?.requestedAppointmentTime}</td>
                                        </tr>
                                        ${appointmentBody.appointmentType === 'Online' &&
                                        `<tr>
                                            <td>Online Consultation Link </td>
                                            <td>https://consultations.web.app/${meetingId}</td>
                                        </tr>`}
                                    </table>
                                    <p style="white-space: pre-line;">
                                        Thank you,
                                        ${organisation}
                                    </p>
                                </body>
                            </html>
                            `, // html body
                });
                
                console.log("Appointment email sent... ", info.messageId);
                let pno = appointmentBody?.phoneNo?.replace('+91', "");
                let body = `
                    Hi ${appointmentBody?.name},

                    Your appointment for ${moment('2023-10-06T23:54:20.334+0530').format('DD MMM YYYY')}, ${appointmentBody?.requestedAppointmentDate} has been requested.

                    We're excited to receive your appointment request. Our expert team will swiftly confirm your appointment details and provide guidance.

                    Regards,
                    Team Ayurcentral
                `
                await sendSms(pno, body);
            } catch (error) {
                console.log("Error sending appointment email : ", error.message);
            }
                
            res.json({ msg: 'Appointment created successfully!', appointment: appointment });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);

// @route    POST api/appointment/create/branchAdmin
// @desc     Create appointment
// @access   Public
router.post(
    '/create/byPatientId',
    // checkClientId,
    // check('name', 'Name is required').notEmpty(),
    // check('phoneNo', 'Phone no. is required').notEmpty(),
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

            // const Appointment = getAppointmentModel(req.headers.client_id);

            
            
            let doctor = await Doctors.findOne({ _id: appointmentBody.doctor });
            // console.log(doctor.docotorName)
            let patient = await Patients.findOne({ _id: appointmentBody.patient });
            // console.log({patient})
            let clinic = await Clinics.findOne({ _id: appointmentBody.clinic });
            // console.log({clinic})

            let meetingId = "-";
            let paymentStatus = "-";
            let paymentLink = "";

            if (appointmentBody.appointmentType === 'Online') {
                try {
                    meetingId = await createMeeting();
                    const payBody = {
                        contact: patient.patientPhoneNo,
                        email: patient.patientEmail,
                        id: appointmentId,
                        amount: doctor.doctorConsultationFee,
                        phoneNo: patient.patientPhoneNo,
                        description: `Online Consultation - ${doctor.doctorName} | AyurCentral`
                    }
                    paymentLink = await generatePaymentLink(payBody);
                    paymentStatus = "Pending";
                    console.log('Meeting Id : ', meetingId);
                    console.log('Payment Link : ', paymentLink);
                } catch (error) {
                    console.log('Error generating meeting id : ', error);
                }
            }

            let appObj = {
                ...appointmentBody,
                patientName: patient.patientName,
                patientEmail: patient.patientEmail,
                patientPhoneNo: patient.patientPhoneNo,
                patientGender: patient.patientGender,
                appointmentId: appointmentId,
                scheduledAppointmentDate: appointmentBody.scheduledAppointmentDate,
                scheduledAppointmentTime: appointmentBody.scheduledAppointmentTime,
                appointmentType: appointmentBody.appointmentType,
                appointmentChannel: appointmentBody.appointmentChannel,
                videoConsultationId: meetingId,
                paymentStatus: paymentStatus,
                clinic: clinic.clinicName,
                patient: appointmentBody.patient,
                doctor: doctor.doctorName,
                paymentLink: paymentLink
            }

            let appointment = new Appointment({
                ...appObj
            });

            await appointment.save();

            // res.json({ msg: 'Appointment created successfully!', appointment: appointment });
            
            console.log(appointment)
            const { subject, body, whatsAppTemplate, params, link } = getEmailSubjectBody(appointment, doctor, patient, clinic);

            // When there's no email body to be sent, dont send
            // TODO: In future handle this properly in getEmailSubjectBody() method;

            if (!body) {
                res.json({ msg: 'Appointment created successfully!', appointment: appointment });
                return;
            }

            try {
                let info = await EmailService.sendMail({
                    from: `"${organisation}" <${email}>`, // sender address
                    to: `${ patient?.patientName }, ${ patient?.patientEmail}`, // list of receivers
                    // cc: `${email}`,
                    bcc: `${ bccemail }`,
                    subject: subject, // Subject line
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
                                        Dear ${patient?.patientName}, 

                                        Greetings from AyurCentral - India's largest chain of Ayurvedic Clinics & Pharmacies. 
                                        
                                        ${body}
                                    </p>
                                    
                                    <p style="white-space: pre-line;">
                                        - Team AyurCentral
                                    </p>
                                </body>
                            </html>
                            `, // html body
                });
                
                console.log("Appointment email sent... ", info.messageId);

                try {
                    const resp = await sendWhatsAppMsg(patient?.patientPhoneNo, "", whatsAppTemplate, params, link);

                    console.log("Appointment whatapp msg sent... ", resp.data);
                } catch (e) {
                    console.log("Error sending appointment whatsapp msg : ", e.error);
                }
                
            } catch (error) {
                console.log("Error sending appointment email : ", error.message);
            }
                
            res.json({ msg: 'Appointment created successfully!', appointment: appointment });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);

// @route    POST api/appointment/updateStatus
// @desc     Update appointment status
// @access   Public
router.post(
    '/updateStatus',
    checkClientId,
    check('id', 'appointment id is required').notEmpty(),
    check('status', 'appointment status is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const appointmentBody = req.body;
        const id = appointmentBody.id;
        const status = appointmentBody.status;

        // TODO:// Future
        // Check if there is duplicate appoints using phone and email
        try {
            // const Appointment = getAppointmentModel(req.headers.client_id);
            let appointment = await Appointment.findOne({ appointmentId: id });

            if (!appointment) {
                return res.status(400).json({ msg: 'appointment not found!' });
            }
            
            appointment.appointmentStatus = status;
            await appointment.updateOne({ appointmentStatus: status });
            // res.json({ msg: 'Appointment Status Updated!', appointment: appointment });

            if (status !== "approved") {
                res.json({ msg: 'Appointment updated successfully!', appointment: appointment });
                return;
            }

            try {
                let info = await EmailService.sendMail({
                    from: `"${organisation}" <${email}>`, // sender address
                    to: `${ appointment?.name }, ${ appointment?.email }`, // list of receivers
                    // cc: `${email}`,
                    bcc: `${ bccemail }`,
                    subject: 'Appointment Request - Confirmed', // Subject line
                    text: `There is a new appointment scheduled for ${appointment?.name} on ${moment(appointment?.appointmentDate).format('DD MMM YYYY, ddd')}`, // plain text body
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
                                        Dear ${appointment?.name }, 

                                        We’re pleased to confirm your teleconsultation with Dr. Pampa Sreeshankar. Please find the details below. 

                                        Date: ${moment(appointment?.appointmentDate).format('DD MMM YYYY, ddd')}
                                        Time: ${appointment?.appointmentTime}
                                        Teleconsultation Link: http://bitly.ws/RF92

                                        Please ensure you are in a quiet and comfortable environment for your teleconsultation. At the scheduled time, simply click on the provided link to join the session. 

                                        Dr. Pampa Sreeshankar will be available to discuss your health concerns, provide guidance, and create a personalized plan to support your wellness goals.

                                        If you have any questions or need assistance, please don't hesitate to reach out to us at 080-2234 2334. 
                                    </p>
                                    <br />
                                    <table>
                                        <tr>
                                            <td>Name</td>
                                            <td>${appointment?.name}</td>
                                        </tr>
                                        <tr>
                                            <td>Phone Number</td>
                                            <td><a href='tel:${appointment?.phoneNo}'>${appointment?.phoneNo}</a></td>
                                        </tr>
                                        <tr>
                                            <td>Email</td>
                                            <td>${appointment?.email ?? ''}</td>
                                        </tr>
                                        <tr>
                                            <td>Appointment Date</td>
                                            <td>${moment(appointment?.appointmentDate).format('DD MMM YYYY, ddd')}</td>
                                        </tr>
                                        <tr>
                                            <td>Appointment Time</td>
                                            <td>${appointment?.appointmentTime}</td>
                                        </tr>
                                        <tr>
                                            <td>Appointment Status</td>
                                            <td>${appointment?.appointmentStatus}</td>
                                        </tr>
                                    </table>
                                    <p style="white-space: pre-line;">
                                        Thank you,
                                        Dr. Pampa Sreeshankar 
                                        BAMS, MD (Ayurveda)
                                    </p>
                                </body>
                            </html>
                            `, // html body
                });
                
                console.log("Appointment email sent... ", info.messageId);
            } catch (error) {
                console.log("Error sending appointment email : ", error.message);
            }
                
            res.json({ msg: 'Appointment updated successfully!', appointment: appointment });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);

// @route    POST api/appointment/sendReminder
// @desc     Update appointment status
// @access   Public
router.post(
    '/sendReminder',
    checkClientId,
    check('id', 'appointment id is required').notEmpty(),
    check('status', 'appointment status is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const appointmentBody = req.body;
        const id = appointmentBody.id;
        const status = appointmentBody.status;

        // TODO:// Future
        // Check if there is duplicate appoints using phone and email
        try {
            // const Appointment = getAppointmentModel(req.headers.client_id);
            let appointment = await Appointment.findOne({ appointmentId: id });

            if (!appointment) {
                return res.status(400).json({ msg: 'appointment not found!' });
            }
            
            appointment.appointmentStatus = status;
            await appointment.updateOne({ appointmentStatus: status });
            // res.json({ msg: 'Appointment Status Updated!', appointment: appointment });

            if (status !== "approved") {
                res.json({ msg: 'Appointment updated successfully!', appointment: appointment });
                return;
            }

            try {
                let info = await EmailService.sendMail({
                    from: `"${organisation}" <${email}>`, // sender address
                    to: `${ appointment?.name }, ${ appointment?.email }`, // list of receivers
                    // cc: `${email}`,
                    bcc: `${ bccemail }`,
                    subject: 'Appointment Request - Confirmed', // Subject line
                    text: `There is a new appointment scheduled for ${appointment?.name} on ${moment(appointment?.appointmentDate).format('DD MMM YYYY, ddd')}`, // plain text body
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
                                        Dear ${appointment?.name }, 

                                        We’re pleased to confirm your teleconsultation with Dr. Pampa Sreeshankar. Please find the details below. 

                                        Date: ${moment(appointment?.appointmentDate).format('DD MMM YYYY, ddd')}
                                        Time: ${appointment?.appointmentTime}
                                        Teleconsultation Link: http://bitly.ws/RF92

                                        Please ensure you are in a quiet and comfortable environment for your teleconsultation. At the scheduled time, simply click on the provided link to join the session. 

                                        Dr. Pampa Sreeshankar will be available to discuss your health concerns, provide guidance, and create a personalized plan to support your wellness goals.

                                        If you have any questions or need assistance, please don't hesitate to reach out to us at 080-2234 2334. 
                                    </p>
                                    <br />
                                    <table>
                                        <tr>
                                            <td>Name</td>
                                            <td>${appointment?.name}</td>
                                        </tr>
                                        <tr>
                                            <td>Phone Number</td>
                                            <td><a href='tel:${appointment?.phoneNo}'>${appointment?.phoneNo}</a></td>
                                        </tr>
                                        <tr>
                                            <td>Email</td>
                                            <td>${appointment?.email ?? ''}</td>
                                        </tr>
                                        <tr>
                                            <td>Appointment Date</td>
                                            <td>${moment(appointment?.appointmentDate).format('DD MMM YYYY, ddd')}</td>
                                        </tr>
                                        <tr>
                                            <td>Appointment Time</td>
                                            <td>${appointment?.appointmentTime}</td>
                                        </tr>
                                        <tr>
                                            <td>Appointment Status</td>
                                            <td>${appointment?.appointmentStatus}</td>
                                        </tr>
                                    </table>
                                    <p style="white-space: pre-line;">
                                        Thank you,
                                        Dr. Pampa Sreeshankar 
                                        BAMS, MD (Ayurveda)
                                    </p>
                                </body>
                            </html>
                            `, // html body
                });
                
                console.log("Appointment email sent... ", info.messageId);
            } catch (error) {
                console.log("Error sending appointment email : ", error.message);
            }
                
            res.json({ msg: 'Appointment updated successfully!', appointment: appointment });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);

// @route    POST api/appointment/sendRx
// @desc     Update appointment status
// @access   Public
router.post(
    '/sendRx',
    checkClientId,
    check('id', 'appointment id is required').notEmpty(),
    check('prescription', 'prescription is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const appointmentBody = req.body;
        const id = appointmentBody.id;
        const prescription = appointmentBody.prescription;

        // TODO:// Future
        // Check if there is duplicate appoints using phone and email
        try {
            // const Appointment = getAppointmentModel(req.headers.client_id);
            let appointment = await Appointment.findOne({ appointmentId: id });

            if (!appointment) {
                return res.status(400).json({ msg: 'appointment not found!' });
            }
            
            await appointment.updateOne({ prescription: prescription });
            // res.json({ msg: 'Appointment Status Updated!', appointment: appointment });

            // if (status !== "approved") {
            //     res.json({ msg: 'Appointment updated successfully!', appointment: appointment });
            //     return;
            // }

            try {
                let info = await EmailService.sendMail({
                    from: `"${organisation}" <${email}>`, // sender address
                    to: `${ appointment?.name }, ${ appointment?.email }`, // list of receivers
                    // cc: `${email}`,
                    bcc: `${ bccemail }`,
                    attachments: [{
                        filename: `Rx From Dr. Pampa Sreeshankar's Clinic.pdf`,
                        // path: `./../assets/Rx From Dr. Pampa Sreeshankar's Clinic.pdf`,
                        path: path.join(__dirname, `./Rx From Dr. Pampa Sreeshankar's Clinic.pdf`),
                        contentType: 'application/pdf'
                    }],
                    subject: 'Appointment Request - PFA - Prescription', // Subject line
                    text: `There is a new appointment scheduled for ${appointment?.name} on ${moment(appointment?.appointmentDate).format('DD MMM YYYY, ddd')}`, // plain text body
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
                                        Dear ${appointment?.name}, 

                                        Here's your personalized Ayurvedic prescription from Dr. Pampa Sreeshankar. To make it convenient for you, you can order your prescribed medicines directly from our online store attached below.
                                        
                                        If you have any questions or need assistance, please don't hesitate to reach out to us at 080-2234 2334. 
                                    </p>
                                    <p style="white-space: pre-line;">
                                        Thank you,
                                        Dr. Pampa Sreeshankar 
                                        BAMS, MD (Ayurveda)
                                    </p>
                                    <br /><br />
                                    <div style="display: flex;">
                                        <div style="
                                            display: block;
                                            flex-direction: column;
                                            border: 1px solid gray;
                                            padding: 1rem;
                                            width: 10rem;
                                            height: 31rem;"
                                        >
                                            <div style="height: 40%;
                                                    aspect-ratio: 9/10;
                                                    object-fit: contain;">
                                                <img
                                                    style="height: 80%;"
                                                    src="https://ayurcentralonline.com/wp-content/uploads/2022/07/4958-350x350.png"
                                                    alt=""
                                                />
                                            </div>
                                            <h2 style="font-size: small;">Abana Tablet (60Tabs) – Himalaya</h2>
                                            <div style="display: flex;">
                                                <p style="margin-right: 0.6rem;color: rgb(250,144,22);text-decoration:line-through;">₹175.00</p>
                                                <p style="margin-right: 0.6rem;">₹155.00</p>
                                            </div>
                                            <p style="font-size: small;
                                                display: -webkit-box;
                                                -webkit-line-clamp: 3;
                                                -webkit-box-orient: vertical;  
                                                overflow: hidden;
                                                height: 8rem;"
                                            >
                                                    ABANA TABLET (60Tabs) by HIMALAYA is an ayurvedic antihyperlipidemic
                                                    drug.
                                            </p>
                                            <a
                                                style="display: flex;
                                                justify-content: center;
                                                text-decoration: none;
                                                color: black;
                                                border-radius: 5px;
                                                padding: 0.5rem 3rem;
                                                background-color: rgb(250,144,22, 0.7);"
                                                href="https://ayurcentralonline.com/product/abana-tablet-himalaya/"
                                            >
                                                Order Now
                                            </a>
                                        </div>
                                        <div style="display: block;
                                            flex-direction: column;
                                            border: 1px solid gray;
                                            padding: 1rem;
                                            width: 10rem;
                                            flex-direction: column;
                                            height: 31rem;"
                                            >
                                            <div style="height: 40%;
                                                aspect-ratio: 9/10;
                                                object-fit: contain;">
                                                <img
                                                    style="height: 80%;"
                                                    src="https://ayurcentralonline.com/wp-content/uploads/2023/03/Akeek-Bhasma-5Gm-Baidyanath-350x350.jpg"
                                                    alt=""
                                                />
                                            </div>
                                            <h2 style="font-size: small;">Akeek Bhasma (5Gm) – Baidyanath</h2>
                                            <div style="display: flex;">
                                                <p style="margin-right: 0.6rem; color: rgb(250,144,22);text-decoration: line-through;">₹70.00</p>
                                                <p style="margin-right: 0.6rem;">₹65.00</p>
                                            </div>
                                            <p style="font-size: small;
                                                display: -webkit-box;
                                                -webkit-line-clamp: 3;
                                                -webkit-box-orient: vertical;  
                                                overflow: hidden;
                                                height: 8rem;"
                                            >
                                                Baidyanath Akik Bhasma is an ayurvedic medicine that is primarily
                                                used for the treatment of Heart Disease, Brain and Nervous System
                                                disorders.
                                            </p>
                                            <a
                                                style="display: flex;
                                                justify-content: center;
                                                text-decoration: none;
                                                color: black;
                                                border-radius: 5px;
                                                padding: 0.5rem 3rem;
                                                background-color: rgb(250,144,22, 0.7);"
                                                href="https://ayurcentralonline.com/product/akeek-bhasma-5gm-baidyanath/"
                                            >
                                                Order Now
                                            </a>
                                        </div>
                                        <div style="display: block;
                                            flex-direction: column;
                                            border: 1px solid gray;
                                            padding: 1rem;
                                            width: 10rem;
                                            flex-direction: column;
                                            height: 31rem;"
                                        >
                                            <div style="height: 40%;
                                                aspect-ratio: 9/10;
                                                object-fit: contain;"
                                            >
                                                <img
                                                    style="height: 80%;"
                                                    src="https://ayurcentralonline.com/wp-content/uploads/2022/07/7155-350x350.jpg"
                                                    alt=""
                                                />
                                            </div>
                                            <h2 style="font-size: small;">Ancholean Tab (60Tabs) – Sri Sri Tattva</h2>
                                            <div style="display: flex;">
                                                <p style="margin-right: 0.6rem; color: rgb(250,144,22);text-decoration: line-through;">₹250.00</p>
                                                <p style="margin-right: 0.6rem;">₹240.00</p>
                                            </div>
                                            <p style="font-size: small;
                                                display: -webkit-box;
                                                -webkit-line-clamp: 3;
                                                -webkit-box-orient: vertical;  
                                                overflow: hidden;
                                                height: 8rem;"
                                            >
                                                ANCHOLEAN TAB by SRI SRI AYURVEDA is an ayurvedic proprietary
                                                medicine.
                                            </p>
                                            <a
                                                href="https://ayurcentralonline.com/product/ancholean-tab-60tabs-sri-sri-ayurveda/"
                                                style="display: flex;
                                                justify-content: center;
                                                text-decoration: none;
                                                color: black;
                                                border-radius: 5px;
                                                padding: 0.5rem 3rem;
                                                background-color: rgb(250,144,22, 0.7);"
                                            >
                                                Order Now
                                            </a>
                                        </div>
                                        <div style="display: block;
                                            flex-direction: column;
                                            border: 1px solid gray;
                                            padding: 1rem;
                                            width: 10rem;
                                            flex-direction: column;
                                            height: 31rem;">
                                            <div style="height: 40%;
                                                aspect-ratio: 9/10;
                                                object-fit: contain;"
                                            >
                                                <img
                                                    style="height: 80%;"
                                                    src="https://drpampasreeshankar.myshopify.com/cdn/shop/files/1.jpg?v=1691775431&width=150"
                                                    alt=""
                                                />
                                            </div>
                                            <h2 style="font-size: small;">Chyavanprash (Leyham) 500 Gm</h2>
                                            <div style="display: flex;">
                                                <p style="margin-right: 0.6rem; color: rgb(250,144,22);text-decoration: line-through;">₹250.00</p>
                                                <p style="margin-right: 0.6rem;">₹237.00</p>
                                            </div>
                                            <p style="font-size: small;
                                                display: -webkit-box;
                                                -webkit-line-clamp: 3;
                                                -webkit-box-orient: vertical;  
                                                overflow: hidden;
                                                height: 8rem;"
                                            >
                                                Can improve immunity. Helps boost strength. Can enhance longevity.
                                                Authentic Ayurvedic recipe.
                                            </p>
                                            <a
                                                href="https://drpampasreeshankar.myshopify.com/products/chyavanprash-leyham-500-gm"
                                                style="display: flex;
                                                justify-content: center;
                                                text-decoration: none;
                                                color: black;
                                                border-radius: 5px;
                                                padding: 0.5rem 3rem;
                                                background-color: rgb(250,144,22, 0.7);"
                                            >
                                                Order Now
                                            </a>
                                        </div>
                                        <div style="display: block;
                                            flex-direction: column;
                                            border: 1px solid gray;
                                            padding: 1rem;
                                            width: 10rem;
                                            flex-direction: column;
                                            height: 31rem;"
                                        >
                                            <div style="height: 40%;
                                                aspect-ratio: 9/10;
                                                object-fit: contain;"
                                            >
                                                <img
                                                    style="height: 80%;"
                                                    src="https://drpampasreeshankar.myshopify.com/cdn/shop/files/4.1.jpg?v=1691776924&width=360"
                                                    alt=""
                                                />
                                            </div>
                                            <h2 style="font-size: small;">Dhanwantharam Gulika (Tablets) 50 Nos</h2>
                                            <div style="display: flex;">
                                                <p style="margin-right: 0.6rem; color: rgb(250,144,22);text-decoration: line-through;">₹125.00</p>
                                                <p style="margin-right: 0.6rem;">115.00</p>
                                            </div>
                                            <p style="font-size: small;
                                                display: -webkit-box;
                                                -webkit-line-clamp: 3;
                                                -webkit-box-orient: vertical;  
                                                overflow: hidden;
                                                height: 8rem;"
                                            >
                                                Relieves bloating and gas. Eases heartburn and acid reflux. Can
                                                reduce stomach pain because of gas and heaviness.
                                            </p>
                                            <a
                                                href="https://drpampasreeshankar.myshopify.com/products/chyavanprash-leyham-500-gm"
                                                style="display: flex;
                                                justify-content: center;
                                                text-decoration: none;
                                                color: black;
                                                border-radius: 5px;
                                                padding: 0.5rem 3rem;
                                                background-color: rgb(250,144,22, 0.7);"
                                            >
                                                Order Now
                                            </a>
                                        </div>
                                    </div>
                                </body>
                            </html>
                            `, // html body
                });
                
                console.log("Appointment email sent... ", info.messageId);
            } catch (error) {
                console.log("Error sending appointment email : ", error.message);
            }
                
            res.json({ msg: 'rx sent successfully!', appointment: appointment });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);

// @route    POST api/appointment/saveRx
// @desc     Update appointment status
// @access   Public
router.post(
    '/saveRx',
    check('patient', 'patient is required').notEmpty(),
    // check('appointment', 'appointment is required').notEmpty(),
    check('prescription', 'prescription is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const body = req.body instanceof String ? JSON.stringify(req.body) : req.body;
        // const id = body.appointment.appointmentId;
        const patient = body.patient;
        const prescription = body.prescription;
        const patientNextVisitDate = body.nextVisitDate;

        // TODO:// Future
        // Check if there is duplicate appoints using phone and email
        try {
            // const Appointment = getAppointmentModel(req.headers.client_id);
            let appointment = await Appointment.findOne({ patientPhoneNo: patient.patientPhoneNo });
            // TODO: Add doctor details
            let doctor = {}
            // let doctor = await Doctors.findOne({ doctorName: appointment.doctor });
            let foundPatient = await Patients.findOne({ patientPhoneNo: patient.patientPhoneNo });

            // if (!appointment) {
            //     return res.status(400).json({ msg: 'appointment not found!' });
            // }
            
            // await appointment.updateOne({ prescription: prescription });
            let temp = foundPatient.patientPrescriptions;
            temp.push(prescription);
            await foundPatient.updateOne({ patientPrescriptions: temp, patientNextVisitDate: patientNextVisitDate });
            // res.json({ msg: 'Appointment Status Updated!', appointment: appointment });

            // if (status !== "approved") {
            //     res.json({ msg: 'Appointment updated successfully!', appointment: appointment });
            //     return;
            // }

            try {
                let info = await EmailService.sendMail({
                    from: `"${organisation}" <${email}>`, // sender address
                    to: `${ foundPatient?.patientName }, ${ foundPatient?.patientEmail }`, // list of receivers
                    // cc: `${email}`,
                    bcc: `${ bccemail }`,
                    attachments: [{
                        filename: `Prescription-${foundPatient?.patientName}`,
                        // path: `./../assets/Rx From Dr. Pampa Sreeshankar's Clinic.pdf`,
                        path: prescription.url,
                        contentType: prescription.type
                    }],
                    subject: 'Your AyurCentral Online Consultation Prescription and Medicines Ordering Details', // Subject line
                    // text: `There is a new appointment scheduled for ${foundPatient?.name} on ${moment(appointment?.appointmentDate).format('DD MMM YYYY, ddd')}`, // plain text body
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
                                        Dear ${foundPatient?.patientName}, 

                                        We wanted to express our heartfelt gratitude for choosing AyurCentral for your recent consultation. We value your trust and confidence in our services.

                                        Your prescription from AyurCentral is provided below for your convenience!
                                        
                                        Your prescribed medications are just a click away at our AyurCentral online store! Visit https://ayurcentralonline.com/ to place your order right away. Use code AYUR10 during checkout to enjoy a 10% discount and experience a seamless ordering process.
                                        
                                        Your feedback is incredibly important to us as it helps us improve and provide even better care in the future. Please click on the below to complete our brief feedback survey.
                                        
                                        Feedback Link: https://klr.bz/BAi9f/{kadvanced}
                                        
                                        If you require help with your order or have any queries about your prescription, please contact our support team at <a href="tel:+918049670477">+91 8049670477</a> for immediate assistance.
                                        
                                        Thank you once again for choosing AyurCentral. We look forward to hearing from you and hope to serve you again in the future.
                                    </p>
                                    <p style="white-space: pre-line;">
                                        - Team AyurCentral
                                    </p>
                                </body>
                            </html>
                            `, // html body
                });
                
                console.log("Appointment email sent... ", info.messageId);

                try {
                    
                    const params = `\"${ foundPatient?.patientName }\",\"${ prescription.url }\"`;
                    const mediaUrl = prescription.url.replace('https://firebasestorage.googleapis.com/v0/b/digiclinik-live.appspot.com/o/', '');
                    const resp = await sendWhatsAppMsg(foundPatient?.patientPhoneNo, "", whatsappTemplatesRepo.download_rx, params, mediaUrl);

                    console.log("Appointment whatapp msg sent... ", resp.data);
                } catch (e) {
                    console.log("Error sending appointment whatsapp msg : ", e.error);
                }
            } catch (error) {
                console.log("Error sending appointment email : ", error.message);
            }
                
            res.json({ msg: 'rx sent successfully!' });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);

// @route    POST api/appointment/saveRx
// @desc     Update appointment status
// @access   Public
router.post(
    '/sendApptStatusEmail',
    check('appointment', 'appointment is required').notEmpty(),
    // check('appointment', 'appointment is required').notEmpty(),
    // check('prescription', 'prescription is required').notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const body = req.body instanceof String ? JSON.stringify(req.body) : req.body;
        const appointmentBody = body.appointment;
        // const patient = body.patient;
        // const prescription = body.prescription;

        // TODO:// Future
        // Check if there is duplicate appoints using phone and email
        try {
            // const Appointment = getAppointmentModel(req.headers.client_id);
            let appointment = await Appointment.findOne({ appointmentId: appointmentBody.appointmentId });
            console.log()
            let doctor = await Doctors.findOne({ doctorName: appointment.doctor });
            let patient = await Patients.findOne({ patientPhoneNo: appointment.patientPhoneNo });
            let clinic = await Clinics.findOne({ clinicName: appointmentBody.clinic });

            if (!appointment) {
                return res.status(400).json({ msg: 'appointment not found!' });
            }

            if (appointment.appointmentStatus === "Cancelled") {
                return res.json({});
            }

            const { subject, body, whatsAppTemplate, params, link } = getEmailSubjectBody(appointment, doctor, appointment, clinic);
            
            try {
                let info = await EmailService.sendMail({
                    from: `"${organisation}" <${email}>`, // sender address
                    to: `${ appointment?.patientName }, ${ appointment?.patientEmail}`, // list of receivers
                    // cc: `${email}`,
                    bcc: `${ bccemail }`,
                    subject: subject, // Subject line
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
                                        Dear ${appointment?.patientName}, 

                                        Greetings from AyurCentral - India's largest chain of Ayurvedic Clinics & Pharmacies. 
                                        
                                        ${body}

                                    </p>
                                    
                                    <p style="white-space: pre-line;">
                                        - Team AyurCentral
                                    </p>
                                </body>
                            </html>
                            `, // html body
                });
                
                console.log("Appointment email sent... ", info.messageId);

                try {
                    const resp = await sendWhatsAppMsg(appointment?.patientPhoneNo, body, whatsAppTemplate, params, link);

                    console.log("Appointment whatapp msg sent... ", resp.dat);
                } catch (e) {
                    console.log("Error sending appointment whatsapp msg : ", e.error);
                }

                
            } catch (error) {
                console.log("Error sending appointment email : ", error.message);
            }
                
            res.json({ msg: 'Email sent successfully!', appointment: appointment });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error : ' + err.message);
        }
    }
);

function getEmailSubjectBody(appointmentBody, doctor , patient, clinic) {
    let op = {}
    if (appointmentBody.appointmentType === 'In-Person' && appointmentBody.appointmentChannel === 'Internal Ops') {
        op.subject = 'Appointment Request Confirmed - AyurCentral';
        op.body = `
            We are delighted to inform you that your appointment has been successfully confirmed with ${ doctor?.doctorName ?? "" } on ${ moment(appointmentBody?.scheduledAppointmentDate).format('D-M-yyyy') ?? "" } at ${ moment(appointmentBody?.scheduledAppointmentDate + "T" + appointmentBody?.scheduledAppointmentTime).format('hh:mm a') ?? "" }.
                                            
            Below are the details and contact information for your reference:

            Clinic Address: ${ clinic?.clinicAddress ?? "" }
            Clinic Phone Number: ${ clinic?.clinicPhoneNo ?? "" }
            Google Maps Location: ${ clinic?.clinicMapLink ?? "" }
            
            While anticipating your appointment, why not get to know your consulting doctor better? Visit their website at ${ doctor?.doctorWebsite ?? "" } to gain valuable insights into their practice.
            
            Thank you for choosing AyurCentral. We look forward to assisting you on your Ayurvedic journey.`;
        op.whatsAppTemplate = whatsappTemplatesRepo.ops_scheduled_offline;
        // op.params = `"${ patient?.patientName },${ doctor?.doctorName },${ moment(appointmentBody?.scheduledAppointmentDate).format('D-M-yyyy') },${ moment(appointmentBody?.scheduledAppointmentDate + "T" + appointmentBody?.scheduledAppointmentTime).format('hh:mm a') },${ clinic?.clinicPhoneNo }','${ clinic?.clinicMapLink }"`;
        op.params = `\"${ patient?.patientName }\",\"${ doctor?.doctorName }\",\"${ moment(appointmentBody?.scheduledAppointmentDate).format('D-M-yyyy') }\",\"${ moment(appointmentBody?.scheduledAppointmentDate + "T" + appointmentBody?.scheduledAppointmentTime).format('hh:mm a') }\",\"${ clinic?.clinicPhoneNo }\",\"${ clinic?.clinicMapLink }\"`;
        op.link = clinic?.clinicMapLink.replace('https://maps.app.goo.gl/', '');
    }
        
    if (appointmentBody.appointmentType === 'In-Person' && appointmentBody.appointmentChannel === 'Direct Walkin') {
        op.subject = 'Appointment Request Confirmed - AyurCentral';
        op.body = `
        We are delighted to inform you that your appointment has been successfully confirmed with ${doctor?.doctorName ?? ""} on ${moment(appointmentBody?.scheduledAppointmentDate).format('D-M-yyyy') ?? ""} at ${ moment(appointmentBody?.scheduledAppointmentDate + "T" +appointmentBody?.scheduledAppointmentTime).format('hh:mm a') ?? ""}.

        Thank you for choosing AyurCentral for your healthcare needs. We're here to support you every step of the way.`
        op.whatsAppTemplate = whatsappTemplatesRepo.direct_walkin;
        op.params = `\"${patient?.patientName}\",\"${doctor?.doctorName}\",\"${moment(appointmentBody?.scheduledAppointmentDate).format('D-M-yyyy')}\",\"${ moment(appointmentBody?.scheduledAppointmentDate + "T" +appointmentBody?.scheduledAppointmentTime).format('hh:mm a')}\"`;
    }

    if (appointmentBody.appointmentType === 'Online' && appointmentBody.appointmentStatus === 'Scheduled' && appointmentBody.paymentStatus === 'Pending') {
        op.subject = 'Appointment Request Confirmed - AyurCentral';
        op.body = `We are delighted to inform you that your appointment has been successfully confirmed with ${ doctor?.doctorName ?? "" } on ${ moment(appointmentBody?.scheduledAppointmentDate).format('D-M-yyyy') ?? "" } at ${ moment(appointmentBody?.scheduledAppointmentDate + "T" + appointmentBody?.scheduledAppointmentTime).format('hh:mm a') ?? "" }.

        To confirm your online appointment, we request you to make the payment through the provided link.
    
        Payment Link: ${appointmentBody?.paymentLink}
        
        Upon payment confirmation, the video call details will be sent to you, allowing you to connect with your ${ doctor?.doctorName ?? "" } on ${ moment(appointmentBody?.scheduledAppointmentDate).format('D-M-yyyy') ?? "" } at ${ moment(appointmentBody?.scheduledAppointmentDate + "T" + appointmentBody?.scheduledAppointmentTime).format('hh:mm a') ?? "" }
        
        While anticipating your appointment, why not get to know your consulting doctor better? Visit their website at ${ doctor?.doctorWebsite ?? "" } to gain valuable insights into their practice.
        
        Thank you for choosing AyurCentral for your healthcare needs. We're here to support you every step of the way.`;
        op.whatsAppTemplate = whatsappTemplatesRepo.appointment_payment;
        // op.params = `"${ patient?.patientName },${ doctor?.doctorName },${ moment(appointmentBody?.scheduledAppointmentDate).format('D-M-yyyy')},${ moment(appointmentBody?.scheduledAppointmentDate + "T" + appointmentBody?.scheduledAppointmentTime).format('hh:mm a') },'https://rzp.io/i/QBrFF4nQr'"`;
        op.params = `\"${ patient?.patientName }\",\"${ doctor?.doctorName }\",\"${ moment(appointmentBody?.scheduledAppointmentDate).format('D-M-yyyy') }\",\"${ moment(appointmentBody?.scheduledAppointmentDate + "T" + appointmentBody?.scheduledAppointmentTime).format('hh:mm a') }\",\"${appointmentBody?.paymentLink}\"`;
        op.link = appointmentBody?.paymentLink.replace('https://rzp.io/i/', '');
    }

    if (appointmentBody.appointmentType === 'Online' && appointmentBody.paymentStatus === 'Completed' && appointmentBody.paymentStatus === 'Completed') {
     
        op.subject = 'Appointment Request Confirmed - AyurCentral';
        op.body = `We are thrilled to let you know that we have received your payment for the upcoming online consultation with AyurCentral. Your appointment is now confirmed, and we sincerely appreciate your trust in our services.

        To join the virtual consultation at the scheduled time, click on the provided video consultation link. 
    
        Video Consultation Link: https://consultations.web.app/${ appointmentBody?.videoConsultationId ?? "-" }
    
        At the scheduled time, click on the provided video consultation link to join the virtual waiting room. Please be in a quiet, well-lit area with a stable internet connection during your appointment. Check your camera, microphone, and internet beforehand to avoid technical issues.
    
        If you encounter any technical difficulties, please contact our support team at 080-37156655 for immediate assistance.
    
        Thank you for choosing AyurCentral for your healthcare needs. We're here to support you every step of the way.`;
        op.whatsAppTemplate = whatsappTemplatesRepo.send_vc_after_payment;
        // op.params = `"${ patient?.patientName },${ moment(appointmentBody?.scheduledAppointmentDate).format('D-M-yyyy')},${ moment(appointmentBody?.scheduledAppointmentDate + "T" + appointmentBody?.scheduledAppointmentTime).format('hh:mm a')},'https://consultations.web.app/${ appointmentBody?.videoConsultationId ?? "-" }'"`;
        op.params = `\"${ patient?.patientName }\",\"${ moment(appointmentBody?.scheduledAppointmentDate).format('D-M-yyyy') }\",\"${ moment(appointmentBody?.scheduledAppointmentDate + "T" + appointmentBody?.scheduledAppointmentTime).format('hh:mm a') }\",\"https://consultations.web.app/${ appointmentBody?.videoConsultationId ?? "-" }\"`;
        op.link = appointmentBody?.videoConsultationId
    }
        

    if (appointmentBody.appointmentStatus === 'Completed') {
        op.subject = 'Thank You for Choosing AyurCentral: Your Feedback Matters';
        op.body = `We wanted to express our heartfelt gratitude for choosing AyurCentral for your recent consultation. We value your trust and confidence in our services.

        Your feedback is incredibly important to us as it helps us improve and provide even better care in the future. Please click on the below to complete our brief feedback survey.
        
        Feedback Link: https://klr.bz/BAi9f/{kadvanced}
        
        If there's anything else you would like to share or if you have further questions, please feel free to reply to this email. We are here to assist you.
        
        Thank you once again for choosing AyurCentral. We look forward to hearing from you and hope to serve you again in the future.`;
        op.whatsAppTemplate = whatsappTemplatesRepo.feedback;
        op.params = patient?.patientName;
        op.link = 'https://klr.bz/BAi9f/{kadvanced}'
    }


    return op;
}

// @route   GET api/appointment/filter
// @desc    Get all appointments 
// @access  Public
router.post('/filter', async (req, res) => {
    try {
        // const Appointment = getAppointmentModel(req.headers.client_id);
        const body = req.body instanceof String ? JSON.stringify(req.body) : req.body;
        const appointments = await Appointment.find({...body})

        if (appointments.length == 0) {
            return res.status(400).json([]);
        }

        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
});

router.get('/sendEmail', async (req, res) => {
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

router.get('/sendSms', async (req, res) => {
    try {
        await sendSms("9036360233", "body");
        
        res.json({ msg: 'Sms Sent' })

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
})

router.get('/sendWhatsAppMessage', async (req, res) => {
    try {
        const v1 = "v1";
        const v2 = "v2";
        const v3 = "v3";
        const v4 = "v4";
        const v5 = "https://rzp.io/l/bjakfkdkh";
        const params = `\"${v1}\",\"${v2}\",\"${v3}\",\"${v4}\",\"${v5}"`;
        await sendWhatsAppMsg("9036360233", "body", whatsappTemplatesRepo.appointment_payment, params, 'https://rzp.io/l/bjakfkdkh');
        
        res.json({ msg: 'Sms Sent' })

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
})

router.get('/generatePaymentLink', async (req, res) => {
    try {
        const payBody = {
            contact: "9036360233",
            email: "l.shivkumarreddy@gmail.com",
            amount: 30000,
            phoneNo: "9036360233",
            description: `Online Consultation - ${'Shiva'} | AyurCentral`
        }
        const paymentLink = await generatePaymentLink(payBody);
        
        res.json({ msg: 'payment link generated', paymentLink: paymentLink})

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
})

router.get('/report', async (req, res) => {
    try {
        let appointments = await Appointment.find({ scheduledAppointmentDate: "2023-10-20" });
        let patients = await Patients.find();

        // appointments.map((e) => {
        //     return { name: e.patientName, date: new Date(e.creationDate).toLocaleDateString() }
        // })

        patients.map((e) => {
            return { name: e.patientName, date: new Date(e.creationDate).toLocaleDateString() }
        })
        
        res.json(patients)

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error : ' + err.message);
    }
})

module.exports = router;
