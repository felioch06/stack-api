import { Service } from 'typedi';
import { Request, Response } from 'express';
import { getRepository, Not } from 'typeorm';
import {
  controllerResponse,
  createErrorResponse,
  createResponse,
} from '../../../libraries/core/response';
import crud from '../../../resources/lang/es/crud';
import { Status } from '../../enums/status.enum';
import { UploadedFile } from 'express-fileupload';
import { FileHelper } from '../../../libraries/core/file-helper';
import { AwsLib } from '../../../libraries/core/aws';
import { awsConfig } from '../../../config/aws';

@Service()
export class CrudController {
  repository: any;

  constructor(model?: any) {
    this.repository = model;
  }

  getPager = async (req: Request, res: Response) => {
    const repository = getRepository(this.repository);

    const find = await repository.findAndCount({
      where: {
        options: {
          status: Not(Status.Deleted),
        },
      },
      order: {
        id: 'DESC',
      },
      take: parseInt(req.params.limit),
      skip: parseInt(req.params.offset),
    });

    if (!find || find == null || find == undefined || find[0].length === 0) {
      return controllerResponse(
        createErrorResponse({
          httpStatusCode: 404,
          message: crud.CRUD.ERROR.EMPTY,
        }),
        res
      );
    }

    let currentPage = Math.ceil(
      (Math.ceil(find[1] / parseInt(req.params.limit)) *
        parseInt(req.params.offset)) /
        find[1]
    );
    let totalPages = Math.ceil(find[1] / parseInt(req.params.limit));
    let data = find[0];
    let totalElements = find[1];

    return controllerResponse(
      createResponse({
        data: {
          currentPage,
          totalPages,
          totalElements,
          data,
        },
        message: crud.CRUD.SUCCESS,
      }),
      res
    );
  };

  get = async (req: Request, res: Response) => {
    const repository = getRepository(this.repository);

    const data = await repository.find({
      where: {
        options: {
          status: Not(Status.Deleted),
        },
      },
      order: {
        id: 'DESC',
      },
    });

    if (!data || data == null || data == undefined || data.length === 0) {
      return controllerResponse(
        createErrorResponse({
          httpStatusCode: 404,
          message: crud.CRUD.ERROR.EMPTY,
        }),
        res
      );
    }

    return controllerResponse(
      createResponse({
        data,
        message: crud.CRUD.SUCCESS,
      }),
      res
    );
  };

  getOne = async (req: Request, res: Response) => {
    const repository = getRepository(this.repository);

    const data = await repository.findOne({
      where: {
        options: {
          status: Not(Status.Deleted),
        },
        id: req.params.id,
      },
    });

    if (!data || data == null || data == undefined) {
      return controllerResponse(
        createErrorResponse({
          httpStatusCode: 404,
          message: crud.CRUD.ERROR.EMPTY,
        }),
        res
      );
    }

    return controllerResponse(
      createResponse({
        data,
        message: crud.CRUD.SUCCESS,
      }),
      res
    );
  };

  filter = async (req: Request, res: Response) => {
    const repository = getRepository(this.repository);

    let modelRelations;

    if (req.body.modelRelations) {
      modelRelations = req.body.modelRelations;
      delete req.body.modelRelations;
    }

    const data = await repository.find({
      where: {
        ...req.body,
        options: {
          status: Not(Status.Deleted),
        },
      },
      relations: modelRelations,
    });

    if (!data || data == null || data == undefined) {
      return controllerResponse(
        createErrorResponse({
          httpStatusCode: 404,
          message: crud.CRUD.ERROR.EMPTY,
        }),
        res
      );
    }

    return controllerResponse(
      createResponse({
        data,
        message: crud.CRUD.SUCCESS,
      }),
      res
    );
  };

  update = async (req: Request, res: Response) => {
    const repository = getRepository(this.repository);

    const findOne: any = await repository.findOne(req.params.id);

    if (req.files) {
      const fileHelper = new FileHelper();
      const awsLib = new AwsLib();

      let images: any = Object.entries(req.files);

      for (let i = 0; i < images.length; i++) {
        let imageName = images[i][0];
        const fileName = fileHelper.getFileName(images[i][1], req.params.id);

        if (findOne.image) {
          await awsLib.deleteFile(`${findOne[imageName]}`);
        }

        const awsPath = await awsLib.uploadFile(fileName, images[0][0].data);

        req.body[imageName] = awsPath;
      }
    }

    const data = await repository.update({ id: req.params.id }, req.body);

    if (data.affected === 0) {
      return controllerResponse(
        createErrorResponse({
          message: crud.CRUD.ERROR.UPDATE,
        }),
        res
      );
    }

    return controllerResponse(
      createResponse({
        message: crud.CRUD.UPDATE,
      }),
      res
    );
  };

  create = async (req: Request, res: Response) => {
    const repository = getRepository(this.repository);

    if (req.files) {
      const fileHelper = new FileHelper();
      const awsLib = new AwsLib();

      let images: any = Object.entries(req.files);

      for (let i = 0; i < images.length; i++) {
        let imageName = images[i][0];
        const fileName = fileHelper.getFileName(images[i][1], req.params.id);

        const awsPath = await awsLib.uploadFile(fileName, images[0][0].data);

        req.body[imageName] = awsPath;
        console.log(req.body);
      }
    }

    const data = await repository.insert(req.body).catch(() => false);

    if (!data) {
      return controllerResponse(
        createErrorResponse({
          message: crud.CRUD.ERROR.MAKE,
        }),
        res
      );
    }

    return controllerResponse(
      createResponse({
        message: crud.CRUD.MAKE,
      }),
      res
    );
  };

  delete = async (req: Request, res: Response) => {
    const repository = getRepository(this.repository);

    const data = await repository.update(
      { id: req.params.id },
      {
        options: {
          status: Status.Deleted,
        },
      }
    );

    if (data.affected === 0) {
      return controllerResponse(
        createErrorResponse({
          message: crud.CRUD.ERROR.DESTROY,
        }),
        res
      );
    }

    return controllerResponse(
      createResponse({
        message: crud.CRUD.DESTROY,
      }),
      res
    );
  };

  changeStatus = async (req: Request, res: Response) => {
    const repository = getRepository(this.repository);

    const data: any = await repository
      .update(
        { id: req.params.id },
        {
          options: {
            status: req.body.status,
          },
        }
      )
      .catch(() => false);

    console.log(data);
    if (!data || data.affected === 0) {
      return controllerResponse(
        createErrorResponse({
          message: crud.CRUD.ERROR.DESTROY,
        }),
        res
      );
    }

    return controllerResponse(
      createResponse({
        message: crud.CRUD.DESTROY,
      }),
      res
    );
  };
}
