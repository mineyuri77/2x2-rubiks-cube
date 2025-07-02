const fs = require("fs");
const path = require("path");
const DATABASE_FILE = path.join(__dirname, "../../database.json");

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
  let db = {};
  try {
    const fileContent = fs.readFileSync(DATABASE_FILE, "utf8");
    db = JSON.parse(fileContent);
  } catch {
    db = {};
  }
  if (!db[userid] || !Array.isArray(db[userid].logs)) {
    return { statusCode: 404, body: JSON.stringify({ success: false, message: "User/logs not found" }) };
  }
  db[userid].logs = [];
  try {
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(db, null, 2));
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Failed to write to database" }) };
  }
};
