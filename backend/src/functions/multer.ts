import multer from 'multer';
import fs from 'fs';
import path from 'path';
export const customStorage = (userId: string) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(
        __dirname,
        `../../../frontend/public/images/${userId}`,
      );

      try {
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      } catch (err) {
        console.error('Error creating upload directory:', err);
        cb(err as Error, uploadPath);
      }
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
