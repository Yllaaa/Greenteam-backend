import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(
        null,
        `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
      );
    },
  }),
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = {
      images: ['image/jpeg', 'image/png', 'image/gif'],
      docs: ['application/pdf', 'application/msword'],
      audio: ['audio/mpeg', 'audio/wav'],
    };

    if (
      (file.fieldname === 'images' &&
        allowedMimeTypes.images.includes(file.mimetype)) ||
      (file.fieldname === 'document' &&
        allowedMimeTypes.docs.includes(file.mimetype)) ||
      (file.fieldname === 'audio' &&
        allowedMimeTypes.audio.includes(file.mimetype))
    ) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
};
