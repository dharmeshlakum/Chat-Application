import express from "express";
import {tokenValidationMW} from "../../Middlewares/TokenValidationMiddleware.js";
import { userModel } from "../../Models/Users/UserCollection.js";
import { messageModel } from "../../Models/Messages/MessagesCollection.js";

const chatRouter = express.Router();

chatRouter.get("/chat", tokenValidationMW, async(req, res)=>{

    try {
        const { token } = req;
        const user = await userModel.findOne({_id: token});

        if(!user) return res.status(404).render("Error", {
            error: "User not found !",
            number: 404
        });
        
        const friends = await userModel.find({_id : {
            $in: user.friends
        }});

        res.status(200).render("Chat", {
            friends,
            user
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).render("Error", {
            error: error.message,
            number: 500
        });
    }
});

chatRouter.get("/messages", tokenValidationMW, async(req, res)=>{

    try {
        const { token } = req;
        const { user } = req.query;
        const userData = await userModel.findOne({username: user});

        if(!userData) return res.status(404).render("Error", {
            error: "User not found !",
            number: 404
        });

        let message = await messageModel.find({
            $or: [
                {receiver: userData._id, sender: token},
                {receiver: token, sender: userData._id}
            ]
        }).populate("sender", "username")
          .sort({timestamp: 1})
          .exec();
          
        message = message.map(message=>({
            username: message.sender.username,
            message: message.message
        }));
console.log(message);
        res.status(200).json({success: true, message})
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
})

export { chatRouter }