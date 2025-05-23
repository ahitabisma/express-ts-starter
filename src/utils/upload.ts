import path from "path";
import fs from "fs";

// Folder untuk menyimpan foto profil
export const UPLOAD_DIR = path.join(process.cwd(), 'public', 'photo');

// Memastikan direktori upload ada
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}