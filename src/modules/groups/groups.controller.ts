import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GetGroupDtos } from './dtos/get-groups.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateGroupDto } from './dtos/create-group.dto';
import { UpdateGroupDto } from './dtos/update-group.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidateBannerInterceptor } from '../common/upload-media/interceptors/validate-groupBanner.interceptor';

@Controller('')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post('create-group')
  @UseInterceptors(FileInterceptor('banner'), ValidateBannerInterceptor)
  async createGroup(
    @Body() dto: CreateGroupDto,
    @Req() req,
    @UploadedFile() banner: Express.Multer.File,
  ) {
    const userId: string = req.user.id;
    return this.groupsService.createGroup({ dto, banner }, userId);
  }

  @Get()
  async getGroups(@Query() query: GetGroupDtos, @Req() request) {
    const userId: string = request.user.id;
    return this.groupsService.getAllGroups(
      { limit: query.limit ?? 10, page: query.page ?? 1 },
      userId,
      query.topicId,
    );
  }

  @Get(':id')
  async getGroupById(@Param('id') groupId: string, @Req() request) {
    const userId: string = request.user.id;
    return this.groupsService.getGroupDetails(groupId, userId);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('banner'), ValidateBannerInterceptor)
  async updateGroupById(
    @Param('id') groupId: string,
    @Req() request,
    @Body() data: UpdateGroupDto,
    @UploadedFile() banner: Express.Multer.File,
  ) {
    const userId: string = request.user.id;
    return this.groupsService.updateGroup(groupId, userId, {
      dto: data,
      banner,
    });
  }

  @Delete(':id')
  async deleteGroup(@Param('id') groupId: string, @Req() request) {
    const userId: string = request.user.id;
    return this.groupsService.deleteGroup(groupId, userId);
  }
}
