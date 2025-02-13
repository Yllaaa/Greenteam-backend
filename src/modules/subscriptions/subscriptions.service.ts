import { Injectable } from "@nestjs/common";
import { SubscriptionsRepository } from "./subscriptions.repository";

@Injectable()
export class SubscriptionsService {
    constructor(
        private readonly subRepository: SubscriptionsRepository
    ) {}
}