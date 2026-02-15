const { Server, Socket } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../service/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../service/vector.service");
const { embedText } = require("../service/embedding.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      const user = await userModel.findById(decoded.id);

      socket.user = user;

      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      // messagePayload = {
      //     chat:chatId
      //     content:message text content
      // }

      console.log("User connected:", socket.user._id)
      try {
        if (!messagePayload?.content) {
          return socket.emit("ai-response", {
            content: "Empty message received",
            chat: messagePayload?.chat,
          });
        }

        const [message, vectors] = await Promise.all([
          messageModel.create({
            chat: messagePayload.chat,
            user: socket.user._id,
            content: messagePayload.content,
            role: "user",
          }),

          embedText(messagePayload.content),
        ]);

        await createMemory({
            vectors: Array.from(vectors),
            messageId: message._id,
            metadata: {
              chat: messagePayload.chat,
              user: socket.user._id,
            },
          })


        const userMessage = messagePayload.content;

        const [memory, chatHistory] = await Promise.all([
          queryMemory({
            queryVector: Array.from(vectors),
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
            .then((message) => message.reverse()),
        ]);

        const stm = chatHistory.map((item) => ({
          role: item.role,
          content:
            typeof item.content === "string"
              ? item.content
              : JSON.stringify(item.content),
        }));

        const ltm = [
          {
            role: "system",
            content: `there are some previous messages from the chat, use them to genearte a response 
                  
                  ${memory.map((item) => item.metadata.text).join("\n")}
                  `,
          },
        ];

        const prompt =
          (ltm?.[0]?.content || "") +
          "\n\n" +
          stm.map((m) => m.content).join("\n") +
          "\n\nUser: " +
          userMessage;

        const response = await aiService.generateResponse(prompt);

        [...ltm, ...stm].map((item) => {
          console.log(item);
        });

        socket.emit("ai-response", {
          content: response || "Ai did not return any text",
          chat: messagePayload.chat,
        });

        const [ responseMessage, responseVectors ] = await Promise.all([
          messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: response,
          role: "assistant",
        }),

        embedText(response)

        ])

        await createMemory({
          vectors: Array.from(responseVectors),
          messageId: responseMessage._id,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            text: response,
          },
        });


      } catch (error) {
        console.log("Ai error", error.message);
        socket.emit("ai-response", {
          content: "AI service error. Please try again",
          chat: messagePayload?.chat,
        });
      }

    });
  });
}

module.exports = initSocketServer;