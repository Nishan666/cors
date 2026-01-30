export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': 'authToken=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/'
    },
    body: JSON.stringify({ message: 'Logged out' })
  };
};
