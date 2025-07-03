import { neon } from '@netlify/neon';
const sql = neon();

exports.handler = async function(event, context) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const { userid } = event.queryStringParameters || {};
  if (!userid) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Missing userid" }) };
  }
  try {
    const [user] = await sql`SELECT logs FROM users WHERE username = ${userid}`;
    if (!user || !user.logs) {
      return { statusCode: 200, body: JSON.stringify({ success: true, logs: [] }) };
    }
    return { statusCode: 200, body: JSON.stringify({ success: true, logs: user.logs }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Database error", error: err.message }) };
  }
};
