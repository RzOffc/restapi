import { neon } from "@neondatabase/serverless";

// Dipakai sebagai tagged template: sql`select * from users where id = ${id}`
export const sql = neon(process.env.DATABASE_URL || "postgresql://invalid");
