const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'jakubpadlo4@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    });
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'jakubpadlo4@gmail.com',
        subject: `Goodbye ${name}!`,
        text: 'Your account has been removed. Is anything what we can do to kept you on board?'
    });
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
};