import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"

const app = express()

app.use(cors({ origin: process.env.ORIGIN }))
app.use(express.json({limit: process.env.LIMIT}))
app.use(express.urlencoded({extended: true,limit: process.env.LIMIT}))
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/v1/users",userRouter)

export default app