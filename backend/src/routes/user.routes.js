import { Router } from 'express';
import { registerUser,loginUser,logoutUser } from '../controllers/user.controller.js'
import { validateRegistration, validateLogin } from '../middlewares/validate.middleware.js';

const router = Router();

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/logout', logoutUser);

export default router;