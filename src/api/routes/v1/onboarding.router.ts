import { Router } from 'express';
import { onboardingController } from '../../../app/controllers/v1';
import { vertifyTokenMiddleware } from '../../middlewares/verify-token.middleware';

export default () => {
  const router = Router();

  router.post(
    '/login',
    vertifyTokenMiddleware('access'),
    onboardingController.login
  );

  router.post(
    '/create-account',
    vertifyTokenMiddleware('access'),
    onboardingController.createAccount
  );

  router.post(
    '/password-recovery',
    vertifyTokenMiddleware('access'),
    onboardingController.sendPasswordRecoveryCode
  );

  router.post(
    '/verify-email',
    vertifyTokenMiddleware('access'),
    onboardingController.sendVerifyEmail
  );

  router.post(
    '/verify-phone',
    vertifyTokenMiddleware('access'),
    onboardingController.sendVerifySms
  );

  router.post(
    '/verify-code',
    vertifyTokenMiddleware('access'),
    onboardingController.validateVerificationCode
  );

  router.post(
    '/update-notification-settings',
    vertifyTokenMiddleware('auth'),
    onboardingController.updateNotificationSettings
  );

  router.post(
    '/update-profile',
    vertifyTokenMiddleware('auth'),
    onboardingController.updateProfile
  );

  router.post(
    '/upload-photo',
    vertifyTokenMiddleware('auth'),
    onboardingController.uploadPhoto
  );

  router.get(
    '/get-profile',
    vertifyTokenMiddleware('auth'),
    onboardingController.getProfile
  );

  router.post(
    '/set-password',
    vertifyTokenMiddleware('auth'),
    onboardingController.updatePassword
  );

  router.post(
    '/disable-account',
    vertifyTokenMiddleware('auth'),
    onboardingController.disableAccount
  );
  return router;
};
