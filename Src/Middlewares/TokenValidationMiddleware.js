import { tokenValidationFN } from "../Services/Token/TokenValidation.js";

const tokenValidationMW = async (req, res, next) => {

    try {
        const token = req.cookies["Login"]
        if (!token) return res.status(401).redirect("/login");

        const validation = await tokenValidationFN(token);
        if (validation.exp * 1000 > Date.now()) {
            req.token = validation.id;
            next();

        } else return res.status(401).redirect("/login")

    } catch (error) {
        console.log("Token validation middleware error -->", error);
        res.status(401).redirect("/login")
    }
}

export { tokenValidationMW }