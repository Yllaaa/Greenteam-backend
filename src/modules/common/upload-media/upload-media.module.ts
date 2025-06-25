import { Module } from '@nestjs/common';
import { UploadMediaService } from './upload-media.service';

@Module({
  providers: [UploadMediaService],
  exports: [UploadMediaService],
})
export class UploadMediaModule {}
