import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { GroupPostsService } from './posts.service';
import { CreatePostDto } from '../../shared-modules/posts/posts/dto/create-post.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupPostsController {
    constructor(
        private readonly groupPostsService: GroupPostsService,
    ) { }

    @Post(':groupId/publish-post')
    async createGroupPost(
        @Body() createPostDto: CreatePostDto,
        @Req() req,
        @Param('groupId') groupId: string) {

        const groupMemberId: string = req.user.id;

        return this.groupPostsService.createPost(createPostDto, groupId, groupMemberId);
    }
}
