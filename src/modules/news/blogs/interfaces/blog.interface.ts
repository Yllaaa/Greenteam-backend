import { blogs, blogType } from "src/modules/db/schemas/schema";

type BlogType = "BLOGGER";

export interface BlogInterface {
    id: string;
    user_id: string;
    url: string;
    type: BlogType;
}
