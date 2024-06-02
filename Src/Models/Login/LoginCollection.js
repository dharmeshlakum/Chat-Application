import mongoose from "mongoose";

const loginCollectionSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
        unique: true
    },

    token: {
        type: String,
        required: true
    },

    userAgent: {
        type: String,
        required: true
    },

    loginAt: {
        type: Date,
        default: () => Date.now(),
        index: {
            expireAfterSeconds: 24 * 60 * 60
        }
    }
});

const loginModel = mongoose.model("Logins", loginCollectionSchema);
export { loginModel }