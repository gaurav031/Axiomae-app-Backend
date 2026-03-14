const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });

    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    logger.info({ email: options.email, subject: options.subject }, 'Attempting to send email via SMTP');
    
    try {
        const info = await transporter.sendMail(message);
        logger.info({ messageId: info.messageId, response: info.response }, 'Email sent successfully via SMTP');
        return info;
    } catch (err) {
        logger.error({ err, email: options.email }, 'SMTP sendMail failed');
        throw err;
    }
};

module.exports = sendEmail;
