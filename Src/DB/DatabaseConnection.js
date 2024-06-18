import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const databaseConnection = mongoose.connect(
    process.env.DATABASE_PROTOCOL +
    process.env.DATABASE_USERNAME + ":" +
    process.env.DATABASE_PASSWORD + "@" +
    process.env.DATABASE_HOST + "/" +
    process.env.DATABASE_NAME

).then(() => console.log("<--- Database is connected successfully --->"))
 .catch((err) => console.log("Database connection error -->", err.stack));   