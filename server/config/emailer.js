var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://noreply.fmfa%40gmail.com:fmf4__dev@smtp.gmail.com');

// setup e-mail data with unicode symbols


// send mail with defined transport object
module.exports = transporter;


