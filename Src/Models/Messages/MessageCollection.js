import mongoose from "mongoose";

const messageCollectionSchema = new mongoose.Schema({

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    message: {
        type: String,
        required: true
    },

    timestamp: {
        type: Date,
        default: () => Date.now()
    }
});

const messageModel = mongoose.model("Messages", messageCollectionSchema);
export { messageModel }