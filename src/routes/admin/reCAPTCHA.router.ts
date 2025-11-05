import { Router } from 'express';
import { verifyRecaptcha } from '../../controllers/admin/reCAPTCHA.controller';

const router = Router();

router.post('/verify-recaptcha', verifyRecaptcha as any);

router.all("*", (req, res) => { res.status(404).json({ status: false, message: "Path not found!" }); });

export default router;