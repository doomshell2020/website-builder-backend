import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

export const sendEmail = async (template: any) => {
  try {
    const sentMail = await transporter.sendMail(template);
    console.log('Message sent: %s', sentMail.messageId);
    return sentMail;
  } catch (err: any) {
    console.error('🚀 ~ sendEmail ~ error:', err.message);
    throw err;
  }
};
