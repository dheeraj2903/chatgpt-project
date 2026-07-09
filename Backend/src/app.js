import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';


/* Routes */
import authRoute from "./routes/auth.routes.js"
import chatRoutes from "./routes/chat.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

/* Using Middlewares */
app.use(express.json());
app.use(cookieParser());

/* Using Routes */
app.use('/api/auth', authRoute)
app.use('/api/chat', chatRoutes)

export default app;