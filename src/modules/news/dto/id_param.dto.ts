import { Injectable } from "@nestjs/common";
import { IsUUID } from "class-validator";

@Injectable()
export class IdParamDto {
    @IsUUID()
    id: string;
}