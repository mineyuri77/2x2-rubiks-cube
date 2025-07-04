import { neon } from '@netlify/neon';
const sql = neon();

exports.handler = async function (event, context) {
  console.log('Received event:', event);
  // Set allowed origins
  const allowedOrigins = [
    "https://doorsensorfrontend.netlify.app",
    "capacitor://localhost",
    "capacitor://app",
    "ionic://localhost",
    "file://"
  ];
  const origin = event.headers.origin || event.headers.Origin || "";
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const defaultHeaders = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": "true"
  };

  if (event.httpMethod === "OPTIONS") {
    // Preflight request
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: ""
    };
  }

  if (event.httpMethod !== "DELETE") {
    console.log('Invalid method:', event.httpMethod);
    return { statusCode: 405, headers: defaultHeaders, body: "Method Not Allowed" };
  }
  let body;
  try {
    body = JSON.parse(event.body);
    console.log('Parsed body:', body);
  } catch (err) {
    console.error('JSON parse error:', err);
    return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ success: false, message: "Invalid JSON" }) };
  }
  const { userid } = body;
  if (!userid) {
    console.log('Missing userid');
    return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ success: false, message: "Missing userid" }) };
  }
  try {
    const [user] = await sql`SELECT logs FROM users WHERE username = ${userid}`;
    console.log('Fetched user logs:', user);
    if (!user || !Array.isArray(user.logs)) {
      console.log('User/logs not found for:', userid);
      return { statusCode: 404, headers: defaultHeaders, body: JSON.stringify({ success: false, message: "User/logs not found" }) };
    }
    user.logs = [];
    await sql`UPDATE users SET logs = '[]' WHERE username = ${userid}`;
    console.log('Deleted all logs for user:', userid);
    return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Database error:', err);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ success: false, message: "Database error", error: err.message }) };
  }
};
