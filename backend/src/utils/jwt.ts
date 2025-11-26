import jwt from 'jsonwebtoken';
import config from '../config';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};
