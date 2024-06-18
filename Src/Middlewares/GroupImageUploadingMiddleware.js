import multer from "multer";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const path = join(__dirname, "../../Assets/profile");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path);
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {

    const validType = /jpg|png|jpeg/;
    const validation = validType.test(file.originalname.toLowerCase());

    if (validation) {
        cb(null, true);

    } else {
        cb(new Error("Invalid file type...."), false)
    }
}

const uploader = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 3 * 1024 * 1024
    }
});

const groupImageUploadingMW = (req, res, next) => {

    try {
        const upload = uploader.single("groupImage");
        upload(req, res, (err) => {

            if (err instanceof multer.MulterError) {
                res.status(415).json({ error: err.message });

            } else if (err) {
                res.status(413).json({ error: err.message });

            } else {
                next();
            }
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}

export { groupImageUploadingMW }