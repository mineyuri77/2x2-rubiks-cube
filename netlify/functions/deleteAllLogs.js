import { neon } from '@netlify/neon';
const sql = neon();

exports.handler = async function(event, context) {
  if (event.httpMethod !== "DELETE") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Invalid JSON" }) };
  }
  const { userid } = body;
  if (!userid) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Missing userid" }) };
  }
  try {
    const [user] = await sql`SELECT logs FROM users WHERE username = ${userid}`;
    if (!user || !Array.isArray(user.logs)) {
      return { statusCode: 404, body: JSON.stringify({ success: false, message: "User/logs not found" }) };
    }
    user.logs = [];
    await sql`UPDATE users SET logs = '[]' WHERE username = ${userid}`;
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Database error", error: err.message }) };
  }
};
