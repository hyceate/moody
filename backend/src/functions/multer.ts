import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const customStorage = (userId: string) =>
  multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadPath = path.join(
        __dirname,
        `../../../frontend/public/images/${userId}`,
      );

      try {
        await fs.promises.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
      } catch (err: any) {
        console.error('Error creating upload directory:', err);
        cb(null, err);
      }
    },
    filename: async (req, file, cb) => {
      const uuid = crypto.randomUUID();
      const filename = `${Date.now()}-${uuid}`;
      cb(null, filename);
    },
  });

export const uploadPin = (userId: string) => {
  return multer({
    storage: customStorage(userId),
    fileFilter: (req, file, cb) => {
      const validMimeTypes = ['image/jpeg', 'image/png'];
      if (validMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
      }
    },
  });
};
export const processUploadedFile = async (
  file: Express.Multer.File,
  userId: string,
) => {
  const inputPath = file.path;
  const tempOutputPath = `${inputPath}.temp`;
  const outputPath = path.join(
    __dirname,
    `../../../frontend/public/images/${userId}`,
    `${Date.now()}-${crypto.randomUUID()}.webp`,
  );

  try {
    const processedImage = await sharp(inputPath)
      .resize({
        width: 508,
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toFormat('webp')
      .toFile(tempOutputPath);
    await fs.promises.rename(tempOutputPath, outputPath);

    // Clean up original file
    await fs.promises.unlink(inputPath);
    console.log(processedImage);
    return {
      filePath: `/images/${userId}/${path.basename(outputPath)}`,
      imgWidth: processedImage.width,
      imgHeight: processedImage.height,
    };
  } catch (err) {
    console.error('Error processing and saving image:', err);
    throw err;
  }
};

const profileAvatarStorage = (userId: string) => {
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
        position: sharp.strategy.attention,
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
