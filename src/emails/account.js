/*jshint esversion: 6 */
/*jshint esversion: 7 */
/*jshint esversion: 8 */
/* jshint -W097 */
/* jshint -W117 */
'use strict';

const sgMail = require('@sendgrid/mail');

console.log(process.env.PORT);
console.log(process.env.SENDGRID_API_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = async (email,name) => {
    const msg = {
        to: email,
        from: 'akmathur553@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name} Let me know how you get along with the app.`
    };
    try {
        await sgMail.send(msg);
    } catch (e) {
        console.log(e.toString());
    }
};

const sendCancellationEmail = async (email,name) => {
    const msg = {
        to: email,
        from: 'akmathur553@gmail.com',
        subject: 'Hope you enjoyed the App!',
        text: `Adios Amigo! Hope to see you again soon, ${name}.`
    };
    try {
        await sgMail.send(msg);
    } catch (e) {
        console.log(e.toString());
    }
};

//sendWelcomeEmail();

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
};

// sgMail.send(msg).then(() => {
//     console.log('Message sent');
// }).catch((error) => {
//     console.log(error.response.body);
//     // console.log(error.response.body.errors[0].message)
// });