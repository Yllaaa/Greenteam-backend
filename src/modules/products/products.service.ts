import { Injectable } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { ProductReviewDto } from './dto/product-review.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { ProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
    constructor(
        private readonly productsRepository: ProductsRepository
    ) { }

    async createProduct(product: ProductDto, user: any) {
        product.seller_id = user.id;
        product.seller_type = 'User'
        return await this.productsRepository.createProduct(product);
    }

    async getProducts(options: GetProductsDto) {
        return await this.productsRepository.getProducts(options);
    }

    async addProductReview(review: ProductReviewDto, user: any) {
        review.user_id = user.id;
        return await this.productsRepository.addProductReview(review);
    }

}
