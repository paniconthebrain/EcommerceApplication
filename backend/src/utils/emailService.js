const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const useGmail = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    && process.env.GMAIL_USER !== 'your-gmail@gmail.com';

  if (useGmail) {
    // Production: real Gmail SMTP
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    console.log('✓ Email: using Gmail SMTP');
  } else {
    // Development: fixed Ethereal inbox
    const user = process.env.ETHEREAL_USER;
    const pass = process.env.ETHEREAL_PASS;
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user, pass },
    });
    console.log('✓ Email: using Ethereal test inbox');
    console.log(`  View emails at: https://ethereal.email/messages`);
    console.log(`  Login → user: ${user} | pass: ${pass}`);
  }

  return transporter;
}

function resolvePlaceholders(text, vars) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

async function sendEmail({ to, subject, body, vars = {} }) {
  const resolvedSubject = resolvePlaceholders(subject, vars);
  const resolvedBody = resolvePlaceholders(body, vars);

  const transport = await getTransporter();
  const info = await transport.sendMail({
    from: process.env.GMAIL_USER && process.env.GMAIL_USER !== 'your-gmail@gmail.com'
      ? `"GoGO Pantry" <${process.env.GMAIL_USER}>`
      : '"GoGO Pantry" <noreply@gogopantry.com>',
    to,
    subject: resolvedSubject,
    html: resolvedBody,
  });

  // In dev mode, log the Ethereal preview URL directly
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`📧 Email preview: ${previewUrl}`);
  }

  return info;
}

module.exports = { sendEmail, resolvePlaceholders };
