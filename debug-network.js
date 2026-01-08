
const https = require('https');
const mysql = require('mysql2/promise');

async function testGoogle() {
  console.log('Testing Google connectivity...');
  return new Promise((resolve, reject) => {
    const req = https.get('https://accounts.google.com', (res) => {
      console.log('Google status:', res.statusCode);
      res.resume();
      resolve();
    });
    req.on('error', (e) => {
      console.error('Google connection error:', e);
      reject(e);
    });
  });
}

async function testDB() {
  console.log('Testing Database connectivity...');
  try {
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "nextjs_user",
      password: "nextjs_password",
      database: "nextjs_db",
    });
    const [rows] = await conn.execute('SELECT 1 as val');
    console.log('Database query result:', rows);
    await conn.end();
  } catch (e) {
    console.error('Database error:', e);
  }
}

(async () => {
  try {
    await testGoogle();
    await testDB();
  } catch (e) {
    console.error('Test failed');
  }
})();
