import express from 'express';
import { logIn, logOut, Register, verifyEmail,forgotPassword,resetPassword ,checkAuth} from '../controller/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';
// import { verify } from 'crypto';

const router = express.Router();

router.get('/check-auth', verifyToken, checkAuth)
router.post('/signup', Register)
router.post('/login',logIn )
router.post('/logout', logOut)

router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

export default router;