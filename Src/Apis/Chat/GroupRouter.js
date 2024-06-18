import express from "express";
import { groupImageUploadingMW } from "../../Middlewares/GroupImageUploadingMiddleware.js";
import { tokenValidationMW } from "../../Middlewares/TokenValidationMiddleware.js";
import { groupCreationValidationMW } from "../../Middlewares/GroupCreationMiddleware.js";
import { groupModel } from "../../Models/Group/GroupCollection.js";

const groupRouter = express.Router();
groupRouter.post("/Create-group", tokenValidationMW,groupImageUploadingMW, groupCreationValidationMW, async (req, res) => {

    try {
        const { groupName, groupAbout } = req.body;
        const { token } = req;
        const groupImage = req.file ? req.file.filename: undefined;
        const group = new groupModel({
            groupName,
            groupImage,
            about: groupAbout,
            createdBy: token,
            admins: [token],
            members: [token]
        });
        await group.save();

        res.status(201).json({success: true, message: "Group created successfully"})

    } catch (error) {
        console.log(("Error while creating group -->", error));
        res.status(500).json({ success: false, error: error.message });
    }
})

export { groupRouter }