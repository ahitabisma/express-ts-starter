import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { ResponseError } from "../types/response.error";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/photo');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new ResponseError(400, 'Only image files are allowed', {
            file: ['Only image files are allowed']
        }));
    }
};

export const uploadPhoto = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1 * 1024 * 1024 } // 1MB limit
}).single('photo');