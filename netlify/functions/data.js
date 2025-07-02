const fs = require("fs");
const path = require("path");
const DATABASE_FILE = path.join(__dirname, "../../database.json");

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
  let db = {};
  try {
    const fileContent = fs.readFileSync(DATABASE_FILE, "utf8");
    db = JSON.parse(fileContent);
  } catch {
    db = {};
  }
  if (!db[userid] || typeof db[userid] !== 'object' || !Array.isArray(db[userid].logs)) {
    db[userid] = { logs: [] };
  }
  data.timestamp = new Date().toISOString();
  db[userid].logs.push(data);
  try {
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(db, null, 2));
    return { statusCode: 200, body: JSON.stringify({ success: true, message: "Data received and stored!" }) };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Failed to write to database" }) };
  }
};
