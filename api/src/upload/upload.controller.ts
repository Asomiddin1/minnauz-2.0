import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

const uploadDir = join(process.cwd(), 'uploads', 'videos');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@ApiTags('Fayl Yuklash (Uploads)')
@Controller('upload')
export class UploadController {
  @Post('video')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Dars uchun video yuklash (MP4, WebM, MOV)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `video-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'];
        if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|mov|mkv)$/i)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Faqat video formatdagi fayllar (MP4, WebM, MOV) qabul qilinadi'), false);
        }
      },
      limits: {
        fileSize: 500 * 1024 * 1024, // 500 MB max video limit
      },
    }),
  )
  uploadVideo(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Fayl tanlanmadi');
    }
    const relativeUrl = `/uploads/videos/${file.filename}`;
    return {
      success: true,
      url: relativeUrl,
      originalName: file.originalname,
      size: file.size,
      filename: file.filename,
    };
  }
}
