import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Put,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { diskStorage } from 'multer';
@Controller('images')
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  private static imagesFilter(
    _req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ): void {
    if (file.mimetype != 'image/jpeg') {
      return callback(
        new HttpException('File is not image', HttpStatus.FORBIDDEN),
        false,
      );
    }
    callback(null, true);
  }

  private static filename(
    _req: Request,
    _file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void,
  ) {
    const filename = nanoid();

    callback(null, filename);
  }

  @Put()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: ImagesController.imagesFilter,
      storage: diskStorage({
        filename: ImagesController.filename,
        destination: ImagesService.imagesDestination,
      }),
    }),
  )
  upload(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const downloadUrl = req.path + file.filename;

    return { downloadUrl };
  }

  @Get(':id')
  download(@Param('id') id: string, @Res() res: Response) {
    const file = this.imagesService.download(id);

    file.on('error', () => {
      res.status(HttpStatus.NOT_FOUND).send({
        stattusCode: HttpStatus.NOT_FOUND,
        message: 'Image not found',
      });
    });

    file.pipe(res);
  }
}
