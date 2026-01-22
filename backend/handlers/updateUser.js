import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/db.js';
import { verifyToken, getCorsHeaders } from '../utils/auth.js';

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
      return { statusCode: 401, headers: getCorsHeaders(), body: JSON.stringify({ error: 'Not authenticated' }) };
    }

    const decoded = verifyToken(cookies.authToken);
    const { message } = JSON.parse(event.body);
    if (!message) {
      return { statusCode: 400, headers: getCorsHeaders(), body: JSON.stringify({ error: 'Message required' }) };
    }

    await docClient.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { userId: decoded.userId },
      UpdateExpression: 'SET #message = :message',
      ExpressionAttributeNames: { '#message': 'message' },
      ExpressionAttributeValues: { ':message': message }
    }));

    return { statusCode: 200, headers: getCorsHeaders(), body: JSON.stringify({ message: 'Message updated' }) };
  } catch (err) {
    return { statusCode: 500, headers: getCorsHeaders(), body: JSON.stringify({ error: err.message }) };
  }
};
