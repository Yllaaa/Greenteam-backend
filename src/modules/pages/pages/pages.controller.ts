import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Req,
  UseGuards,
  Res,
  HttpStatus,
  Query,
  NotFoundException,
  Delete,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-pages.dto';
import { CreatePageContactDto } from './dto/create-page-contact.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post('create-page')
  async createPage(@Body() data: CreatePageDto, @Req() req) {
    return await this.pagesService.createPage(data, req.user);
  }

  @Get('check-slug-taken')
  async checkSlugTaken(@Query('slug') slug: string) {
    return await this.pagesService.checkSlugTaken(slug);
  }

  @Get()
  async getPage(@Req() req) {
    return await this.pagesService.getPage(req.user);
  }

  //   @Get(':id')
  //   async getPageById(@Param() pageId: IdParamDto) {
  //     return await this.pagesService.getPageById(pageId.id);
  //   }

  @Post(':slug/add-contact')
  async addPageContact(
    @Param('slug') pageSlug: string,
    @Body() contact: CreatePageContactDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    await this.pagesService.addPageContact(contact, pageSlug, userId);
    return { message: 'Contact added successfully' };
  }

  @Get(':slug/contacts')
  async getPageContact(@Param('slug') slug: string) {
    return await this.pagesService.getPageContacts(slug);
  }

  @Delete(':slug/contacts/:id')
  async deletePageContact(
    @Param('slug') pageSlug: string,
    @Param('id') contactId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    await this.pagesService.deletePageContact(contactId, userId);
    return res.status(HttpStatus.OK).json({ message: 'Contact deleted' });
  }

  @Post(':id/follow')
  async addPageFollower(@Param('pageId') pageId: string, @Req() req) {
    return await this.pagesService.addPageFollower(pageId, req.user);
  }

  //   @Get(':id/events')
  //   async getPageEvents(
  //     @Param() pageId: IdParamDto,
  //     @Query() paginationQuery: PaginationQueryDto,
  //   ) {
  //     const { limit, offset } = paginationQuery;
  //     return await this.pagesService.getPageEvents(pageId.id, limit, offset);
  //   }

  //   @Get(':id/posts')
  //   async getPagePosts(
  //     @Param() pageId: IdParamDto,
  //     @Query() paginationQuery: PaginationQueryDto,
  //   ) {
  //     const { limit, offset } = paginationQuery;
  //     return await this.pagesService.getPagePosts(pageId.id, limit, offset);
  //   }
}
