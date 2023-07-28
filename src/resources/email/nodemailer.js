
const nodemailer = require('nodemailer');
const logger = require("../../libraries/logger");
const jwt = require("jsonwebtoken");
const { th } = require('date-fns/locale');
require("dotenv").config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

const sendEmail = async (email,sellerId) => {
    try {
        const verification_token = jwt.sign(
            { seller : { id: sellerId } },
            process.env.JWT_ACCOUNT_ACTIVATION,
            { expiresIn: "30m" }
        );
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Account activation link",
            html: `
            <h1>Please use the following link to verify your account</h1>
            <p>${process.env.CLIENT_URL}/seller/verify/${verification_token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>${process.env.CLIENT_URL}</p>
            `,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        logger.error(error);
        throw error;
    }
}
module.exports = {
    sendEmail
}
