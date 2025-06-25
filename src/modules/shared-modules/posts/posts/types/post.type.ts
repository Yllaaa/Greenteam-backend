import { InferSelectModel } from 'drizzle-orm';
import { posts } from 'src/modules/db/schemas/posts/posts';

export type Post = InferSelectModel<typeof posts>;
