import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { Injectable, BadRequestException } from '@nestjs/common';
import { DrizzleService } from 'src/modules/db/drizzle.service';
import { entitiesMedia, posts } from 'src/modules/db/schemas/schema';
import { UploadMediaService } from 'src/modules/common/upload-media/upload-media.service';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';

// Minimal mocks for standalone script
class MockI18nService {
  translate(key: string, options?: any) {
    // just return key for simplicity
    return key;
  }
}

class MockConfigService {
  get<T>(key: string): T {
    const map: Record<string, any> = {
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION,
      AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    };
    return map[key] as T;
  }
}

@Injectable()
class ImportPostsMediaScript {
  constructor(
    private readonly drizzleService: DrizzleService,
    private readonly uploadMediaService: UploadMediaService,
  ) {}

  async run() {
    const db = this.drizzleService.db;

    console.log('🚀 Starting media import...');

    // Load CSV
    const rows: any[] = await new Promise((resolve, reject) => {
      const data: any[] = [];
      fs.createReadStream('src/scripts/import-old-data/posts_backup.csv')
        .pipe(csv())
        .on('data', (row) => data.push(row))
        .on('end', () => resolve(data))
        .on('error', reject);
    });

    console.log(`📦 Loaded ${rows.length} rows.`);

    let uploaded = 0,
      skipped = 0,
      failed = 0;

    for (const row of rows) {
      try {
        const postFile = row.postFile?.trim();
        if (!postFile || !/\.(jpg|jpeg|png|gif|webp)$/i.test(postFile)) {
          skipped++;
          continue;
        }

        const postOldId = Number(row.id);
        const post = await db.query.posts.findFirst({
          where: (p, { eq }) => eq(p.oldId, postOldId),
        });

        if (!post) {
          skipped++;
          continue;
        }

        const localPath = path.join(
          '/home/olddata/old-greanteam-data',
          postFile,
        );
        if (!fs.existsSync(localPath)) {
          console.warn(`⚠️ File not found: ${localPath}`);
          skipped++;
          continue;
        }

        const buffer = fs.readFileSync(localPath);
        const mimetype = this.getMimeType(localPath);
        const mockFile: Express.Multer.File = {
          fieldname: 'file',
          originalname: path.basename(localPath),
          encoding: '7bit',
          mimetype,
          size: buffer.length,
          destination: '',
          filename: path.basename(localPath),
          path: '',
          buffer,
          stream: fs.createReadStream(localPath),
        };

        const uploadedFiles = await this.uploadMediaService.uploadFilesToS3(
          { images: [mockFile] },
          'posts',
        );

        if (uploadedFiles.images?.length > 0) {
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

  private async handlePostMedia(
    postId: string,
    uploadedFiles: { images: any[]; audio: any[]; document: any[] },
  ) {
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

// Runner
(async () => {
  const drizzleService = new DrizzleService();
  await drizzleService.onModuleInit();

  const uploadMediaService = new UploadMediaService(
    new MockI18nService() as unknown as I18nService,
    new MockConfigService() as unknown as ConfigService,
  );

  const importer = new ImportPostsMediaScript(
    drizzleService,
    uploadMediaService,
  );
  await importer.run();

  await drizzleService.onModuleDestroy();
})();
