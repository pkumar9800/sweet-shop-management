import { Router } from 'express';
import { addSweet, getAllSweets } from '../controllers/sweet.controller.js';
import { authenticate, isAdmin } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js'; 
import { purchaseSweet } from '../controllers/purchase.controller.js';

const router = Router();

// PUBLIC ROUTE: Get All Sweets
// No 'authenticate' middleware here!
router.get('/', getAllSweets);

router.post('/:id/purchase', authenticate, purchaseSweet);

// PROTECTED ROUTE: Add Sweet (Admin Only)
router.post('/', authenticate, isAdmin, upload.single('image'), addSweet);

export default router;