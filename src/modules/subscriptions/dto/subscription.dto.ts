import { IsIn } from "class-validator";
import { subscriptionTypes } from "src/modules/db/schemas/schema";

export class SubscriptionDto{
    @IsIn(subscriptionTypes.enumValues)
    type: typeof subscriptionTypes.enumValues[number];
}