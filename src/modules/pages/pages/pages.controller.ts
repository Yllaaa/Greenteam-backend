import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Get,
  Req,
  UseGuards,
  Res,
  HttpStatus,
  Query,
  NotFoundException,
  UseInterceptors,
  Delete,
  UploadedFiles,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-pages.dto';
import { CreatePageContactDto } from './dto/create-page-contact.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Response } from 'express';
import { ValidateProfileImagesInterceptor } from 'src/modules/common/upload-media/interceptors/validate-profileImages.interceptor';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetAllPagesDto } from 'src/modules/pages/pages/dto/get-pages.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Controller('')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post('create-page')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  @UseInterceptors(ValidateProfileImagesInterceptor)
  async createPage(
    @Body() data: CreatePageDto,
    @Req() req,
    @UploadedFiles()
    images: { avatar?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    return await this.pagesService.createPage({ page: data, images }, req.user);
  }

  @Get('check-slug-taken')
  async checkSlugTaken(@Query('slug') slug: string) {
    return await this.pagesService.checkSlugTaken(slug);
  }

  @Get('')
  async getAllPages(@Query() query: GetAllPagesDto, @Req() req) {
    const userId = req.user.id;
    return await this.pagesService.getAllPages(query, userId);
  }

  @Put(':slug')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  @UseInterceptors(ValidateProfileImagesInterceptor)
  async updatePage(
    @Param('slug') slug: string,
    @Body() data: UpdatePageDto,
    @Req() req,
    @UploadedFiles()
    images: { avatar?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    const userId = req.user.id;
    return await this.pagesService.updatePage(
      { page: data, images },
      slug,
      userId,
    );
  }

  @Get(':slug')
  async getPageById(@Param('slug') slug: string, @Req() req) {
    const userId = req.user.id;
    return await this.pagesService.getPageDetails(slug, userId);
  }

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
    return await this.pagesService.getPageContactsBySlug(slug);
  }

  @Get(':id/contacts-by-Id')
  async getPageContactById(@Param('id') id: string) {
    return await this.pagesService.getPageContactsById(id);
  }

  @Delete(':slug/contacts/:id')
  async deletePageContact(
    @Param('id') contactId: string,
    @Req() req,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    await this.pagesService.deletePageContact(contactId, userId);
    return res.status(HttpStatus.OK).json({ message: 'Contact deleted' });
  }

  @Post(':slug/toggle-follow')
  async addPageFollower(@Param('slug') slug: string, @Req() req) {
    return await this.pagesService.togglePageFollow(slug, req.user);
  }

  @Delete(':slug')
  async deletePage(@Param('slug') slug: string, @Req() req) {
    const userId = req.user.id;
    await this.pagesService.deletePage(slug, userId);
    return { message: 'Page deleted successfully' };
  }
}
