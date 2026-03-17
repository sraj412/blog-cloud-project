import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async findAllPublished(): Promise<Post[]> {
    return this.postsRepository.find({
      where: { status: PostStatus.PUBLISHED },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByAuthor(authorId: string): Promise<Post[]> {
    return this.postsRepository.find({
      where: { authorId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneByAuthor(id: string, authorId: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id, authorId },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findOne(id: string, requirePublished = false): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (requirePublished && post.status !== PostStatus.PUBLISHED) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async create(authorId: string, createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postsRepository.create({
      ...createPostDto,
      authorId,
      status: PostStatus.DRAFT,
    });
    return this.postsRepository.save(post);
  }

  async update(
    id: string,
    authorId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    const post = await this.findOne(id);

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    Object.assign(post, updatePostDto);
    return this.postsRepository.save(post);
  }

  async publish(id: string, authorId: string): Promise<Post> {
    const post = await this.findOne(id);

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only publish your own posts');
    }

    post.status = PostStatus.PUBLISHED;
    return this.postsRepository.save(post);
  }

  async remove(id: string, authorId: string): Promise<void> {
    const post = await this.findOne(id);

    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postsRepository.remove(post);
  }
}
