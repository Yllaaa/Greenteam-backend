import { Module } from '@nestjs/common';
import { MailJobModule } from './mails/mail-job.module';

@Module({
    imports: [
        MailJobModule
    ],
    controllers: [],
    providers: [],
})
export class JobsModule {}
