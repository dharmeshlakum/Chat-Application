import {userModel} from "../Models/User/UserCollection.js";
import {loginModel} from "../Models/Login/LoginCollection.js";

const loginValidationMW = async(req, res, next)=>{

    try {
        const { userInput, password} = req.body;
        if(!userInput || !password) return res.status(400).json({error: "All fields are required !"});

        const user = await userModel.findOne({
            $or: [
                {emailAddress: userInput},
                {username: userInput}
            ]
        });
        if(!user) return res.status(404)
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: error.message});
    }
}

export { loginValidationMW }
