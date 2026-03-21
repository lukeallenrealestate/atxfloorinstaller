const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/contact', async (req, res) => {
  const { name, phone, email, address, flooring_type, square_footage, message } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).send('Missing required fields.');
  }

  const appPassword = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s/g, '');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'Luke@austinmdg.com',
      pass: appPassword
    }
  });

  const mailOptions = {
    from: '"ATX Floor Installer" <Luke@austinmdg.com>',
    to: 'luke@austinmdg.com',
    replyTo: email,
    subject: `New Quote Request from ${name}`,
    html: `
      <h2>New Free Quote Request</h2>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Phone</td><td style="padding:8px;border:1px solid #ddd;">${phone}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Property Address</td><td style="padding:8px;border:1px solid #ddd;">${address || 'Not provided'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Flooring Type</td><td style="padding:8px;border:1px solid #ddd;">${flooring_type || 'Not specified'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Square Footage</td><td style="padding:8px;border:1px solid #ddd;">${square_footage || 'Not provided'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Project Details</td><td style="padding:8px;border:1px solid #ddd;">${message || 'None'}</td></tr>
      </table>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.redirect('/thank-you.html');
  } catch (err) {
    console.error('Email send error:', err);
    res.redirect('/contact-error.html');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ATX Floor Installer server running on port ${PORT}`);
});
