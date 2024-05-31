import mongoose from "mongoose";
import { passwordHashing } from "../../Services/Password/PasswordServices.js";
import jwt from "jsonwebtoken";

const userCollectionSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    emailAddress: {
        type: String,
        required: true
    },

    fullName: {
        type: String,
        required: true
    },

    profilePicture: {
        type: String,
        default: "default-profile-pic.js"
    },

    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],

    isDeleted: {
        type: Boolean,
        default: false
    },

    registrationTime: {
        type: Date,
        default: () => new Date.now()
    }
});

userCollectionSchema.pre("save", async function (next) {
    const hashcode = await passwordHashing(this.password);
    this.password = hashcode;
    next();
});

userCollectionSchema.pre("updateOne", async function (next) {

    try {
        const update = this.getUpdate();
        if (update.$set && update.$set.password) {
            const hashcode = await passwordHashing(update.$set.password);
            update.$set.password = hashcode;
            next()
        }

    } catch (error) {
        next(error)
    }
});

userCollectionSchema.methods.generateToken = async function () {
    const token = await jwt.sign({ id: this._id }, process.env.SECRET_KEY, { expiresIn: "1d" });
    return token;
}

const userModel = mongoose.model("Users", userCollectionSchema);
export { userModel }