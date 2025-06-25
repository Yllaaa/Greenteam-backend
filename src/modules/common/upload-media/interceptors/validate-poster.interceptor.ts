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
export class ValidatePosterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files: { [key: string]: Express.Multer.File[] } = request.files || {};
    const poster = files['poster'] || [];
    const posterFile = Array.isArray(poster) ? poster[0] : poster;

    if (!posterFile) {
      return next.handle();
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
    ];

    const ext = extname(posterFile.originalname).toLowerCase();
    const mime = posterFile.mimetype.toLowerCase();

    if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(mime)) {
      throw new BadRequestException(
        `Invalid poster type: ${posterFile.originalname}. Allowed: jpg, jpeg, png, webp, heic.`,
      );
    }

    return next.handle();
  }
}
