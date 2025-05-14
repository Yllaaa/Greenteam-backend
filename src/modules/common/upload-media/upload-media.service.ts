import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import * as ffmpeg from 'fluent-ffmpeg';
import { extname } from 'path';
import { Request } from 'express';
import { diskStorage } from 'multer';
import * as sharp from 'sharp';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class UploadMediaService {
  private s3: S3;
  private readonly MAX_IMAGE_SIZE = 10; // MB
  private readonly MAX_AUDIO_SIZE = 10; // MB
  private readonly MAX_DOC_SIZE = 50; // MB
  private readonly MAX_AUDIO_DURATION = 60; // seconds
  private readonly ALLOWED_IMAGES = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.heic',
    '.gif',
    '.avif',
    '.svg',
  ];
  private readonly ALLOWED_DOCS = ['.pdf', '.docx'];
  private readonly ALLOWED_AUDIO = ['.mp3', '.wav'];
  

  constructor(
    private readonly i18n: I18nService,
    private readonly configService: ConfigService) {
    this.s3 = new S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    });
  }

  private validateFile(file: Express.Multer.File): void {
    const fileExt = extname(file.originalname).toLowerCase();
    const fileSizeMB = file.size / (1024 * 1024);
    if (this.ALLOWED_IMAGES.includes(fileExt)) {
      if (fileSizeMB > this.MAX_IMAGE_SIZE) {
        throw new BadRequestException(
          this.i18n.translate('common.common.errors.MAX_IMAGE_SIZE', {
            args: { MAX_IMAGE_SIZE: this.MAX_IMAGE_SIZE },
          }),
        );
      }
    } else if (this.ALLOWED_DOCS.includes(fileExt)) {
      if (fileSizeMB > this.MAX_DOC_SIZE) {
        throw new BadRequestException(
          this.i18n.translate('common.common.errors.MAX_DOC_SIZE', {
            args: { MAX_DOC_SIZE: this.MAX_DOC_SIZE },
          }),
        );
      }
    } else if (this.ALLOWED_AUDIO.includes(fileExt)) {
      if (fileSizeMB > this.MAX_AUDIO_SIZE) {
        throw new BadRequestException(
          this.i18n.translate('common.common.errors.MAX_AUDIO_SIZE', {
            args: { MAX_AUDIO_SIZE: this.MAX_AUDIO_SIZE },
          }),
        );
      }
    } else {
      throw new BadRequestException('common.common.errors.INVALID_FILE_TYPE');
    }
  }

  private async checkAudioDuration(file: Express.Multer.File): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(file.path).ffprobe((err, metadata) => {
        if (err) {
          return reject(new BadRequestException('common.common.errors.INVALID_AUDIO_TYPE'));
        }
        const duration = metadata.format.duration;
        if (duration > this.MAX_AUDIO_DURATION) {
          return reject(
            new BadRequestException(
              this.i18n.translate('common.common.errors.AUDIO_LIMIT_TIME_EXCEEDED', {
                args: { AUDIO_LIMIT_TIME_EXCEEDED: this.MAX_AUDIO_DURATION },
              }),
            ),
          );
        }
        resolve();
      });
    });
  }

  private validateMediaCombination(files: {
    images?: Express.Multer.File[];
    audio?: Express.Multer.File[];
    document?: Express.Multer.File[];
  }): void {
    const imageCount = files.images?.length || 0;
    const audioCount = files.audio?.length || 0;
    const docCount = files.document?.length || 0;

    const validCombination =
      (imageCount <= 3 && audioCount === 1 && docCount === 0) || // 3 images + 1 audio
      (imageCount <= 4 && audioCount === 0 && docCount === 0) || // 4 images only
      (imageCount === 0 && audioCount === 1 && docCount === 0) || // 1 audio only
      (imageCount === 0 && audioCount === 0 && docCount === 1); // 1 document only

    if (!validCombination) {
      throw new BadRequestException(
        'common.common.errors.INVALID_MEDIA_COMBINATION',
      );
    }
  }

  private async optimizeImage(file: Express.Multer.File): Promise<Buffer> {
    const fileExt = extname(file.originalname).toLowerCase();

    if (['.jpg', '.jpeg', '.png'].includes(fileExt)) {
      let optimizer = sharp(file.buffer).resize({
        width: 1200,
        height: 1200,
        fit: 'inside',
        withoutEnlargement: true,
      });

      if (['.jpg', '.jpeg'].includes(fileExt)) {
        optimizer = optimizer.jpeg({ quality: 90 });
      } else if (fileExt === '.png') {
        optimizer = optimizer.png({ compressionLevel: 8 });
      }

      return await optimizer.toBuffer();
    } else if (fileExt === '.webp') {
      return await sharp(file.buffer)
        .resize({
          width: 1200,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 90 })
        .toBuffer();
    }

    return file.buffer;
  }

  private async uploadToS3(file: Express.Multer.File, type: string) {
    const fileExt = extname(file.originalname).toLowerCase();
    const fileName = `users/${type}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    let fileBody = file.buffer;

    if (this.ALLOWED_IMAGES.includes(fileExt)) {
      fileBody = await this.optimizeImage(file);
    }

    const uploadResult = await this.s3
      .upload({
        Bucket:
          this.configService.get<string>('AWS_S3_BUCKET_NAME') ||
          (() => {
            throw new Error('AWS_S3_BUCKET_NAME is not defined');
          })(),
        Key: fileName,
        Body: fileBody,
        ContentType: file.mimetype,
      })
      .promise();

    return {
      filename: fileName,
      location: uploadResult.Location,
      key: uploadResult.Key,
    };
  }

  async uploadFilesToS3(
    files: {
      images?: Express.Multer.File[];
      audio?: Express.Multer.File[];
      document?: Express.Multer.File[];
    },
    type: 'posts' | 'events' | 'profiles' | 'products' | 'forum_publications',
  ) {
    this.validateMediaCombination(files);

    const uploadedFiles: {
      images: Array<
        Express.Multer.File & {
          filename: string;
          location: string;
          key: string;
        }
      >;
      audio: Array<
        Express.Multer.File & {
          filename: string;
          location: string;
          key: string;
        }
      >;
      document: Array<
        Express.Multer.File & {
          filename: string;
          location: string;
          key: string;
        }
      >;
    } = {
      images: [],
      audio: [],
      document: [],
    };

    try {
      if (files.images?.length) {
        uploadedFiles.images = await Promise.all(
          files.images.map(async (file) => {
            this.validateFile(file);
            const s3File = await this.uploadToS3(file, type);
            return { ...file, ...s3File };
          }),
        );
      }

      if (files.audio?.length) {
        uploadedFiles.audio = await Promise.all(
          files.audio.map(async (file) => {
            this.validateFile(file);
            if (file.mimetype.startsWith('audio/')) {
              await this.checkAudioDuration(file);
            }
            const s3File = await this.uploadToS3(file, type);
            return { ...file, ...s3File };
          }),
        );
      }

      if (files.document?.length) {
        uploadedFiles.document = await Promise.all(
          files.document.map(async (file) => {
            this.validateFile(file);
            const s3File = await this.uploadToS3(file, type);
            return { ...file, ...s3File };
          }),
        );
      }

      return uploadedFiles;
    } catch (error) {
      const uploadedKeys = [
        ...uploadedFiles.images.map((file) => file.key),
        ...uploadedFiles.audio.map((file) => file.key),
        ...uploadedFiles.document.map((file) => file.key),
      ];

      if (uploadedKeys.length > 0) {
        await this.deleteS3Files(uploadedKeys);
      }

      throw error;
    }
  }

  async uploadSingleImage(
    file: Express.Multer.File,
    type:
      | 'posts'
      | 'event_poster'
      | 'profiles'
      | 'products'
      | 'forum_publications'
      | 'group_banners',
  ): Promise<{
    filename: string;
    location: string;
    key: string;
  }> {
    this.validateFile(file);

    const optimizedBuffer = await this.optimizeImage(file);

    const fileExt = extname(file.originalname).toLowerCase();
    const fileName = `users/${type}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    const uploadResult = await this.s3
      .upload({
        Bucket:
          this.configService.get<string>('AWS_S3_BUCKET_NAME') ||
          (() => {
            throw new Error('AWS_S3_BUCKET_NAME is not defined');
          })(),
        Key: fileName,
        Body: optimizedBuffer,
        ContentType: file.mimetype,
      })
      .promise();

    return {
      filename: fileName,
      location: uploadResult.Location,
      key: uploadResult.Key,
    };
  }

  private async deleteS3Files(keys: string[]) {
    if (keys.length === 0) return;

    try {
      await this.s3
        .deleteObjects({
          Bucket:
            this.configService.get<string>('AWS_S3_BUCKET_NAME') ||
            (() => {
              throw new Error('AWS_S3_BUCKET_NAME is not defined');
            })(),
          Delete: {
            Objects: keys.map((key) => ({ Key: key })),
          },
        })
        .promise();
    } catch (error) {
      console.error('Failed to clean up S3 files:', error);
    }
  }

  public uploadMedia(type: 'post' | 'event' | 'profile' | 'product') {
    return multer({
      storage: multerS3({
        s3: this.s3,
        bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
        key: (req: Request, file: Express.Multer.File, cb) => {
          const fileName = `${type}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
          cb(null, fileName);
        },
        transforms: [
          (req: Request, file: Express.Multer.File, cb) => {
            if (file.mimetype.startsWith('image/')) {
              const fileExt = extname(file.originalname).toLowerCase();
              if (['.jpg', '.jpeg', '.png', '.webp'].includes(fileExt)) {
                let transformer = sharp().resize({
                  width: 1200,
                  height: 1200,
                  fit: 'inside',
                  withoutEnlargement: true,
                });

                if (['.jpg', '.jpeg'].includes(fileExt)) {
                  transformer = transformer.jpeg({ quality: 80 });
                } else if (fileExt === '.png') {
                  transformer = transformer.png({ compressionLevel: 8 });
                } else if (fileExt === '.webp') {
                  transformer = transformer.webp({ quality: 80 });
                }

                cb(null, transformer);
                return;
              }
            }
            cb(null, null);
          },
        ],
      }),
      fileFilter: async (req: Request, file, cb) => {
        try {
          this.validateFile(file);

          if (file.mimetype.startsWith('audio/')) {
            await this.checkAudioDuration(file);
          }

          cb(null, true);
        } catch (err) {
          cb(err, false);
        }
      },
      limits: { fileSize: 50 * 1024 * 1024 },
    });
  }
}
