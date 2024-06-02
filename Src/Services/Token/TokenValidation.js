import jwt from "jsonwebtoken";

async function tokenValidation(token) {
    const validation = await jwt.verify(token, process.env.SECRET_KEY);
    return validation
}

export { tokenValidation }