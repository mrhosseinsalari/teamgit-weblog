import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { Request } from "express";
import { MulterFile } from "../types/public";

export function UploadFile(fieldName: string) {
  return FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: join("public", "upload", "image"),
      filename: (req: Request, file: MulterFile, callback) => {
        const ext = extname(file.originalname);
        const newName = `${Date.now()}${ext}`;
        callback(null, newName);
      },
    }),
  });
}
