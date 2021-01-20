import { Not } from 'typeorm';
import { Status } from '../../../app/enums/status.enum';

export const onlyActive = { options: { status: Status.Active } };

export const notDeleted = { options: { status: Not(Status.Deleted) } };

export const onlyDeleted = { options: { status: Status.Deleted } };
