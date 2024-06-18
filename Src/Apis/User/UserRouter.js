import express from "express";
import { join, dirname } from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { userModel } from "../../Models/User/UserCollection.js";
import { groupModel } from "../../Models/Group/GroupCollection.js";
import { tokenValidationMW } from "../../Middlewares/TokenValidationMiddleware.js";
import { userImageUploadingMW } from "../../Middlewares/UserImageUploadingMiddleware.js";
import { editProfileMW } from "../../Middlewares/EditProfileMiddleware.js";

const userRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

userRouter.get("/user/:username", tokenValidationMW, async (req, res) => {

    try {
        const { token } = req;
        const { username } = req.params;
        const user = await userModel.findOne({
            username
        }).populate({
            path: "friends",
            select: "_id profilePicture fullName username friends"
        })

        if (!user) return res.status(404).render("Error", {
            number: 404,
            error: "User not found"
        });

        const group = await groupModel.find({
            members: {
                $in: user._id
            }
        });

        const friends = user.friends.map((value) => ({
            id: value._id,
            fullName: value.fullName,
            username: value.username,
            image: value.profilePicture,
        }));

        const groups = group.map((value) => ({
            id: value._id,
            name: value.groupName,
            image: value.groupImage,
            role: isAdmin(value.admins, user._id)
        }))

        const userData = {
            username: user.username,
            name: user.fullName,
            image: user.profilePicture,
            friends: user.friends.length,
            groups: group.length,
            id: user._id,
            emailAddress: user.emailAddress,
            about: user.bio,
            groups: group.length
        }

        const login = token == user._id ? true : false;

        if (!user) return res.status(404).render("Error", {
            number: 404,
            error: "User not found !"
        });

        res.status(200).render("UserPage", {
            friends,
            user: userData,
            login,
            groups
        });

    } catch (error) {
        console.log("Eror while getting userdata -->", error);
        res.status(500).render("Error", {
            number: 500,
            error: error.message
        });
    }
});

userRouter.get("/user/image/:imgPath", async (req, res) => {

    try {
        const staticPath = join(__dirname, "../../../Assets/Profile/");
        const { imgPath } = req.params;

        res.status(200).sendFile(join(staticPath + imgPath));

    } catch (error) {
        console.log("Error while showing image-->", error);
        res.status(500).render("Error", {

        })
    }
});

userRouter.get("/download/image/:imgPath", async (req, res) => {

    try {
        const staticPath = join(__dirname, "../../../Assets/Profile/");
        const { imgPath } = req.params;

        res.status(200).download(join(staticPath + imgPath));

    } catch (error) {
        console.log("Error while showing image-->", error);
        res.status(500).render("Error", {

        })
    }
});

userRouter.get("/user/:username/edit-profile", tokenValidationMW, async (req, res) => {

    try {
        const { username } = req.params;
        const user = await userModel.findOne({
            username
        }).populate({
            path: "friends",
            select: "_id profilePicture fullName username friends"
        })

        if (!user) return res.status(404).render("Error", {
            number: 404,
            error: "User not found"
        });

        const friends = user.friends.map((value) => ({
            id: value._id,
            fullName: value.fullName,
            username: value.username,
            image: value.profilePicture,
        }));

        const userData = {
            username: user.username,
            name: user.fullName,
            image: user.profilePicture,
            id: user._id,
            emailAddress: user.emailAddress,
            about: user.bio,
        }

        res.status(200).render("EditProfile", {
            user: userData,
            friends
        })

    } catch (error) {
        console.log("error while rendering edit page-->", error);
        res.status(500).render("Error", {
            number: 500,
            error: error.message
        });
    }
});

export { userRouter }

// * Function retrive Admin Detail * //
function isAdmin(array, id) {
    try {
        const index = array.findIndex((value) => {
            let currentUserid = id.toString();
            let adminId = value.toString();
            if (currentUserid == adminId) return true
        });

        if (index > 0) {
            return "Admin";

        } else {
            return "Member"
        }

    } catch (error) {
        console.log("Admin function error -->", error);
        return error
    }
}

