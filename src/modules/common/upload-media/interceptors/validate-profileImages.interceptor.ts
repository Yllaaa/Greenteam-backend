import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { extname } from 'path';

@Injectable()
export class ValidateProfileImagesInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files: { [key: string]: Express.Multer.File[] } = request.files || {};

    const avatarFiles = files['avatar'] || [];
    const avatarFile = Array.isArray(avatarFiles)
      ? avatarFiles[0]
      : avatarFiles;

    const coverFiles = files['cover'] || [];
    const coverFile = Array.isArray(coverFiles) ? coverFiles[0] : coverFiles;

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
    ];

    if (avatarFile) {
      const ext = extname(avatarFile.originalname).toLowerCase();
      const mime = avatarFile.mimetype.toLowerCase();

      if (
        !allowedExtensions.includes(ext) ||
        !allowedMimeTypes.includes(mime)
      ) {
        throw new BadRequestException(
          `Invalid avatar type: ${avatarFile.originalname}. Allowed: jpg, jpeg, png, webp, heic.`,
        );
      }
    }

    if (coverFile) {
      const ext = extname(coverFile.originalname).toLowerCase();
      const mime = coverFile.mimetype.toLowerCase();

      if (
        !allowedExtensions.includes(ext) ||
        !allowedMimeTypes.includes(mime)
      ) {
        throw new BadRequestException(
          `Invalid cover type: ${coverFile.originalname}. Allowed: jpg, jpeg, png, webp, heic.`,
        );
      }
    }

    return next.handle();
  }
}
