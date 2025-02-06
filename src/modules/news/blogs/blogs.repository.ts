import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DrizzleService } from "src/modules/db/drizzle.service";
import { blogs } from "src/modules/db/schemas/schema";
type BlogInsert = typeof blogs.$inferInsert;

@Injectable()
export class BlogsRepository {
    constructor(private drizzle: DrizzleService) { }

    async getBlogs() {
        return await this.drizzle.db.query.blogs.findMany();
    }

    async getUserBlog(user_id: string) {
        return await this.drizzle.db.query.blogs.findFirst({
            where: eq(blogs.user_id, user_id)
        });
    }

    async addBlog(blog: any) {
        return await this.drizzle.db.insert(blogs).values(blog);
    }

    async delteBlog(user_id: string) {
        return await this.drizzle.db.delete(blogs).where(eq(blogs.user_id, user_id));
    }
}
