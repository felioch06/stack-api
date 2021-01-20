import { UploadedFile } from 'express-fileupload';
import { Service } from 'typedi';
import * as path from 'path';

@Service()
export class FileHelper {
  /**
   *
   * @param file File to be renamed
   */
  getFileName = (
    file: UploadedFile,
    fileNameOverride?: string,
    folder?: string
  ) => {
    const extName = path.extname(file.name);
    const fileName = fileNameOverride
      ? fileNameOverride
      : path.basename(file.name, extName);
    return `${
      folder ? folder + '/' : ''
    }${fileName}-${Date.now()}.${extName}`.trim();
  };
}
