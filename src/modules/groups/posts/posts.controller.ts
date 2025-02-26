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
import { PostsService } from '../../shared-modules/posts/posts/posts.service';
import { GetPostsDto } from '../../shared-modules/posts/posts/dto/get-posts.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupPostsController {
    constructor(
        private readonly groupPostsService: GroupPostsService,
        private readonly postsService: PostsService,
    ) { }

    @Post(':groupId/publish-post')
    async createGroupPost(
        @Body() createPostDto: CreatePostDto,
        @Req() req,
        @Param('groupId') groupId: string) {

        const groupMemberId: string = req.user.id;

        return this.groupPostsService.createPost(createPostDto, groupId, groupMemberId);
    }

    @Get(':groupId/get-posts')
    async getGroupPosts(
        @Req() req,
        @Query() getPostDto: GetPostsDto,
    ) {
        const userId: string = req.user.id;
        return this.postsService.getPosts(getPostDto, userId);
    }
}
