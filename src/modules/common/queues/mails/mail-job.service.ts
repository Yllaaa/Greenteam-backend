import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Queue } from "bullmq";
import { MailService } from "../../mail/mail.service";

@Injectable()
export class MailJobService {
    constructor(
        @InjectQueue('mails') private readonly mailsQueue: Queue
    ) { }

    async addVerificationMailJob(options: {email: string, token: string}) {
        await this.mailsQueue.add(MailService.prototype.sendVerificationEmail.name, options);
    }

    async addResetPasswordMailJob(options: {email: string, token: string}) {
        await this.mailsQueue.add(MailJobService.prototype.addResetPasswordMailJob.name, options);
    }
}