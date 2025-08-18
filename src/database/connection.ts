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
  const projectsData = [
    {
      name: 'Open TCG Store',
      description: 'An all-inclusive open source system for running a trading card game store',
      language: 'TypeScript',
      url: 'https://github.com/jimsimon/open-tcg-store',
      featured: true
    },
    {
      name: 'Pub Client',
      description: 'A library for interacting with the REST API for Pub (pub.dartlang.org)',
      language: 'Dart',
      url: 'https://github.com/jimsimon/pub_client',
      stars: 9,
      featured: true
    },
    {
      name: 'Web Test Runner + DOM Testing Library Demo',
      description: 'Web testing demonstration project showcasing modern testing techniques',
      language: 'TypeScript',
      url: 'https://github.com/jimsimon/wtr-dtl',
      featured: true
    },
    {
      name: 'Sports App',
      description: 'Sports-related application built with modern web technologies',
      language: 'TypeScript',
      url: 'https://github.com/jimsimon/sports-app',
      featured: false
    }
  ];

  // Insert projects if they don't exist
  for (const project of projectsData) {
    const [existingProject] = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.url, project.url))
      .limit(1);
    
    if (!existingProject) {
      await db.insert(schema.projects).values(project);
    }
  }

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