import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { FolloweesService } from "./followees.service";
import { PaginationDto } from "./dto/pagination.dto";
import { IdParamDto } from "./dto/id-param.dto";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";

@Controller('followees')
@UseGuards(JwtAuthGuard)
export class FolloweesController {
    constructor(
        private readonly followeesService: FolloweesService
    ) { }

    @Get()
    async getFollowees(@Query() pagination: PaginationDto, @Req() req) {
        pagination.offset ||= 0
        pagination.limit ||= 3
        return await this.followeesService.getFollowees(req.user.id, pagination.offset, pagination.limit);
    }

    @Post('add-followee')
    async addFollowee(@Body() followee: IdParamDto, @Req() req) {
        return await this.followeesService.addFollowee(req.user.id, followee.id);
    }

    @Delete(':id/delete-followee')
    async deleteFollowee(@Param() followee: IdParamDto, @Req() req) {
        return await this.followeesService.deleteFollowee(req.user.id, followee.id);
    }
}