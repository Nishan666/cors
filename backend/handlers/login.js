import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/db.js';
import { verifyPassword, createToken, getCorsHeaders } from '../utils/auth.js';

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin;
  
  try {
    const { userId, secretText } = JSON.parse(event.body);
    if (!userId || !secretText) {
      return { statusCode: 400, headers: getCorsHeaders(origin), body: JSON.stringify({ error: 'userId and secretText required' }) };
    }

    const result = await docClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: { userId }
    }));

    if (!result.Item || !verifyPassword(secretText, result.Item.secretText)) {
      return { statusCode: 401, headers: getCorsHeaders(origin), body: JSON.stringify({ error: 'Invalid credentials' }) };
    }

    const token = createToken(userId);

    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      cookies: [`authToken=${token}; HttpOnly; Secure; SameSite=None; Max-Age=86400`],
      body: JSON.stringify({ message: 'Login successful', name: result.Item.name })
    };
  } catch (err) {
    return { statusCode: 500, headers: getCorsHeaders(origin), body: JSON.stringify({ error: err.message }) };
  }
};
