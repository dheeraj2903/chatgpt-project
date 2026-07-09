import express from "express";
import { getMe, loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser)
router.post("/login", loginUser)

/* GET /api/chat/me*/
router.get("/me", authUser, getMe)

router.post('/logout', authUser, logoutUser)

export default router;