const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
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

  const { username, password } = body;
  if (!username || !password) {
    return { statusCode: 400, body: JSON.stringify({ success: false, message: "Missing username or password" }) };
  }

  let db = {};
  try {
    const fileContent = fs.readFileSync(DATABASE_FILE, "utf8");
    db = JSON.parse(fileContent);
  } catch {
    db = {};
  }

  if (db[username]) {
    return { statusCode: 200, body: JSON.stringify({ success: false, message: "Username already exists" }) };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  db[username] = { password: hashedPassword, logs: [] };

  try {
    fs.writeFileSync(DATABASE_FILE, JSON.stringify(db, null, 2));
    return { statusCode: 200, body: JSON.stringify({ success: true, message: "Registration successful!" }) };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ success: false, message: "Failed to write to database" }) };
  }
};
