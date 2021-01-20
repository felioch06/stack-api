import { sign } from 'jsonwebtoken';
import { Jwt } from '../../api/interfaces/jwt.interface';

export const generateAccessToken = () => sign({}, process.env.JWT_SECRET);

export const generateAuthToken = (jwtContent: Jwt) => {
  const token = sign(jwtContent, process.env.JWT_SECRET);

  return token;
};
