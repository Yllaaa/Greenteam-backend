import { Injectable } from "@nestjs/common";
import { DrizzleService } from "src/modules/db/drizzle.service";

@Injectable()
export class StripeRepository {
    constructor(
        private readonly drizzleService: DrizzleService
    ){ }
}