import { Router } from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';
import { authenticateToken, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Authentication routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authenticateToken, authController.logout);

// User profile routes
router.get('/users/profile', authenticateToken, userController.getUserProfile);
router.put('/users/profile', authenticateToken, userController.updateUserProfile);
router.put('/users/preferences', authenticateToken, userController.updateUserPreferences);
router.delete('/users/account', authenticateToken, userController.deleteUserAccount);

export default router;
