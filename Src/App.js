import express from "express";
import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { createServer } from "node:http";
import { Server  } from "socket.io";
import cookieParser from "cookie-parser";
import { authenticationRouter } from "./Apis/Authenticatio/AuthenticationRouter.js";
import { tokenValidation } from "./Services/Token/TokenValidation.js";
import { userModel } from "./Models/Users/UserCollection.js";
import { messageModel } from "./Models/Messages/MessagesCollection.js";
import { chatRouter } from "./Apis/Chat/ChatRouter.js";

dotenv.config();

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
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "hbs");
app.set("views", viewFilePath);
app.use("/Public", express.static(staticFilePath));
app.use("/Assets", express.static(imageFilePath));

app.use(authenticationRouter);
app.use(chatRouter);

const connectedUsers = new Map();
io.on("connection", (socket)=>{
    console.log("New user is connected with socketID :", socket.id);

    socket.on("register", (username)=>{
        connectedUsers.set(username, socket.id);
        socket.username = username;
    });

    socket.on("message", async(data)=>{

        try {
            const token = await tokenValidation(data.token);
            const sender = await userModel.findOne({_id: token.id});
            const receiver = await userModel.findOne({username: data.to});

            if(!receiver){
                console.log("Receiver not found !");
                return false
            }

            const message = new messageModel({
                sender: sender._id,
                receiver: receiver._id,
                message: data.message
            });
            await message.save();

            // socket.emit("new Message", {
            //     from: socket.username,
            //     message: message.message
            // });

            const senderSocketId = connectedUsers.get(sender.username);
            const receiverSocketId = connectedUsers.get(receiver.username);

            if(senderSocketId){
                io.to(senderSocketId).emit("new Message", {
                    from: sender.username,
                    message: message.message
                });

            }else{
                console.log("User is not connected");
            }

        } catch (error) {
            console.log("Error While fatching the message :", error.stack);
        }
    });

    socket.on("search friend", async(data)=>{

        try {
            const friend = await userModel.findOne({username: data.query});

            if(friend){
                socket.emit("search friend output", { success: true, friend });

            }else{
                socket.emit("search friend output", { success: false })
            }

        } catch (error) {
            console.log("error while searching friend :", error.stack);
        }
    });

    socket.on("disconnect", ()=>{
        if(socket.username){
            console.log(`${socket.username} is disconnected !`);
            connectedUsers.delete(socket.username);
        }
    });

});

server.listen(port,()=> console.log(`Server is running at :- http://localhost:${port}`))