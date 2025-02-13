import { Injectable } from "@nestjs/common";
import { DrizzleService } from "../db/drizzle.service";

@Injectable()
export class SubscriptionsRepository {
    constructor(
        private readonly drizzleService: DrizzleService
    ) { }
}