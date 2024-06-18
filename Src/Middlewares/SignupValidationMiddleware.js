import { userModel } from "../Models/User/UserCollection.js";

const signupValidationMW = async (req, res, next) => {

    try {
        const { password, fullName, emailAddress, username } = req.body;
        const regix = /@gmail\.com/;

        if (!password || !fullName || !emailAddress || !username) return res.status(400).json({ error: "All fields are required !" });
        if (!regix.test(emailAddress)) return res.status(400).json({ error: "Invalid email address !" });
        if (password.length < 8) return res.status(400).json({ error: "Password length should be greater then 8" });

        const existingUsername = await userModel.findOne({ username });
        const existingEmail = await userModel.findOne({ emailAddress });

        if (existingEmail) return res.status(409).json({ error: "Email address is already registred !" });
        if (existingUsername) return res.status(400).json({ error: "Username is not awailable !" });

        next();

    } catch (error) {
        console.log("Signup middleware error -->",error);
        res.status(500).json({ error: error.message });
    }
}

export { signupValidationMW }