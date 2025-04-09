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
export class ValidateBannerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files: { [key: string]: Express.Multer.File[] } = request.files || {};
    const banner = files['banner'] || [];
    const bannerFile = Array.isArray(banner) ? banner[0] : banner;

    if (!bannerFile) {
      return next.handle();
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic'];
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
    ];

    const ext = extname(bannerFile.originalname).toLowerCase();
    const mime = bannerFile.mimetype.toLowerCase();

    if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(mime)) {
      throw new BadRequestException(
        `Invalid banner type: ${bannerFile.originalname}. Allowed: jpg, jpeg, png, webp, heic.`,
      );
    }

    return next.handle();
  }
}
