import { Router } from 'express';
import authController, { loginValidation, registerValidation, refreshTokenValidation } from '../controllers/auth.controller';
import { validate } from '../middleware/validation';

const router = Router();

router.post('/login', validate(loginValidation), authController.login.bind(authController));
router.post('/register', validate(registerValidation), authController.register.bind(authController));
router.post('/refresh-token', validate(refreshTokenValidation), authController.refreshToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));

export default router;
