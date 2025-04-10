import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { CommonRepository } from './common.repository';
import { HttpModule } from '@nestjs/axios';
import { CityImportService } from './city-seed.service';
import { UploadMediaModule } from './upload-media/upload-media.module';

@Module({
  imports: [
    MailModule,
    HttpModule.register({
      timeout: 20000,
      maxRedirects: 5,
    }),
    UploadMediaModule,
  ],
  controllers: [CommonController],
  providers: [CommonService, CommonRepository, CityImportService],
  exports: [CommonService, CommonRepository],
})
export class CommonModule {}
