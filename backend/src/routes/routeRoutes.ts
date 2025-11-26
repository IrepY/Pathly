import { Router } from 'express';
import * as routeController from '../controllers/routeController';
import { authenticateToken, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Route search (public)
router.post('/search', optionalAuthenticate, routeController.searchRoutes);

// Saved routes (authenticated)
router.post('/save', authenticateToken, routeController.saveRoute);
router.get('/saved', authenticateToken, routeController.getSavedRoutes);
router.put('/saved/:id', authenticateToken, routeController.updateSavedRoute);
router.delete('/saved/:id', authenticateToken, routeController.deleteSavedRoute);

export default router;
