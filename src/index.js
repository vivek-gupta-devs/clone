import connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js";


dotenv.config({
    path: ".env"
})

connectDB()
.then(() => app.listen(process.env.PORT || 3000, () => console.log("http://localhost:3000" )))
.catch((error) => console.log("Something Goes Wrong" + error) )