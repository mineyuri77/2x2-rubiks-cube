import { neon } from '@netlify/neon';
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
  var { userid, ...data } = body;
  if (!userid) {
    console.log('Missing userid in request body');
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Missing userid in request body" }) };
  }
  try {
    const [user] = await sql`SELECT logs FROM users WHERE username = ${userid}`;
    console.log('Fetched user logs:', user);
    let logs = [];
    if (user && Array.isArray(user.logs)) {
      logs = user.logs;
    }
    data.timestamp = new Date().toISOString();
    logs.push(data);
    await sql`UPDATE users SET logs = ${JSON.stringify(logs)} WHERE username = ${userid}`;
    console.log('Updated logs for user:', userid);
    return { statusCode: 200, body: JSON.stringify({ success: true, message: "Data received and stored!" }) };
  } catch (err) {
    console.error('Database error:', err);
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Database error", error: err.message }) };
  }
};
