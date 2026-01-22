import { createHmac, randomBytes, pbkdf2Sync } from 'crypto';

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, stored) => {
  const [salt, hash] = stored.split(':');
  const verifyHash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

export const createToken = (userId) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ userId, exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64url');
  const signature = createHmac('sha256', process.env.JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
};

export const verifyToken = (token) => {
  const [header, payload, signature] = token.split('.');
  const validSignature = createHmac('sha256', process.env.JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
  if (signature !== validSignature) throw new Error('Invalid token');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (decoded.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return decoded;
};

export const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': 'http://cors-488431.s3-website-us-east-1.amazonaws.com',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE',
  'Content-Type': 'application/json'
});
