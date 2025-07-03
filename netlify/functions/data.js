import { neon } from '@netlify/neon';
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
  var { userid, ...data } = body;
  if (!userid) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Missing userid in request body" }) };
  }
  try {
    const [user] = await sql`SELECT logs FROM users WHERE username = ${userid}`;
    let logs = [];
    if (user && Array.isArray(user.logs)) {
      logs = user.logs;
    }
    data.timestamp = new Date().toISOString();
    logs.push(data);
    await sql`UPDATE users SET logs = ${JSON.stringify(logs)} WHERE username = ${userid}`;
    return { statusCode: 200, body: JSON.stringify({ success: true, message: "Data received and stored!" }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Database error", error: err.message }) };
  }
};
