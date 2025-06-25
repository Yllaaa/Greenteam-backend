import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { MailService } from "../../mail/mail.service";

@Processor('mails')
export class MailJobWorker extends WorkerHost {
    constructor(
        private readonly mailService: MailService
    ) {
        super();
    }
    async process(job: Job<any, any, string>): Promise<any> {
        switch (job.name) {
            case MailService.prototype.sendVerificationEmail.name:
                await this.mailService.sendVerificationEmail(job.data.email, job.data.token);
                break;
            case MailService.prototype.sendPasswordResetEmail.name:
                await this.mailService.sendPasswordResetEmail(job.data.email, job.data.token);
                break;
        }
    }
}