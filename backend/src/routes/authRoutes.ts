import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';
import { authenticateToken, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticateToken, authController.logout);

// User profile routes
router.get('/profile', authenticateToken, userController.getUserProfile);
router.put('/profile', authenticateToken, userController.updateUserProfile);
router.put('/preferences', authenticateToken, userController.updateUserPreferences);
router.delete('/account', authenticateToken, userController.deleteUserAccount);

export default router;
