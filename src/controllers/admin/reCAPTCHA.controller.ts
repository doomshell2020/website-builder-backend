import { Request, Response } from 'express';
import axios from 'axios';

// const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || 'YOUR_SECRET_KEY';
const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY_FOR_IP || 'YOUR_SECRET_KEY';

export const verifyRecaptcha = async (req: Request, res: Response) => {
  const { reCAPTCHAtoken } = req.body;

  if (!reCAPTCHAtoken) { return res.status(400).json({ message: 'CAPTCHA is missing' }); }

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`, null,
      {
        params: { secret: SECRET_KEY, response: reCAPTCHAtoken, },
      }
    );

    const data = response.data;
    if (!data.success || data.score < 0.5) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed' });
    }

    // ✅ Passed reCAPTCHA
    return res.status(200).json({ message: 'Human verified successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
