const express = require("express")
const cookkieParser = require("cookie-parser");
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cookkieParser())
app.use(cors ({
    origin: "http://localhost:5173",
    credentials: true
}))

//required all the routes here
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

//using all the routes here
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app