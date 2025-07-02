const fs = require("fs");
const path = require("path");
const DATABASE_FILE = path.join(__dirname, "../../database.json");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const { userid } = event.queryStringParameters || {};
  if (!userid) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Missing userid" }) };
  }
  let db = {};
  try {
    const fileContent = fs.readFileSync(DATABASE_FILE, "utf8");
    db = JSON.parse(fileContent);
  } catch {
    db = {};
  }
  if (!db[userid] || !Array.isArray(db[userid].logs)) {
    return { statusCode: 200, body: JSON.stringify({ success: true, logs: [] }) };
  }
  return { statusCode: 200, body: JSON.stringify({ success: true, logs: db[userid].logs }) };
};
