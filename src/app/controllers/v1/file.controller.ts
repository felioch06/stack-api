import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { Service, Inject } from 'typedi';
import { ApiResponse } from '../../../api/interfaces/api-response.interface';
import { AwsLib } from '../../../libraries/core/aws';
import { FileHelper } from '../../../libraries/core/file-helper';

@Service()
export class FileController {
  @Inject()
  fileHelper: FileHelper;

  @Inject()
  awsLib: AwsLib;

  constructor() {}

  uploadFile = async (req: Request, res: Response) => {
    const fileHelper = new FileHelper();
    const awsLib = new AwsLib();

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        code: 102,
        httpStatusCode: 400,
        status: false,
        message: 'No files were uploaded',
      } as ApiResponse);
    }

    const file = req.files.file as UploadedFile;
    const newFileName = fileHelper.getFileName(file as UploadedFile);

    const awsFileKey = await awsLib.uploadFile(newFileName, file.data);

    return res.status(201).json({
      code: 100,
      status: true,
      httpStatusCode: 201,
      data: {
        path: awsFileKey,
      },
      message: 'File Uploaded',
    } as ApiResponse);
  };

  uploadFiles = async (req: Request, res: Response) => {
    const fileHelper = new FileHelper();
    const awsLib = new AwsLib();

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        code: 102,
        httpStatusCode: 400,
        status: false,
        message: 'No files were uploaded',
      } as ApiResponse);
    }

    const files = req.files.files as UploadedFile[];
    const awsKeys = Array<string>();

    for (const file of files) {
      const newFileName = fileHelper.getFileName(file as UploadedFile);

      const awsFileKey = await awsLib.uploadFile(newFileName, file.data);

      awsKeys.push(awsFileKey);
    }

    return res.status(201).json({
      code: 100,
      status: true,
      httpStatusCode: 201,
      data: {
        paths: awsKeys,
      },
      message: 'File Uploaded',
    } as ApiResponse);
  };
}
