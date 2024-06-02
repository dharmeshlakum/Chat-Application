import express from "express";
import { signupValidtionMW } from "../../Middlewares/SignupValidationMiddleware.js";
import { userModel } from "../../Models/Users/UserCollection.js";
import { loginValidationMW } from "../../Middlewares/LoginValidationMiddleware.js";
import { loginModel } from "../../Models/Login/LoginCollection.js";

const authenticationRouter = express.Router();

authenticationRouter.get("/login", (req, res) => {
    res.status(200).render("Form");
});

//Signup
authenticationRouter.post("/signup", signupValidtionMW, async (req, res) => {

    try {
        const { username, fullName, password, emailAddress } = req.body;
        const user = new userModel({
            username,
            emailAddress,
            fullName,
            password
        });
        const saveData = await user.save();
        res.status(201).json({
            status: "Success",
            message: "User created successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).redirect("Error", {
            number: 500,
            error: error.message
        });
    }
});

//Login
authenticationRouter.post("/login", loginValidationMW, async (req, res) => {

    try {
        const { user } = req;
        const token = user.generateToken();
        const userAgent = req.headers["user-agent"];
        const login = new loginModel({
            userId: user._id,
            token,
            userAgent
        });
        await login.save();

        res.cookie("login", token, {
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).redirect("/")

    } catch (error) {
        console.log(error);
        res.status(500).redirect("Error", {
            number: 500,
            error: error.message
        });
    }
});

export { authenticationRouter }