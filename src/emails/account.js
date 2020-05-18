const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    const emailDetail = {
        to: email,
        from: 'lohitb@outlook.com',
        subject: 'Welcome mail from task manager',
        text: `hi ${name},`,
        html: '<strong>this is welcome mail</strong>',
    }
    return sgMail.send(emailDetail)
};

module.exports = { sendWelcomeEmail };



