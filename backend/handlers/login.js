import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../utils/db.js';
import { verifyPassword, createToken } from '../utils/auth.js';

export const handler = async (event) => {
  try {
    const { name, password } = JSON.parse(event.body);
    if (!name || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Name and password required' }) };
    }

    const result = await docClient.send(new ScanCommand({
      TableName: process.env.DYNAMODB_TABLE,
      FilterExpression: '#name = :name',
      ExpressionAttributeNames: { '#name': 'name' },
      ExpressionAttributeValues: { ':name': name }
    }));

    if (!result.Items || result.Items.length === 0 || !verifyPassword(password, result.Items[0].password)) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
    }

    const token = createToken(result.Items[0].userId);

    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': `authToken=${token}; HttpOnly; Secure; SameSite=None; Max-Age=86400; Path=/`
      },
      body: JSON.stringify({ message: 'Login successful', userId: result.Items[0].userId })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
