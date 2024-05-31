import { userModel } from "../Models/User/UserCollection.js"

const signupValidationMW = async (req, res, next) => {

    try {
        const { fullName, username, emailAddress, password } = req;
        const regix = /@gmail\.com/;

        if (!fullName || !username || !emailAddress || !password) return res.status(400).json({ error: "All fields are required !" });
        if (password.length > 6) return res.status(400).json({ error: "Password length should be greater then 6 !" });
        if (!regix.test(emailAddress)) return res.status(400).json({ error: "Email address is invalid !" });

        const usernameData = await userModel.findOne({ username });
        const emailData = await userModel.findOne({ emailAddress, isDeleted: true });

        if (usernameData) return res.status(400).json({ error: "Username is not awailable !" });
        if (emailData) return res.status(409).json({ error: "Email address is already registred !" });

        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export { signupValidationMW }