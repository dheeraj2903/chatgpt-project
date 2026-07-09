import chatModel from "../models/chat.model.js";
import messageModel from '../models/message.model.js'

const createChat = async (req, res) => {
  const { title } = req.body;

  const user = req.user;

  const chat = await chatModel.create({
    user: user._id,
    title,
  });

  res.status(201).json({
    message: "Chat created successfully",
    chat: {
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user
    },
  });
};

const getChats = async (req, res) => {
  const user = req.user;

  const chats = await chatModel.find({ user: user._id});

  res.status(200).json({
    message: "Chats retrieved successfully",
    chats: chats.map(chat => ({
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
      user: chat.user
    }))
  })
}

const getMessages = async (req, res) => {
    const chatId = req.params.id

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 })

    res.status(200).json({
      message: 'Messages retrieved successfully',
      messages: messages
    })
}

const deleteChat = async (req, res) => {

  const chatId = req.params.id;
  const userId = req.user._id;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: userId
  });

  if(!chat) {
    return res.status(404).json({ message: "Chat not found" })
  }

  await messageModel.deleteMany({ chat: chatId})

  res.status(200).json({
    message: "Chat deleted successfully"
  })
}
 
export { createChat, getChats, getMessages, deleteChat }