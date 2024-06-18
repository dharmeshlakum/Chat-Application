import express from "express";
import mongoose from "mongoose";
import { tokenValidationMW } from "../../Middlewares/TokenValidationMiddleware.js"
import { userModel } from "../../Models/User/UserCollection.js";
import { groupModel } from "../../Models/Group/GroupCollection.js";
import { messageModel } from "../../Models/Message/MessageCollection.js";
import { formatTimeFN } from "../../Middlewares/TimeConversation.js";

const chatRouter = express.Router();

//Chat Homepage
chatRouter.get("/home", tokenValidationMW, async (req, res) => {

    try {
        const { token } = req;
        const userId = new mongoose.Types.ObjectId(token);
        const user = await userModel.findOne({
            _id: userId
        });

        if (!user) return res.status(404).render("Error", {
            error: "User not found !",
            number: 404
        });

        const userData = {
            id: user._id,
            profilePicture: user.profilePicture,
            fullName: user.fullName,
            username: user.username
        };

        let friends = await userModel.find({
            _id: {
                $in: user.friends
            }
        });

        if (friends.length > 0) {
            friends = friends.map((value) => ({
                id: value._id,
                name: value.username,
                image: value.profilePicture,
                fullName: value.fullName
            }));
        }

        let groups = await groupModel.find({
            members: {
                $in: user._id
            }
        });

        if (groups.length > 0) {
            groups = groups.map((value) => ({
                id: value._id,
                name: value.groupName,
                image: value.groupImage,
                fullName: value.groupName
            }));
        }

        const mixArray = [...friends, ...groups];

        res.status(200).render("ChatPage", {
            user: userData,
            mixArray
        });

    } catch (error) {
        console.log("Chat homepage error -->", error);
        res.status(500).render("Error", {
            number: 500,
            error: error.message
        });
    }
});

//API to fetch previos messages
chatRouter.get("/message", tokenValidationMW, async (req, res) => {

    try {
        const { token } = req;
        const { input } = req.query;
        const friend = await userModel.findOne({ username: input });
        if (friend) {
            let message = await messageModel.find({
                $or: [
                    { sender: token, receiver: friend._id },
                    { sender: friend._id, receiver: token }
                ]
            }).populate({
                path: "sender",
                select: "fullName username"

            }).sort({ time: 1 })
                .exec();

            message = message.map((message) => ({
                id: message._id,
                senderFullName: message.sender.fullName,
                senderUsername: message.sender.username,
                message: message.message,
                senderId: message.sender._id,
                receiverId: message.receiver,
                time: formatTimeFN(message.time)
            }));

            res.status(200).json({
                success: true,
                message
            })

        } else {
            const group = await groupModel.findOne({ groupName: input });
            if (!group) return res.status(404).json({ success: false, error: "Group not found" });

            let message = await messageModel.find({
                group: group._id

            }).populate({
                path: "sender",
                select: ["fullName", "profilePicture", "username"]

            }).sort({ time: 1 })
                .exec();

            message = message.map((message) => ({
                id: message._id,
                sender: message.sender.fullName,
                senderId: message.sender,
                groupId: message.group,
                message: message.message,
                time: formatTimeFN(message.time)
            }));

            res.status(200).json({
                success: true,
                message
            });
        }

    } catch (error) {
        console.log("Message fetching error -->", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

//API to Get Chat Type
chatRouter.get("/chatType", tokenValidationMW, async (req, res) => {

    try {
        const { id } = req.query;
        const searchId = new mongoose.Types.ObjectId(id);
        const user = await userModel.findOne({ _id: searchId });

        if (user) {
            res.status(200).json({
                success: true,
                type: "User"
            });

        } else {
            const group = await groupModel.findOne({ _id: searchId });
            if (!group) return res.status(404).json({ success: false, error: "Invalid id" });

            res.status(200).json({
                success: true,
                type: "Group"
            });
        }

    } catch (error) {
        console.log("error while getting type of chat -->", error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export { chatRouter }