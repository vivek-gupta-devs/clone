import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({ origin: process.env.ORIGIN }))
app.use(express.json({limit: process.env.LIMIT}))
app.use(express.urlencoded({extended: true,limit: process.env.LIMIT}))
app.use(express.static("public"))
app.use(cookieParser())

export default app