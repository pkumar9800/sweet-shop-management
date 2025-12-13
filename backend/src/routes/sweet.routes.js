import { Router } from 'express';
import { addSweet } from '../controllers/sweet.controller.js';
import { authenticate, isAdmin } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js'; // Import Multer

const router = Router();

// POST /api/v1/sweets
// Flow: Auth Check -> Admin Check -> Parse File (Multer) -> Controller
router.post('/', authenticate, isAdmin, upload.single('image'), addSweet);

export default router;