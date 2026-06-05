import { Router } from 'express';
import authController, {
  loginValidation,
  registerValidation,
  refreshTokenValidation,
  confirmAccountValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { optionalAuthenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', validate(loginValidation), authController.login.bind(authController));
router.post('/register', validate(registerValidation), authController.register.bind(authController));
router.post('/refresh-token', validate(refreshTokenValidation), authController.refreshToken.bind(authController));
router.post('/logout', optionalAuthenticateToken, authController.logout.bind(authController));

router.post('/confirm-account', validate(confirmAccountValidation), authController.confirmAccount.bind(authController));
router.post('/forgot-password', validate(forgotPasswordValidation), authController.forgotPassword.bind(authController));
router.post('/reset-password', validate(resetPasswordValidation), authController.resetPassword.bind(authController));

export default router;
