import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { initializeDatabase, getDatabase } from '../database/connection.js';
import { blogPosts, projects, users } from '../database/schema.js';
import { eq } from 'drizzle-orm';

describe('Database', () => {
  let db: ReturnType<typeof getDatabase>;

  beforeAll(async () => {
    db = await initializeDatabase();
  });

  describe('Database Connection', () => {
    it('should initialize database successfully', () => {
      expect(db).toBeDefined();
    });

    it('should return the same instance when called multiple times', async () => {
      const db1 = await initializeDatabase();
      const db2 = getDatabase();
      expect(db1).toBe(db2);
    });
  });

  describe('Projects Table', () => {
    it('should have seeded projects data', async () => {
      const projectsList = await db.select().from(projects);
      expect(projectsList.length).toBeGreaterThan(0);
      
      const openTcgStore = projectsList.find(p => p.name === 'Open TCG Store');
      expect(openTcgStore).toBeDefined();
      expect(openTcgStore?.language).toBe('TypeScript');
      expect(openTcgStore?.featured).toBe(true);
    });

    it('should create new project', async () => {
      const testProject = {
        name: 'Test Project',
        description: 'A test project',
        language: 'JavaScript',
        url: 'https://github.com/test/project',
        featured: false
      };

      const [newProject] = await db
        .insert(projects)
        .values(testProject)
        .returning();

      expect(newProject).toMatchObject(testProject);
      expect(newProject.id).toBeDefined();
      expect(newProject.createdAt).toBeDefined();
    });
  });

  describe('Users Table', () => {
    it('should have seeded admin user', async () => {
      const [adminUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, 'jim.j.simon@gmail.com'))
        .limit(1);

      expect(adminUser).toBeDefined();
      expect(adminUser.name).toBe('Jim Simon');
      expect(adminUser.role).toBe('admin');
    });

    it('should create new user', async () => {
      const testUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'testpassword',
        role: 'user'
      };

      const [newUser] = await db
        .insert(users)
        .values(testUser)
        .returning();

      expect(newUser).toMatchObject(testUser);
      expect(newUser.id).toBeDefined();
      expect(newUser.createdAt).toBeDefined();
    });
  });

  describe('Blog Posts Table', () => {
    it('should create and retrieve blog post', async () => {
      const testPost = {
        title: 'Test Blog Post',
        content: '<p>This is a test blog post content.</p>',
        excerpt: 'This is a test excerpt',
        slug: 'test-blog-post-' + Date.now(),
        published: true
      };

      const [newPost] = await db
        .insert(blogPosts)
        .values(testPost)
        .returning();

      expect(newPost).toMatchObject(testPost);
      expect(newPost.id).toBeDefined();
      expect(newPost.createdAt).toBeDefined();
      expect(newPost.updatedAt).toBeDefined();

      // Retrieve the post
      const [retrievedPost] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, testPost.slug))
        .limit(1);

      expect(retrievedPost).toMatchObject(testPost);
    });

    it('should update blog post', async () => {
      const testPost = {
        title: 'Original Title',
        content: '<p>Original content</p>',
        excerpt: 'Original excerpt',
        slug: 'update-test-' + Date.now(),
        published: false
      };

      const [newPost] = await db
        .insert(blogPosts)
        .values(testPost)
        .returning();

      const updatedData = {
        title: 'Updated Title',
        content: '<p>Updated content</p>',
        published: true,
        updatedAt: new Date()
      };

      const [updatedPost] = await db
        .update(blogPosts)
        .set(updatedData)
        .where(eq(blogPosts.id, newPost.id))
        .returning();

      expect(updatedPost.title).toBe('Updated Title');
      expect(updatedPost.published).toBe(true);
      expect(updatedPost.updatedAt.getTime()).toBeGreaterThan(updatedPost.createdAt.getTime());
    });

    it('should delete blog post', async () => {
      const testPost = {
        title: 'To Be Deleted',
        content: '<p>This will be deleted</p>',
        excerpt: 'Delete me',
        slug: 'delete-test-' + Date.now(),
        published: false
      };

      const [newPost] = await db
        .insert(blogPosts)
        .values(testPost)
        .returning();

      await db
        .delete(blogPosts)
        .where(eq(blogPosts.id, newPost.id));

      const [deletedPost] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, newPost.id))
        .limit(1);

      expect(deletedPost).toBeUndefined();
    });
  });
});