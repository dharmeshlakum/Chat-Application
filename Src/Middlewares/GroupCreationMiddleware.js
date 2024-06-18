import { groupModel } from "../Models/Group/GroupCollection.js";

const groupCreationValidationMW = async (req, res, next) => {

    try {
        const { groupName } = req.body;
        if (!groupName) return res.status(400).json({ error: "Group name field can't be null" });

        const existance = await groupModel.findOne({ groupName });
        if (existance) return res.status(400).json({ error: "This name is not awailable!" });
        next();

    } catch (error) {
        console.log("Error while creating group -->", error);
        res.status(500).json({ error: error.message });
    }
}

export { groupCreationValidationMW }