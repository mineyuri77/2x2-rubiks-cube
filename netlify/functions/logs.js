import { neon } from '@netlify/neon';
const sql = neon();

exports.handler = async function(event, context) {
  console.log('Received event:', event);
  // Set allowed origins
  const allowedOrigins = [
    "https://yourdomain.com", // Replace with your domain
    "capacitor://localhost", // Capacitor/Electron apps
    "ionic://localhost",     // Ionic mobile apps
    "file://",               // Electron/Capacitor/PhoneGap
  ];
  const origin = event.headers.origin || event.headers.Origin || "";
  const allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const defaultHeaders = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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

  if (event.httpMethod !== "GET") {
    console.log('Invalid method:', event.httpMethod);
    return { statusCode: 405, headers: defaultHeaders, body: "Method Not Allowed" };
  }
  const { userid } = event.queryStringParameters || {};
  if (!userid) {
    console.log('Missing userid in queryStringParameters');
    return { statusCode: 400, headers: defaultHeaders, body: JSON.stringify({ success: false, message: "Missing userid" }) };
  }
  try {
    const [user] = await sql`SELECT logs FROM users WHERE username = ${userid}`;
    console.log('Fetched user logs:', user);
    if (!user || !user.logs) {
      return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ success: true, logs: [] }) };
    }
    return { statusCode: 200, headers: defaultHeaders, body: JSON.stringify({ success: true, logs: user.logs }) };
  } catch (err) {
    console.error('Database error:', err);
    return { statusCode: 500, headers: defaultHeaders, body: JSON.stringify({ success: false, message: "Database error", error: err.message }) };
  }
};
