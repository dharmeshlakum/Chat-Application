import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { passwordHashingFN } from "../../Services/Password/PasswordServices.js";

const userCollectionSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },

    emailAddress: {
        type: String,
        required: true
    },

    fullName: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    profilePicture: {
        type: String,
        default: "Defaul-user-pic.jpg"
    },

    coverPicture: {
        type: String,
        default: "Default-Cover-Picture.jpg"
    },

    bio: {
        type: String,
        default: ""
    },

    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    }],

    isDeleted: {
        type: Boolean,
        default: false
    },

    lastLogin: {
        type: Date,
        default: null
    },

    registredAt: {
        type: Date,
        default: () => Date.now()
    }
});

userCollectionSchema.pre("save", async function (next) {

    try {
        const hashcode = await passwordHashingFN(this.password);
        this.password = hashcode;
        next();

    } catch (error) {
        console.log("Mongoose Password hashing error -->", error);
        next(error);
    }
});

userCollectionSchema.pre("updateOne", async function (next) {

    try {
        const update = this.getUpdate();
        if (update.$set && update.$set.password) {
            const hashcode = await passwordHashingFN(update.$set.password);
            update.$set.password = hashcode;
            next();
        }

    } catch (error) {
        console.log("Mongoose password update error -->", error);
        next(error);
    }
});

userCollectionSchema.methods.generateToken = async function () {

    try {
        const token = await jwt.sign({ id: this._id }, process.env.TOKEN_SECRET, { expiresIn: "2d" })
        return token;

    } catch (error) {
        console.log("Error while generating token -->", error);
        return error;
    }
}

const userModel = mongoose.model("Users", userCollectionSchema);
export { userModel }