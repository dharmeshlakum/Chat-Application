
const editProfileMW = async (req, res, next) => {

    try {
        const { username, emailAddress } = req;
        console.log(req.body);
    } catch (error) {
        console.log("Error while updating ptofile -->", error);
        res.status(500).json({ error: error.message });
    }
}

export { editProfileMW }