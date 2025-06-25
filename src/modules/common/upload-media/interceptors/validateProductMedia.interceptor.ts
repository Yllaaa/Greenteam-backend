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
export class ValidateProductMediaInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files: { [key: string]: Express.Multer.File[] } = request.files || {};

    const images = files['images'] || [];
    const imageFiles = Array.isArray(images) ? images : [images];

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
    ];

    for (const file of imageFiles) {
      const ext = extname(file.originalname).toLowerCase();
      const mime = file.mimetype.toLowerCase();

      if (
        !allowedExtensions.includes(ext) ||
        !allowedMimeTypes.includes(mime)
      ) {
        throw new BadRequestException(
          `Invalid file type: ${file.originalname}. Allowed types: jpg, jpeg, png, webp, heic.`,
        );
      }
    }

    if (imageFiles.length > 4) {
      throw new BadRequestException('You can only upload up to 4 images.');
    }

    return next.handle();
  }
}
