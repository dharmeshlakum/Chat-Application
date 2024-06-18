import express from "express";
import mongoose from "mongoose";
import { signupValidationMW } from "../../Middlewares/SignupValidationMiddleware.js";
import { loginValidationMW } from "../../Middlewares/LoginValidationMiddleware.js";
import { userModel } from "../../Models/User/UserCollection.js";
import { loginModel } from "../../Models/Login/LoginCollection.js";
import { tokenValidationMW } from "../../Middlewares/TokenValidationMiddleware.js";

const authenticationRouter = express.Router();

//* Login & Signup Page
authenticationRouter.get("/login", (req, res) => {
    res.status(200).render("LoginSignup")
});

//* Signup
authenticationRouter.post("/signup", signupValidationMW, async (req, res) => {

    try {
        const { password, fullName, emailAddress, username } = req.body;
        const user = new userModel({
            username,
            password,
            fullName,
            emailAddress
        });
        const saveData = await user.save();

        res.status(201).json({
            status: "success",
            message: "User login successfully !"
        });

    } catch (error) {
        console.log("Signup api error -->", error);
        res.status(500).json({
            error: error.message
        });
    }
});

//* Login 
authenticationRouter.post("/login", loginValidationMW, async (req, res) => {

    try {
        const { user } = req;
        const token = await user.generateToken();
        const userAgent = req.headers["user-agent"];
        const login = new loginModel({
            userId: user._id,
            token,
            userAgent
        });
        await login.save();
        await userModel.updateOne({_id: user._id}, {
            $set: {
                lastLogin: Date.now()
            }
        });
        
        res.cookie("Login", token, {
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            status: "Success",
            message: `${user.username} login successfully`
        });

    } catch (error) {
        console.log("Login api error -->", error);
        res.status(500).json({
            error: error.message
        });
    }
});

// * Logout * //
authenticationRouter.get("/logout", tokenValidationMW, async(req, res)=>{

    try {
        const { token } = req;
        const id = new mongoose.Types.ObjectId(token);
        const user = await userModel.findById(id);

        if(!user) return res.status(404).json({error: "User not found !"});

        await loginModel.deleteOne({userId: user._id});
        res.clearCookie("Login", {
            maxAge: 0
        });

        res.status(200).redirect("/login")
        
    } catch (error) {
        console.log("Error while logout -->", error);
        res.status(500).json({error: error})
    }
})

export { authenticationRouter }