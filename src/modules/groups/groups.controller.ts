import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { InsertGroupDto, UpdateGroupDto, GetGroupDtos } from './dtos/groups.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) { }

    @Post()
    async createGroup(@Body() data: InsertGroupDto) {
        return this.groupsService.createGroup(data);
    }

    @Get()
    async getGroups(@Query() query: GetGroupDtos) {
        return this.groupsService.getAllGroups(
            { limit: query.limit ?? 10, page: query.page ?? 1 },
        );
    }

    @Get(':id')
    async getGroupById(@Param('id') groupId: string) {
        return this.groupsService.getGroupById(groupId);
    }

    @Put(':id')
    async updateGroupById(@Param('id') groupId: string, @Req() request, @Body() data: UpdateGroupDto) {
        const userId: string = request.user.id;
        return this.groupsService.updateGroupById(groupId, userId, data);
    }

    @Delete(':id')
    async deleteGroup(@Param('id') groupId: string, @Req() request) {
        const userId: string = request.user.id;
        return this.groupsService.deleteGroup(groupId, userId);
    }
}
