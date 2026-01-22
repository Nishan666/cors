import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/db.js';
import { verifyToken, getCorsHeaders } from '../utils/auth.js';

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin;
  
  try {
    const cookies = {};
    if (event.cookies) {
      event.cookies.forEach(c => {
        const [key, val] = c.split('=');
        cookies[key] = val;
      });
    }

    const decoded = verifyToken(cookies.authToken);
    const result = await docClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { userId: decoded.userId }
    }));

    if (!result.Item) {
      return { statusCode: 404, headers: getCorsHeaders(origin), body: JSON.stringify({ error: 'User not found' }) };
    }

    const { secretText, ...userData } = result.Item;
    return { statusCode: 200, headers: getCorsHeaders(origin), body: JSON.stringify(userData) };
  } catch (err) {
    return { statusCode: 500, headers: getCorsHeaders(origin), body: JSON.stringify({ error: err.message }) };
  }
};
