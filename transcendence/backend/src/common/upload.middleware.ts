import { MulterModuleOptions } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

// Image file filter function
export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

// Multer configuration options
export const multerConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const originalName = file.originalname.split('.')[0];
      const fileExtName = extname(file.originalname);
      callback(null, `${originalName}-${uniqueSuffix}${fileExtName}`);
    },
  }),
  fileFilter: imageFileFilter,
};
