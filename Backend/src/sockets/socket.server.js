import { Server } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import * as aiService from "../services/ai.service.js";
import messageModel from "../models/message.model.js";
import { createMemory, queryMemory } from "../services/vector.service.js";

const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:5173", 
        "https://chatgpt-project-duvl.onrender.com"
      ],
      allowedHeaders: ["Content-Type", "Authorization"],
      // methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      // socket.user = decoded; ye bhi kar sakte sahi hai

      const user = await userModel.findById(decoded.id || decoded._id);

      if (!user) return next(new Error("Authentication error: User not found"));

      socket.user = user;

      next();
    } catch (err) {
      next(new Error("Authentication error: Token Invalid"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Connected", socket.user.email);console.log("Connected:", socket.id, socket.user.email);

  socket.on("disconnect", (reason) => {
    console.log("Disconnected:", socket.id, reason);
  });
    socket.on("ai-message", async (messagePayload) => {
      console.time("TOTAL");

      try {
        console.time("USER MESSAGE");

        const [message, vectors] = await Promise.all([
          messageModel.create({
            chat: messagePayload.chat,
            user: socket.user._id,
            content: messagePayload.content,
            role: "user",
          }),

          aiService.generateVector(messagePayload.content),
        ]);

        console.timeEnd("USER MESSAGE");

        createMemory({
          vectors,
          messageId: message._id,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            text: messagePayload.content,
          },
        }).catch(console.error);

        console.time("Memory + History");

        const [memory, chatHistory] = await Promise.all([
          queryMemory({
            queryVector: vectors,
            limit: 3,
            metadata: {
              user: socket.user._id,
            },
          }),

          messageModel
            .find({
              chat: messagePayload.chat,
            })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean()
            .then((messages) => messages.reverse()),
        ]);

        console.timeEnd("Memory + History");

        const stm = chatHistory.map((item) => {
          return {
            role: item.role,
            parts: [{ text: item.content }],
          };
        });

        const ltm = [
          {
            role: "user",
            parts: [
              {
                text: `
                          
                          Use these memories only if relevant.
  
                          ${memory.map((item) => item.metadata.text).join("\n")}
  
                          `,
              },
            ],
          },
        ];
        console.time("GEMINI");

        const response = await aiService.generateResponse([...ltm, ...stm]);

        console.timeEnd("GEMINI");

        socket.emit("ai-response", {
          content: response,
          chat: messagePayload.chat,
        });

        const [responseMessage, responseVectors] = await Promise.all([
          messageModel.create({
            chat: messagePayload.chat,
            user: socket.user._id,
            content: response,
            role: "model",
          }),
          aiService.generateVector(response),
        ]);

        createMemory({
          vectors: responseVectors,
          messageId: responseMessage._id,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            text: response,
          },
        }).catch(console.error);
      } catch (err) {
        console.error(err);

        socket.emit("ai-error", {
          message: "Something went wrong",
        })
        console.timeEnd("TOTAL")
      }
    });
  });
};

export default initSocketServer;
