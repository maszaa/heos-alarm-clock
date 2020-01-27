const { execSync } = require('child_process');

function emailLogger() {
  execSync('npm install --no-save nodemailer');

  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix'
  });

  return async (message) => {
    await transporter.sendMail({
      from: '...',
      to: '...',
      subject: 'HEOS Alarm Clock error',
      text: message
    }).catch(console.error);
  }
}

module.exports = {
  debug: console.log,
  info: console.info,
  warn: console.warn,
  error: [emailLogger(), console.error]
};
