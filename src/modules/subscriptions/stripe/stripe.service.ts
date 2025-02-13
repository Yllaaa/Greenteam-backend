import { Injectable } from "@nestjs/common";
import { StripeRepository } from "./stripe.repository";

@Injectable()
export class StripeService{
    constructor(
        private readonly stripeRepository: StripeRepository
    ){ }
}