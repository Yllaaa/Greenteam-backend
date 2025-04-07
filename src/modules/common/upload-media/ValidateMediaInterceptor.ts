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
export class ValidateMediaInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const files: { [key: string]: Express.Multer.File[] } = request.files || {};

    this.validateMediaConstraints(files);

    return next.handle();
  }

  private validateMediaConstraints(files: {
    [key: string]: Express.Multer.File[];
  }): void {
    const mediaCounts = {
      images: 0,
      audio: 0,
      document: 0,
    };

    const fileTypes = {
      images: ['.jpg', '.jpeg', '.png', '.webp'],
      audio: ['.mp3', '.wav'],
      document: ['.pdf', '.docx'],
    };

    Object.keys(files).forEach((key) => {
      const groupFiles = files[key];
      for (const file of groupFiles) {
        const fileExt = extname(file.originalname).toLowerCase();
        if (fileTypes.images.includes(fileExt)) mediaCounts.images++;
        else if (fileTypes.audio.includes(fileExt)) mediaCounts.audio++;
        else if (fileTypes.document.includes(fileExt)) mediaCounts.document++;
      }
    });

    if (
      !(
        (mediaCounts.images <= 3 &&
          mediaCounts.audio === 1 &&
          mediaCounts.document === 0) || // 3 images + 1 audio
        (mediaCounts.images <= 4 &&
          mediaCounts.audio === 0 &&
          mediaCounts.document === 0) || // 4 images only
        (mediaCounts.images === 0 &&
          mediaCounts.audio === 1 &&
          mediaCounts.document === 0) || // 1 audio only
        (mediaCounts.images === 0 &&
          mediaCounts.audio === 0 &&
          mediaCounts.document === 1)
      )
    ) {
      throw new BadRequestException(
        'Invalid media combination. Allowed: (1) up to 3 images + 1 audio, (2) up to 4 images, (3) 1 audio only, or (4) 1 document only.',
      );
    }
  }
}
