import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { CommonController } from './common.controller';
import { CommonService } from './common.service';
import { CommonRepository } from './common.repository';

@Module({
  imports: [MailModule],
  controllers: [CommonController],
  providers: [CommonService, CommonRepository],
})
export class CommonModule {}
