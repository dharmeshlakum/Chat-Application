import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "node:http";
import cookieParser from "cookie-parser";
import { authenticationRouter } from "./Apis/Authentication/AuthenticationRouter.js";
import { chatRouter } from "./Apis/Chat/ChatRouter.js";
import { SocketConnectionFN } from "./Socket/ServerSideSocket.js";
import { groupRouter } from "./Apis/Chat/GroupRouter.js";
import { userRouter } from "./Apis/User/UserRouter.js";


dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 7000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const viewPath = join(__dirname, "../Views");
const publicPath = join(__dirname, "../Public");
const assetPath = join(__dirname, "../Assets");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser())
app.use("/Public", express.static(publicPath));
app.use("/Assets", express.static(assetPath));
app.set("view engine", "hbs");
app.set("views", viewPath);

app.use(authenticationRouter);
app.use(chatRouter);
app.use(groupRouter);
app.use(userRouter);

app.get("*", (req, res)=>{
    res.status(404).render("Error", {
        error: "File not found",
        number: 404
    })
})

SocketConnectionFN(server);

server.listen(PORT, () => console.log(`Server is running at --> http://localhost:${PORT}`))