import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
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

export const profileAvatarStorage = (userId: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(
        __dirname,
        `../../../frontend/public/images/${userId}`,
      );
      fs.mkdir(uploadPath, { recursive: true }, (err) => {
        if (err) {
          console.error('Error creating upload directory:', err);
          return cb(err, uploadPath);
        }
        cb(null, uploadPath);
      });
    },
    filename: (req, file, cb) => {
      const outputPath = path.join(
        __dirname,
        `../../../frontend/public/images/${userId}/profile.webp`,
      );
      cb(null, 'profile.webp');
    },
  });
};

// Multer setup for file upload
export const upload = (userId: string) =>
  multer({
    storage: profileAvatarStorage(userId),
    fileFilter: (req, file, cb) => {
      const validMimeTypes = ['image/jpeg', 'image/png'];
      if (validMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
      }
    },
  }).single('avatar');

export const processAvatar = async (file: any, userId: string) => {
  const inputPath = file.path;
  const tempOutputPath = `${inputPath}.temp`;
  const outputPath = path.join(
    __dirname,
    `../../../frontend/public/images/${userId}/profile.webp`,
  );
  try {
    // Resize and process the image to a temporary output path
    await sharp(inputPath)
      .resize({
        width: 300,
        height: 300,
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy,
      })
      .toFormat('webp')
      .toFile(tempOutputPath);
    await fs.promises.copyFile(tempOutputPath, outputPath);
    await fs.promises.unlink(tempOutputPath);

    return outputPath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};
