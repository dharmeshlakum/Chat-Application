import { loginModel } from "../Models/Login/LoginCollection.js";
import { userModel } from "../Models/User/UserCollection.js";
import { passwordValidationFN } from "../Services/Password/PasswordServices.js";

const loginValidationMW = async (req, res, next) => {

    try {
        const { userInput, password } = req.body;
        if (!userInput || !password) return res.status(400).json({ error: "All filds are required !" });

        const user = await userModel.findOne({
            $or: [
                { username: userInput },
                { emailAddress: userInput }
            ],
            isDeleted: false
        });
        if (!user) return res.status(400).json({ error: "Invalid username | email address" });

        const validation = await passwordValidationFN(password, user.password);
        const login = await loginModel.findOne({ userId: user._id });

        if (login) {
            if (req.headers["user-agent"] === login.userAgent) {
                const token = await user.generateToken();
                loginModel.updateOne({ _id: login._id }, {
                    $set: { token }
                });

                res.cookie("Login", token, {
                    maxAge: 2 * 24 * 60 * 60 * 1000
                });
                res.status(200).redirect("/home")

            } else return res.status(409).json({ error: "User is already login on other device !" });

        } else {
            req.user = user;
            next();
        }

    } catch (error) {
        console.log("login middleware error -->",error);
        res.status(500).json({
            error: error.message
        });
    }
}

export { loginValidationMW }