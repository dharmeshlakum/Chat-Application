import jwt from "jsonwebtoken";

async function tokenValidationFN(token) {

    try {
        const validation = await jwt.verify(token, process.env.TOKEN_SECRET);
        return validation

    } catch (error) {
        console.log("Token validation error -->", error);
        return error
    }
}

export { tokenValidationFN }