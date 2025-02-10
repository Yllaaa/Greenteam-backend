import { IsDate, IsIn, IsString, IsUUID } from "class-validator";
import { EventCategory } from "src/modules/db/schemas/schema";

export class EventsDto {
    creator_id: string

    creator_type: string

    @IsString()
    name: string

    @IsString()
    description: string

    @IsString()
    location: string

    @IsDate()
    start_date: Date

    @IsDate()
    end_date: Date

    @IsIn(EventCategory.enumValues)
    category: string

    poster: string

    @IsUUID()
    topic_id: string
}