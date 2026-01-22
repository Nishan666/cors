import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/db.js';
import { hashPassword, getCorsHeaders } from '../utils/auth.js';

export const handler = async (event) => {
  const origin = event.headers?.origin || event.headers?.Origin;
  
  try {
    const { name, secretText } = JSON.parse(event.body);
    if (!name || !secretText) {
      return { statusCode: 400, headers: getCorsHeaders(origin), body: JSON.stringify({ error: 'Name and secretText required' }) };
    }

    const userId = `user_${Date.now()}`;
    const hashedSecret = hashPassword(secretText);

    await docClient.send(new PutCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: { userId, name, secretText: hashedSecret, createdAt: new Date().toISOString() }
    }));

    return { statusCode: 200, headers: getCorsHeaders(origin), body: JSON.stringify({ message: 'User created', userId }) };
  } catch (err) {
    return { statusCode: 500, headers: getCorsHeaders(origin), body: JSON.stringify({ error: err.message }) };
  }
};
