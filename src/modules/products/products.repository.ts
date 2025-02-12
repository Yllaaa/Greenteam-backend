import { Injectable } from "@nestjs/common";
import { DrizzleService } from "../db/drizzle.service";
import { ProductReviewDto } from "./dto/product-review.dto";
import { GetProductsDto } from "./dto/get-products.dto";
import { productReviews, products } from "../db/schemas/products/products";
import { and, eq, SQL } from "drizzle-orm";

@Injectable()
export class ProductsRepository{
    constructor(
        private readonly drizzleService: DrizzleService
    ) { }

    async createProduct(product: any) {
        return await this.drizzleService.db.insert(products).values(product).returning();
    }

    async getProducts(options: GetProductsDto) {
        const conditions: SQL[] = [];
        if(options.topic_id) conditions.push(eq(products.topic_id, options.topic_id));
        if (options.sub_topic_id) conditions.push(eq(products.sub_topic_id, options.sub_topic_id));
        if(options.market_type) conditions.push(eq(products.market_type, options.market_type));
        return await this.drizzleService.db.query.products.findMany({
            with: {
                topic: true,
                subTopic: true
            },
            where: and(...conditions),
        });
    }

    async addProductReview(review: ProductReviewDto) {
        return await this.drizzleService.db.insert(productReviews).values(review).returning();
    }

}