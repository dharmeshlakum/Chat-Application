import mongoose, { Mongoose } from "mongoose";

const groupCollectionSchema = new mongoose.Schema({

    groupName: {
        type: String,
        require: true,
        unique: true
    },

    groupImage: {
        type: String,
        default: "Default-Group-image.jpg"
    },

    about: {
        type: String,
        default: ""
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],

    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],

    createdAt: {
        type: Date,
        default: () => Date.now()
    }
});

const groupModel = mongoose.model("Groups", groupCollectionSchema);
export { groupModel }