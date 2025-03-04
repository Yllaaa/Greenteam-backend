import { Injectable } from '@nestjs/common';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from '../../comments/dtos/create-comment.dto';
import { RepliesRepository } from '../../comments/repositories/replies.repository';
import { PostsRepository } from '../posts/posts.repository';
import { CommentsRepository } from '../../comments/repositories/comments.repository';
import { SQL } from 'drizzle-orm';
@Injectable()
export class PostCommentsService {}
