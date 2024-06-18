import bcrypt from "bcrypt";

async function otpHashingFN(otp) {

    try {
        const salt = await bcrypt.genSalt(10);
        const hashcode = await bcrypt.hash(otp, salt);
        return hashcode;

    } catch (error) {
        console.log("otp hashing error -->", error);
        return error
    }
}

async function otpValidationFN(otp, hashcode) {

    try {
        const validation = await bcrypt.compare(otp, hashcode);
        return validation;

    } catch (error) {
        console.log("otp validation error -->", error);
        return error;
    }
}

export { otpHashingFN, otpValidationFN }