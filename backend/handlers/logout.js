import { getCorsHeaders } from '../utils/auth.js';

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin;
  
  return {
    statusCode: 200,
    headers: getCorsHeaders(origin),
    cookies: ['authToken=; HttpOnly; Secure; SameSite=None; Max-Age=0'],
    body: JSON.stringify({ message: 'Logged out' })
  };
};
