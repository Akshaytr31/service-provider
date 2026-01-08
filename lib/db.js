import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "nextjs_user",
  password: "nextjs_password",
  database: "nextjs_db",
});
