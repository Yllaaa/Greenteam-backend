import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MailJobWorker } from "./mail-job.worker";
import { MailJobService } from "./mail-job.service";
import { MailModule } from "../../mail/mail.module";

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'mails',
        }),
        MailModule
    ],
    controllers: [],
    providers: [MailJobService, MailJobWorker],
    exports: [MailJobService],
})
export class MailJobModule {}