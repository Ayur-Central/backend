const nodemailer = require("nodemailer");
const config = require('config');
const email = config.get('email');
const password = config.get('password');

// create reusable transporter object using the default SMTP transport
let EmailService = nodemailer.createTransport({
    service: 'gmail',
    user: 'smpt.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'Login',
        user: email, // email
        pass: password, // password
    },
});

module.exports = EmailService;