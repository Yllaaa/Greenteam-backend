import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { GetPageProductsDto } from './dtos/get-page-products';
import { ValidateProductMediaInterceptor } from 'src/modules/common/upload-media/validateProductMedia.interceptor';
import { FilesInterceptor } from '@nestjs/platform-express';
@UseGuards(JwtAuthGuard)
@Controller('')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('create-product')
  @UseInterceptors(FilesInterceptor('images'), ValidateProductMediaInterceptor)
  async createProductFromUser(
    @Body() createProductDto: CreateProductDto,
    @Req() request: any,
    @Param('slug') slug: string,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const userId = request.user.id;
    const sellerType = 'page';

    return this.productsService.createProduct(
      {
        ...createProductDto,
        sellerType,
        slug,
        images,
      },
      userId,
    );
  }

  @Get('')
  async getPageProducts(
    @Query() getPageProductsDto: GetPageProductsDto,
    @Param('slug') slug: string,
  ) {
    return this.productsService.getPageProducts(getPageProductsDto, slug);
  }
}
