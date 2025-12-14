import { Router } from "express";
import {
  addSweet,
  getAllSweets,
  restockSweet,
} from "../controllers/sweet.controller.js";
import { authenticate, isAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { purchaseSweet } from "../controllers/purchase.controller.js";

const router = Router();

//public routes
router.get("/", getAllSweets);

//protected routes (user)
router.post("/:id/purchase", authenticate, purchaseSweet);

//protected routes (Admin Only)
router.post("/", authenticate, isAdmin, upload.single("image"), addSweet);
router.post("/:id/restock", authenticate, isAdmin, restockSweet);

export default router;
