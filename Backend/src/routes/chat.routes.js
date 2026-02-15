const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const chatController = require("../controllers/chat.controller")

const router = express.Router();

// post /api/chat/ //
router.post('/', authMiddleware.authUser,chatController.createChat)


/* GET /api/chat/ */
router.get('/', authMiddleware.authUser, chatController.getChats)


/* GET /api/chat/messages/:id */
router.get('/messages/:id', authMiddleware.authUser, chatController.getMessages)


/*GET /api/chat/me */
router.get("/me", authMiddleware.authUser, )

/*delete chat */
router.delete('/:id', authMiddleware.authUser, chatController.deleteChat)

module.exports = router;