import "dotenv/config";
import app from "./src/app.js";
import connectDb from "./src/db/db.js"
import initSocketServer from "./src/sockets/socket.server.js";
import http from "http"

const httpServer = http.createServer(app);

connectDb()
initSocketServer(httpServer)

httpServer.listen("3000", () => {
    console.log("Server is running on port 3000")
})