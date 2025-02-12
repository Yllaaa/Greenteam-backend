import { Body, Controller, Param, Post, Get, Req, UseGuards, Res, HttpStatus } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PageDto } from './dto/pages.dto';
import { IdParamDto } from './dto/id-param.dto';
import { PageContactDto } from './dto/page-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
    constructor(
        private readonly pagesService: PagesService
    ){ }

    @Post('create-page')
    async createPage(@Body() page: PageDto, @Req() req){
        return await this.pagesService.createPage(page, req.user)
    }

    @Get()
    async getPage(@Req() req){
        return await this.pagesService.getPage(req.user)
    }

    @Post(':id/add-contact')
    async addPageContact(@Param() pageId: IdParamDto, @Body() contact: PageContactDto, @Req() req, @Res() res: Response){
        const pageUserId = await this.pagesService.getPageUserId(pageId.id)
        if(pageUserId !== req.user.id){
            res.status(HttpStatus.UNAUTHORIZED).send()
            return
        }
        await this.pagesService.addPageContact(contact, pageId.id)
        res.status(HttpStatus.CREATED).send()
    }

    @Get(':id/follow')
    async addPageFollower(@Param() pageId: IdParamDto, @Req() req){
        return await this.pagesService.addPageFollower(pageId.id, req.user)
    }
}
