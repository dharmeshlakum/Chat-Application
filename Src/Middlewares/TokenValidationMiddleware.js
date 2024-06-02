import { tokenValidation } from "../Services/Token/TokenValidation.js";

const tokenValudationMW = async (req, res, next) => {

    try {
        const token = req.cookies["login"];
        if (!token) return res.status(401).redirect("/login");

        const validation = await tokenValidation(token);
        if (validation.exp * 1000 > Date.now()) {
            req.token = validation.id;
            next();

        } else return res.status(401).redirect("/login")

    } catch (error) {
        console.log(error);
        res.status(401).redirect("/login");
    }
}

export { tokenValidation }