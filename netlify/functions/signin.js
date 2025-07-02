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
    const match = await bcrypt.compare(password, db[username].password);
    if (match) {
      return { statusCode: 200, body: JSON.stringify({ success: true, message: "Sign-in successful!" }) };
    }
  }
  return { statusCode: 200, body: JSON.stringify({ success: false, message: "Invalid username or password" }) };
};
