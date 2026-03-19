import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
  private s3Client: S3Client | null = null;
  private bucket: string = '';
  private region: string = '';
  private publicUrl: string = '';

  constructor(private configService: ConfigService) {
    const bucket = this.configService.get<string>('s3.bucket');
    const region = this.configService.get<string>('s3.region');
    const accessKeyId = this.configService.get<string>('s3.accessKeyId');
    const secretAccessKey = this.configService.get<string>(
      's3.secretAccessKey',
    );

    if (bucket && region && accessKeyId && secretAccessKey) {
      this.bucket = bucket;
      this.region = region;
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.publicUrl = `https://${bucket}.s3.${region}.amazonaws.com`;
    }
  }

  isConfigured(): boolean {
    return this.s3Client !== null;
  }

  async uploadCoverImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<string> {
    if (!this.s3Client) {
      throw new Error('S3 is not configured. Set AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.');
    }

    const key = `covers/${userId}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${this.publicUrl}/${key}`;
  }

  async deleteCoverImage(url: string): Promise<void> {
    if (!this.s3Client) return;

    const match = url.match(
      new RegExp(`https://${this.bucket}\\.s3\\.[^/]+\\.amazonaws\\.com/(.+)`),
    );
    if (!match) return;

    const key = decodeURIComponent(match[1]);
    await this.s3Client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
