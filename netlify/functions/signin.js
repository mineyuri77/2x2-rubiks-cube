import { neon } from '@netlify/neon';
const bcrypt = require("bcrypt");
const sql = neon();

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Invalid JSON" }) };
  }

  const { username, password } = body;
  if (!username || !password) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Missing username or password" }) };
  }

  try {
    const [user] = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (user && await bcrypt.compare(password, user.password)) {
      return { statusCode: 200, body: JSON.stringify({ success: true, message: "Sign-in successful!" }) };
    }
    return { statusCode: 200, body: JSON.stringify({ success: false, message: "Invalid username or password" }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Database error", error: err.message }) };
  }
};
