import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/db.js';
import { hashPassword } from '../utils/auth.js';

export const handler = async (event) => {
  try {
    const { name, message, password } = JSON.parse(event.body);
    if (!name || !message || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Name, message and password required' }) };
    }

    const userId = `user_${Date.now()}`;
    const hashedPassword = hashPassword(password);

    await docClient.send(new PutCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: { userId, name, message, password: hashedPassword, createdAt: new Date().toISOString() }
    }));

    return { statusCode: 200, body: JSON.stringify({ message: 'User created', userId }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
