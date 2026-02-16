const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')

//Routes
const authRoutes = require("./routes/auth.routes")
const chatRoutes = require("./routes/chat.routes")

const app = express()

//Using Middlewares

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
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../public')))

//Using Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"))
})

// app.get("/", (req, res) => {
//     res.send("Api is running")
// })

module.exports = app;