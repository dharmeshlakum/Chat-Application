import { userModel } from "../Models/Users/UserCollection.js";

const signupValidtionMW = async (req, res, next) => {

    try {
        const { username, fullName, emailAddress, password } = req.body;
        const regix = /@gmail\.com/;

        if (!username || !fullName || !emailAddress || !password) return res.status(400).json({ error: "All fields are required !" });
        if (!regix.test(emailAddress)) return res.status(400).json({ error: "Invalid email address !" });
        if (password.length < 8) return res.status(400).json({ error: "Password length should be greater then 8 !" });

        const usernameData = await userModel.findOne({ username });
        const emailData = await userModel.findOne({ emailAddress, isDeleted: false });

        if (usernameData) return res.status(400).json({ error: "Username is not awailable !" });
        if (emailData) return res.status(409).json({ error: "Email address is already registred !" });
        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export { signupValidtionMW }