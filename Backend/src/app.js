import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from "path"

/* Routes */
import authRoute from "./routes/auth.routes.js"
import chatRoutes from "./routes/chat.routes.js";

const app = express();

/* Using Middlewares */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://chatgpt-project-duvl.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));



app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')))

/* Using Routes */
app.use('/api/auth', authRoute)
app.use('/api/chat', chatRoutes)

app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"))
})

export default app;