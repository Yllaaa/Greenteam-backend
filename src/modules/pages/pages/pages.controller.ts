import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  Get,
  Req,
  UseGuards,
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
import { I18nService } from 'nestjs-i18n';
import { UpdatePageContactDto } from './dto/update-page-contact.dto';
import { SubscriptionGuard } from 'src/modules/auth/guards/subscription.guard';
import { SubscriptionRequired } from 'src/modules/subscriptions/decorator/subscription-required.decorator';

@Controller('')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(
    private readonly pagesService: PagesService,
    private readonly i18n: I18nService,
  ) {}

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

  @UseGuards(SubscriptionGuard)
  @SubscriptionRequired()
  @Post(':slug/add-contact')
  async addPageContact(
    @Param('slug') pageSlug: string,
    @Body() contact: CreatePageContactDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const newContact = await this.pagesService.addPageContact(
      contact,
      pageSlug,
      userId,
    );
    const translatedMessage = await this.i18n.t(
      'pages.pages.notifications.CONTACT_ADDED_SUCCESSFULLY',
    );
    return { message: translatedMessage, contact: newContact };
  }

  @Get(':slug/contact')
  async getPageContact(@Param('slug') slug: string) {
    const contact = await this.pagesService.getPageContactBySlug(slug);
    return { contact };
  }

  @Get(':id/contact-by-id')
  async getPageContactById(@Param('id') id: string) {
    const contact = await this.pagesService.getPageContactByPageId(id);
    return { contact };
  }

  @UseGuards(SubscriptionGuard)
  @SubscriptionRequired()
  @Put(':slug/contact')
  async updatePageContact(
    @Param('slug') slug: string,
    @Body() contactData: UpdatePageContactDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return await this.pagesService.updatePageContact(slug, contactData, userId);
  }

  @Delete(':slug/contact')
  async deletePageContact(@Param('slug') slug: string, @Req() req) {
    const userId = req.user.id;
    await this.pagesService.deletePageContact(slug, userId);
    const translatedMessage = await this.i18n.t(
      'pages.pages.notifications.CONTACT_DELETED',
    );
    return { message: translatedMessage };
  }

  @Post(':slug/toggle-follow')
  async addPageFollower(@Param('slug') slug: string, @Req() req) {
    return await this.pagesService.togglePageFollow(slug, req.user);
  }

  @Delete(':slug')
  async deletePage(@Param('slug') slug: string, @Req() req) {
    const userId = req.user.id;
    return await this.pagesService.deletePage(slug, userId);
  }
}
