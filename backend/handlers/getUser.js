import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/db.js';
import { verifyToken } from '../utils/auth.js';

export const handler = async (event) => {
  try {
    const cookies = {};
    const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
    if (cookieHeader) {
      cookieHeader.split(';').forEach(c => {
        const [key, val] = c.trim().split('=');
        cookies[key] = val;
      });
    }

    if (!cookies.authToken) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Not authenticated' }) };
    }

    const decoded = verifyToken(cookies.authToken);
    const result = await docClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { userId: decoded.userId }
    }));

    if (!result.Item) {
      return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) };
    }

    const { password, ...userData } = result.Item;
    return { statusCode: 200, body: JSON.stringify(userData) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
