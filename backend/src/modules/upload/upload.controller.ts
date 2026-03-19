import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('cover')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`,
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Cover image (JPEG, PNG, WebP, GIF, max 5MB)',
        },
      },
    },
  })
  async uploadCover(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser('sub') userId: string,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.uploadService.isConfigured()) {
      throw new BadRequestException(
        'S3 upload is not configured. Set AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY in the server environment.',
      );
    }

    const url = await this.uploadService.uploadCoverImage(file, userId);
    return { url };
  }
}
