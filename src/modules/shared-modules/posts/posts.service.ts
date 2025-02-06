import { Injectable } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { Post } from './types/post.type';
import { CreatePostDto } from './dto/create-post.dto';
@Injectable()
export class PostsService {
  constructor(private readonly postsRepository: PostsRepository) { }
  async createPost(dto: CreatePostDto, userId): Promise<Post> {
    const post = await this.postsRepository.createPost(
      dto.content,
      dto.mainTopicId,
      dto.creatorId,
      dto.creatorType,
      userId,
    );
    if (dto.subtopicIds.length > 0) {
      await Promise.all(
        dto.subtopicIds.map(async (topicId) => {
          await this.postsRepository.addSubtopic(post.id, topicId);
        }),
      );
    }
    return (await this.postsRepository.getPostById(post.id)) as unknown as Post;
  }

  async getPostsByMainTopic(topic: string) {
    return await this.postsRepository.getPostsByMainTopic(topic);
  }

  async getPostsBySubTopic(subTopic: string) {
    return await this.postsRepository.getPostsBySubTopic(subTopic);
  }

  async getAllPosts() {
    return await this.postsRepository.getAllPosts();
  }
}
