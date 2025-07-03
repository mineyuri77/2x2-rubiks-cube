import { neon } from '@netlify/neon';
const bcrypt = require("bcrypt");
const sql = neon();

exports.handler = async function(event, context) {
  console.log('Received event:', event);
  if (event.httpMethod !== "POST") {
    console.log('Invalid method:', event.httpMethod);
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
    console.log('Parsed body:', body);
  } catch (err) {
    console.error('JSON parse error:', err);
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Invalid JSON" }) };
  }

  const { username, password } = body;
  if (!username || !password) {
    console.log('Missing username or password');
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Missing username or password" }) };
  }

  try {
    const [user] = await sql`SELECT * FROM users WHERE username = ${username}`;
    console.log('Fetched user:', user);
    if (user && await bcrypt.compare(password, user.password)) {
      console.log('Sign-in successful for user:', username);
      return { statusCode: 200, body: JSON.stringify({ success: true, message: "Sign-in successful!" }) };
    }
    console.log('Invalid username or password for user:', username);
    return { statusCode: 200, body: JSON.stringify({ success: false, message: "Invalid username or password" }) };
  } catch (err) {
    console.error('Database error:', err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Database error", error: err.message }) };
  }
};
