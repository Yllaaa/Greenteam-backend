import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { ProductReviewDto } from './dto/product-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService
    ){ }

    @Post()
    async createProduct(@Body() product: ProductDto, @Req() req) {
        return await this.productsService.createProduct(product, req.user);
    }

    @Get()
    async getProducts(@Query() options: GetProductsDto) {
        return await this.productsService.getProducts(options);
    }

    @Post('reviews')
    async addProductReview(@Body() review: ProductReviewDto, @Req() req) {
        return await this.productsService.addProductReview(review, req.user);
    }
}
