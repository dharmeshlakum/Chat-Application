import mongoose from "mongoose";

const loginCollectionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true
    },

    userAgent: {
        type: String,
        required: true
    },

    token: {
        type: String,
        required: true
    },

    loginAt: {
        type: Date,
        default: () => Date.now()
    }
});

const loginModel = mongoose.model("Logins", loginCollectionSchema);
export { loginModel }