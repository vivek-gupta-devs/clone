import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";



const connectDB = () => mongoose
                    .connect(`${process.env.MONGO_URI}/${DB_NAME}`)
                    .then(() => console.log("Connection succcesfully establish with MongoDB"))
                    .catch((err) => console.log("Connection [n] establish with MongoDB"));

export default connectDB