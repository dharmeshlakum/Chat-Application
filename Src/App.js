import express from "express";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "node:http";
import { Server  } from "socket.io";
import cookieParser from "cookie-parser";
import { authenticationRouter } from "./Apis/Authenticatio/AuthenticationRouter";

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 6000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const staticFilePath = join(__dirname, "../Public");
const imageFilePath = join(__dirname,"../Assets");
const viewFilePath = join(__dirname, "../Views");

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "hbs");
app.set("views", viewFilePath);
app.use("/Public", express.static(staticFilePath));
app.use("/Assets", express.static(imageFilePath));

app.use(authenticationRouter);

io.on("connection", (socket)=>{
    console.log("New user is connected with socketID :", socket.id);

});

server.listen(port,()=> console.log(`Server is running at :- http://localhost:${port}`))