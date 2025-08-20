import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { eq } from 'drizzle-orm';
import * as schema from './schema.js';
import bcrypt from 'bcrypt';

let db: ReturnType<typeof drizzle>;

export async function initializeDatabase(): Promise<typeof db> {
  if (db) {
    return db;
  }

  const client = new PGlite('./database.db');
  db = drizzle(client, { schema });

  await client.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      published BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      language TEXT NOT NULL,
      url TEXT NOT NULL,
      stars INTEGER,
      featured BOOLEAN DEFAULT FALSE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  // Seed initial data
  await seedInitialData();

  return db;
}

async function seedInitialData(): Promise<void> {
  // Create admin user if it doesn't exist
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.insert(schema.users).values({
    email: 'jim.j.simon@gmail.com',
    name: 'Jim Simon',
    password: hashedPassword,
    role: 'admin'
  }).onConflictDoNothing();
}

export function getDatabase(): typeof db {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}