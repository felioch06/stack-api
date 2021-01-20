import { UploadedFile } from 'express-fileupload';

export interface FileUploadBody {
  files: {
    [file: string]: UploadedFile;
  };
}
