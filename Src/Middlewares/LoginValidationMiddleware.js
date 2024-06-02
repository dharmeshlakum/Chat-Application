import { userModel } from "../Models/Users/UserCollection.js";
import { loginModel } from "../Models/Login/LoginCollection.js"
import { passwordValidation } from "../Services/Password/PasswordServices.js";

const loginValidationMW = async (req, res, next) => {

    try {
        const { userInput, password } = req.body;
        if (!userInput || !password) return res.status(400).json({ error: "All fields are required !" });

        const user = await userModel.findOne({
            $or: [
                { emailAddress: userInput },
                { username: userInput }
            ]
        });
        if (!user) return res.status(404).json({ error: "User not found !" });

        const loginData = await loginModel.findOne({ userId: user._id });
        if (loginData) {

            if (loginData.userAgent === req.headers["user-agent"]) {
                const token = await user.generateToken();
                await loginModel.updateOne({ userId: user._id }, {
                    $set: { token }
                });
                res.cookie("login", token, {
                    maxAge: 24 * 60 * 60 * 1000
                });
                res.status(200).redirect("/")

            } else return res.status(409).json({ error: "User is already login on other device..." })

        } else {
            const validation = await passwordValidation(password, user.password);
            if (!validation) return res.status(401).json({ error: "Wrong password !" });
            req.user = user;
            next();
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export { loginValidationMW }