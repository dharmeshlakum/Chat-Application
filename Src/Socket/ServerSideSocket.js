import { Server } from "socket.io";
import mongoose from "mongoose";
import { userModel } from "../Models/User/UserCollection.js";
import { tokenValidationFN } from "../Services/Token/TokenValidation.js";
import { groupModel } from "../Models/Group/GroupCollection.js";
import { messageModel } from "../Models/Message/MessageCollection.js";
import { formatTimeFN } from "../Middlewares/TimeConversation.js";


async function SocketConnectionFN(server) {

    const io = new Server(server);
    let users = {};


    io.on("connection", (socket) => {
        console.log("<-- new socket connected -->");


        // * Registre Users * //
        socket.on("register", (username) => {
            users[username] = socket.id;
            socket.username = username;

            console.log(`${username} is connected with socket id: ${socket.id}`);
        })

        // * Online Status * //
        socket.on("online", (username) => {
            const socketId = users[username];

            if (socketId) {
                socket.emit("online result", { success: true })

            } else {
                socket.emit("online result", { success: false })
            }
        })

        // * Search Friend Event * //
        socket.on("search friend", async (data) => {

            try {
                const input = data.input;
                const token = await tokenValidationFN(data.token);
                const friend = await userModel.findOne({
                    $or: [
                        { username: input },
                        { fullName: input }
                    ],
                    isDeleted: false
                });

                if (friend) {
                    const user = await userModel.findOne({ _id: token.id });
                    const friendID = friend._id.toString();
                    let friendData = user.friends.filter((value) => value.toString() == friendID);
                    let alreadyFriend = friendData.length !== 0 ? true : false;

                    socket.emit("search result", {
                        fullName: friend.fullName,
                        image: friend.profilePicture,
                        username: friend.username,
                        id: friend._id,
                        success: true,
                        type: "User",
                        exist: alreadyFriend
                    });

                } else {
                    const group = await groupModel.findOne({ groupName: input });
                    if (!group) {
                        return socket.emit("search result", {success: false})
                    }

                    let alreadyMember = group.members.map((value) => value == token.id);
                    alreadyMember = alreadyMember ? true : false

                    socket.emit("search result", {
                        fullName: group.groupName,
                        username: group.groupName,
                        image: group.groupImage,
                        id: group._id,
                        type: "Group",
                        exist: alreadyMember
                    });
                }

            } catch (error) {
                console.log("Serach friend event error -->", error);
                socket.emit("search result", {success: false})
            }
        });

        // * Event To Add Friend In Friend List* //
        socket.on("add friend", async (data) => {

            try {
                const token = await tokenValidationFN(data.token);
                await userModel.updateOne({ _id: token.id }, {
                    $push: { friends: data.id }
                });
                console.log(data);
                socket.emit("friend add", { success: true })

            } catch (error) {
                console.log("Error while adding friend -->", error);
                socket.emit("friend add", { success: false })
            }
        });


        // * Send Message event * //
        socket.on("send message", async (data) => {
            try {
                const token = await tokenValidationFN(data.token);
                const { type, message } = data;
                const sender = await userModel.findOne({ _id: token.id });
                const receiverId = new mongoose.Types.ObjectId(data.receiver);

                if (type === "User") {
                    const receiver = await userModel.findOne({ _id: receiverId });
                    const senderSocketID = users[sender.username];
                    const receiverSocketID = users[receiver.username];
                    const newMessage = new messageModel({
                        sender: sender._id,
                        receiver: receiver._id,
                        message
                    });
                    await newMessage.save();

                    const payload = {
                        id: newMessage._id,
                        message,
                        fullName: sender.fullName,
                        time: formatTimeFN(newMessage.time),
                        senderUsername: sender.username,
                        receiverUsername: receiver.username,
                        receiverId: receiver._id.toString()
                    }

                    if (senderSocketID) {
                        io.to(senderSocketID).emit("save message", {
                            success: true,
                            payload
                        });
                    }
                    if (receiverSocketID) {
                        io.to(receiverSocketID).emit("save message", {
                            success: true,
                            payload,
                            seen: true
                        });
                    }

                } else {
                    const group = await groupModel.findOne({
                        _id: receiverId

                    }).populate({
                        path: "members",
                        select: "_id username"
                    });
                    if (!group) {
                        console.log("Group not found");
                    }
                    const newMessage = new messageModel({
                        group: group._id,
                        sender: sender._id,
                        message: message,
                    });
                    await newMessage.save();
                    const payload = {
                        id: newMessage._id,
                        message,
                        fullName: sender.fullName,
                        time: formatTimeFN(newMessage.time),
                        senderUsername: sender.username,
                        receiverUsername: group.groupName,
                        receiverId: group._id.toString()
                    }

                    console.log("Group Message.....");
                }

            } catch (error) {
                console.log("Error while sending message -->", error.stack);
            }
        })

        // * Delete Messages event * //
        socket.on("delete message", async (data) => {
            try {
                const { messageId } = data;
                const id = new mongoose.Types.ObjectId(messageId);
                const message = await messageModel.findOne({ _id: id });

                if (!message) {
                    socket.emit("delete success", { success: false, messageId: id, error: "Message not found" });
                    return;
                }
                const sender = await userModel.findOne({ _id: message.sender });
                const receiver = message.receiver ? await userModel.findOne({ _id: message.receiver }) : null;
                await messageModel.deleteOne({ _id: messageId });

                const senderSocketID = users[sender.username];
                const receiverSocketID = receiver ? users[receiver.username] : null;

                if (senderSocketID) {
                    io.to(senderSocketID).emit("delete success", { success: true, messageId: id });
                }

                if (receiverSocketID) {
                    io.to(receiverSocketID).emit("delete success", { success: true, messageId: id });
                }

            } catch (error) {
                console.log("Message delete event error -->", error);
            }
        })

        // * Socket Disconnection * //
        socket.on("disconnect", () => {
            if (socket.username) {
                delete users[socket.username];
                console.log("User is disconnected");
            }
        });
    });

    return io
}

export { SocketConnectionFN }