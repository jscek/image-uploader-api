import { Injectable } from "@nestjs/common";
import { join } from "path";
import { createReadStream, ReadStream } from "fs";

@Injectable()
export class ImagesService {
  static imagesDestination: string = join(__dirname, "..", "..", "images");

  download(id: string): ReadStream {
    const filePath = join(ImagesService.imagesDestination, id);
    const file = createReadStream(filePath);

    return file;
  }
}
