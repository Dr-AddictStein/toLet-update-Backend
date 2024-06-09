const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: "smtp.forwardemail.net",
    service: 'gmail',
    port: 465,
    secure: true,
    auth: {
        user: "1aklimakter@gmail.com",
        pass: "ostad baye plastic hahaha",
    },
});

module.exports = transporter