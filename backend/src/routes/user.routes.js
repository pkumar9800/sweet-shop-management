import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js'
import { validateRegistration } from '../middlewares/validate.middleware.js';

const router = Router();

router.post('/register', validateRegistration, registerUser);

export default router;