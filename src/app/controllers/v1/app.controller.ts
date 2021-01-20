import { Request, Response } from 'express';
import semver from 'semver';
import { Service } from 'typedi';
import { getRepository } from 'typeorm';
import {
  controllerResponse,
  createResponse,
} from '../../../libraries/core/response';
import { generateAccessToken } from '../../../libraries/core/token';
import { SystemVersion } from '../../models/system-version.model';

@Service()
export class AppController {
  getAccessToken = (req: Request, res: Response) => {
    const accessToken = generateAccessToken();

    return controllerResponse(
      createResponse({
        data: {
          accessToken,
        },
        message: (req as any).lang.onboarding.token.generated,
      }),
      res
    );
  };

  checkAppVersion = async (req: Request, res: Response) => {
    const newVersion = req.body as Partial<SystemVersion>;
    const lang = (req as any).lang;

    const versionRepository = getRepository(SystemVersion);

    const currentVersion = await versionRepository.findOne({
      where: {
        platform: newVersion.platform,
      },
    });

    if (currentVersion?.platform) {
      if (currentVersion?.flag) {
        if (!semver.valid(newVersion.version)) {
          newVersion.version = newVersion.version + '.0';
        }

        const currentIsEq = semver.eq(
          currentVersion.version,
          newVersion.version
        );
        const currentIsGt = semver.gt(
          currentVersion.version,
          newVersion.version
        );

        if (currentIsEq) {
          return controllerResponse(
            createResponse({
              data: {
                updatedVersion: false,
                mandatoryUpdate: false,
              },
              message: lang.version.eqVersion,
            }),
            res
          );
        } else if (currentIsGt) {
          if (currentVersion.flag === 1) {
            return controllerResponse(
              createResponse({
                data: {
                  updatedVersion: true,
                  mandatoryUpdate: true,
                },
                message: lang.version.mandatoryUpdate,
              }),
              res
            );
          } else {
            return controllerResponse(
              createResponse({
                data: {
                  updatedVersion: true,
                  mandatoryUpdate: false,
                },
                message: lang.version.inferiorVersion,
              }),
              res
            );
          }
        } else {
          currentVersion.version = newVersion.version;
          await versionRepository.update(
            {
              id: currentVersion.id,
            },
            currentVersion
          );

          return controllerResponse(
            createResponse({
              data: {
                updatedVersion: false,
                mandatoryUpdate: false,
              },
              message: lang.version.generalUpdate,
            }),
            res
          );
        }
      } else {
        return controllerResponse(
          createResponse({
            data: {
              updatedVersion: false,
              mandatoryUpdate: false,
            },
            message: lang.version.noAvailableUpdates,
          }),
          res
        );
      }
    } else {
      await versionRepository.save(newVersion);

      return controllerResponse(
        createResponse({
          data: {
            updatedVersion: false,
            mandatoryUpdate: false,
          },
          message: lang.version.versionCreated,
        }),
        res
      );
    }
  };
}
