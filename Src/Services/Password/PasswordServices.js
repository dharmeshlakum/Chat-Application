import bcrypt from "bcrypt";

async function passwordHashingFN(password) {

    try {
        const salt = await bcrypt.genSalt(10);
        const hashcode = await bcrypt.hash(password, salt);
        return hashcode;

    } catch (error) {
        console.log("Password hashing error -->", error);
        return error
    }
}

async function passwordValidationFN(password, hashcode) {

    try {
        const validation = await bcrypt.compare(password, hashcode);
        return validation;

    } catch (error) {
        console.log("Password validation error -->", error);
        return error;
    }
}

export { passwordHashingFN, passwordValidationFN }