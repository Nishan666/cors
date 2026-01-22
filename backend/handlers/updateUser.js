import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
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
    const { name } = JSON.parse(event.body);
    if (!name) {
      return { statusCode: 400, headers: getCorsHeaders(origin), body: JSON.stringify({ error: 'Name required' }) };
    }

    await docClient.send(new UpdateCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { userId: decoded.userId },
      UpdateExpression: 'SET #name = :name',
      ExpressionAttributeNames: { '#name': 'name' },
      ExpressionAttributeValues: { ':name': name }
    }));

    return { statusCode: 200, headers: getCorsHeaders(origin), body: JSON.stringify({ message: 'User updated' }) };
  } catch (err) {
    return { statusCode: 500, headers: getCorsHeaders(origin), body: JSON.stringify({ error: err.message }) };
  }
};
