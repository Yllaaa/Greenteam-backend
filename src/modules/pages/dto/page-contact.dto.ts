import { IsEmail, IsPhoneNumber, IsString } from "class-validator"

export class PageContactDto{
    page_id: string

    @IsString()
    name: string

    @IsString()
    title: string

    @IsEmail()
    email: string

    @IsString()
    @IsPhoneNumber()
    phone_num: string

    personal_picture: string
}