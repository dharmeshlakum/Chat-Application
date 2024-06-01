import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const databaseConnection = mongoose.connect(process.env.DATABASE_CONNECTION)
                                   .then(()=> console.log("Database Is Connected Sccessfully"))
                                   .catch((err)=> console.log("Databas connection Error>:::>", err.stack)); 