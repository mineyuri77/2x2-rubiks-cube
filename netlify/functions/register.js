import { neon } from '@netlify/neon';
const bcrypt = require("bcrypt");

const sql = neon(); // Uses NETLIFY_DATABASE_URL automatically

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
    // Check if user exists
    const [user] = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (user) {
      return { statusCode: 200, body: JSON.stringify({ success: false, message: "Username already exists" }) };
    }

    // Hash password and insert new user
    const hashedPassword = await bcrypt.hash(password, 10);
    await sql`INSERT INTO users (username, password, logs) VALUES (${username}, ${hashedPassword}, '[]')`;
    return { statusCode: 200, body: JSON.stringify({ success: true, message: "User registered successfully" }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Database error", error: err.message }) };
  }
};
