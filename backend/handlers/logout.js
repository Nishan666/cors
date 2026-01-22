import { getCorsHeaders } from '../utils/auth.js';

export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      ...getCorsHeaders(),
      'Set-Cookie': 'authToken=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/'
    },
    body: JSON.stringify({ message: 'Logged out' })
  };
};
