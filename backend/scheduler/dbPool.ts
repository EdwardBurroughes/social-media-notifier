import pg from "pg";

export const pool = new pg.Pool({
  host: "db",
  port: 5432,
  password: process.env.POSTGRES_PASSWORD,
  user: process.env.POSTGRES_USER,
  database: process.env.POSTGRES_USER
});
