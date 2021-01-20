import { EntityRepository, Repository } from 'typeorm';
import { UserToken } from '../models/user-token.model';

@EntityRepository(UserToken)
export class UserTokenRepository extends Repository<UserToken> {}
