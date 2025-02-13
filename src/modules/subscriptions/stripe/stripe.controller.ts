import { Controller } from "@nestjs/common";
import { StripeService } from "./stripe.service";

@Controller()
export class StripeController {
    constructor(
        private readonly stripeService: StripeService
    ){ }
}