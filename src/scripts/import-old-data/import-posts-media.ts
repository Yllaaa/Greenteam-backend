import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { Injectable } from '@nestjs/common';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { entitiesMedia, posts } from 'src/modules/db/schemas/schema';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';

@Injectable()
class ImportPostsMediaScript {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly uploadMediaService: UploadMediaService,
  ) {}

  async run() {
    const db = this.drizzleService.db;

    console.log('🚀 Starting media import...');

    // Read CSV
    const rows: any[] = await new Promise((resolve, reject) => {
      const data: any[] = [];
      fs.createReadStream('src/scripts/import-old-data/posts_backup.csv')
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data))
        .on('error', reject);
    });

    console.log(`📦 Loaded ${rows.length} rows.`);

    let uploaded = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const postFile = row.postFile?.trim();
        if (!postFile) {
          skipped++;
          continue;
        }

        // Only allow images
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(postFile);
        if (!isImage) {
          skipped++;
          continue;
        }

        // Find the post using oldId
        const postOldId = Number(row.id);
        const post = await db.query.posts.findFirst({
          where: (p, { eq }) => eq(p.oldId, postOldId),
        });

        if (!post) {
          skipped++;
          continue;
        }

        // Build local file path
        const localPath = path.join(
          '/home/olddata/old-greanteam-data',
          postFile,
        );

        if (!fs.existsSync(localPath)) {
          console.warn(`⚠️ File not found: ${localPath}`);
          skipped++;
          continue;
        }

        // Simulate Multer-like file object
        const buffer = fs.readFileSync(localPath);
        const mimetype = this.getMimeType(localPath);
        const fileName = path.basename(localPath);

        const mockFile: Express.Multer.File = {
          fieldname: 'file',
          originalname: fileName,
          encoding: '7bit',
          mimetype,
          size: buffer.length,
          destination: '',
          filename: fileName,
          path: '',
          buffer,
          stream: fs.createReadStream(localPath),
        };

        // Upload to S3 using your existing service
        const uploadedFiles = await this.uploadMediaService.uploadFilesToS3(
          { images: [mockFile] },
          'posts',
        );

        // Attach media to the post using your existing handler
        if (uploadedFiles?.images?.length > 0) {
          await this.handlePostMedia(post.id, uploadedFiles);
          uploaded++;
        } else {
          skipped++;
        }
      } catch (err: any) {
        failed++;
        console.error(`❌ Failed for row ${row.id}:`, err.message);
      }
    }

    console.log(
      `✅ Done. Uploaded: ${uploaded}, Skipped: ${skipped}, Failed: ${failed}`,
    );
  }

  // Utility to determine MIME type by extension
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }

  // You already have this in your post service — import if needed
  private async handlePostMedia(
    postId: string,
    uploadedFiles: {
      images: any[];
      audio: any[];
      document: any[];
    },
  ) {
    // If you're using a specific service or method, replace this
    for (const file of uploadedFiles.images) {
      await this.drizzleService.db.insert(entitiesMedia).values({
        parentId: postId,
        parentType: 'post',
        mediaUrl: file.location,
        mediaType: 'image',
      });
    }
  }
}

// Standalone runner
(async () => {
  const drizzleService = new DrizzleService();
  await drizzleService.onModuleInit();

  // you must instantiate your UploadMediaService correctly based on your DI setup
  const uploadMediaService = new UploadMediaService(/* inject deps here */);

  const importer = new ImportPostsMediaScript(
    drizzleService,
    uploadMediaService,
  );
  await importer.run();

  await drizzleService.onModuleDestroy();
})();
