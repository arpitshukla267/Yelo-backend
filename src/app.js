const express = require("express")
const cors = require("cors")
const routes = require("./routes")

const app = express()

// CORS configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://www.yeloindia.com",
  "https://yeloindia.com",
  "http://yeloindia.com",
  "https://yelo-wheat.vercel.app"
]

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)

app.use(express.json())
app.use("/api", routes)

module.exports = app
