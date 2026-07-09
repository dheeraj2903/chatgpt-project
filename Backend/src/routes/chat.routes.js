import express from "express";
import { authUser } from "../middlewares/auth.middleware.js"
import { createChat, deleteChat, getChats, getMessages } from "../controllers/chat.controller.js";

const router = express.Router();

/* POST /api/chat/ */
router.post('/', authUser, createChat)


/* GET /api/chat/ */
router.get('/', authUser, getChats)


/* GET /api/chat/:id */
router.get('/messages/:id', authUser, getMessages)


/* delete chat */
router.delete('/:id', authUser, deleteChat);


export default router;