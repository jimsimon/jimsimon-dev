import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import { initializeDatabase } from '../database/connection.js';

describe('API Routes', () => {
  beforeAll(async () => {
    await initializeDatabase();
  });

  describe('GET /api/profile', () => {
    it('should return personal profile information', async () => {
      const response = await request(app.callback())
        .get('/api/profile')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Jim Simon');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('location');
      expect(response.body).toHaveProperty('bio');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('github');
      expect(response.body).toHaveProperty('linkedin');
    });
  });

  describe('GET /api/projects', () => {
    it('should return list of projects', async () => {
      const response = await request(app.callback())
        .get('/api/projects')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        const project = response.body[0];
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('name');
        expect(project).toHaveProperty('description');
        expect(project).toHaveProperty('language');
        expect(project).toHaveProperty('url');
        expect(project).toHaveProperty('featured');
      }
    });
  });

  describe('GET /api/projects/featured', () => {
    it('should return only featured projects', async () => {
      const response = await request(app.callback())
        .get('/api/projects/featured')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((project: any) => {
        expect(project.featured).toBe(true);
      });
    });
  });

  describe('GET /api/blog', () => {
    it('should return list of published blog posts', async () => {
      const response = await request(app.callback())
        .get('/api/blog')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((post: any) => {
        expect(post.published).toBe(true);
        expect(post).toHaveProperty('id');
        expect(post).toHaveProperty('title');
        expect(post).toHaveProperty('excerpt');
        expect(post).toHaveProperty('slug');
      });
    });
  });

  describe('GET /api/blog/:slug', () => {
    it('should return 404 for non-existent post', async () => {
      await request(app.callback())
        .get('/api/blog/non-existent-post')
        .expect(404);
    });
  });

  describe('POST /api/blog', () => {
    it('should require authentication', async () => {
      await request(app.callback())
        .post('/api/blog')
        .send({
          title: 'Test Post',
          content: 'Test content',
          excerpt: 'Test excerpt',
          slug: 'test-post'
        })
        .expect(401);
    });

    it('should create blog post with valid auth', async () => {
      const response = await request(app.callback())
        .post('/api/blog')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'Test Post',
          content: 'Test content',
          excerpt: 'Test excerpt',
          slug: 'test-post-' + Date.now(),
          published: true
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Post');
    });

    it('should reject invalid data', async () => {
      await request(app.callback())
        .post('/api/blog')
        .set('Authorization', 'Bearer admin-token')
        .send({
          title: 'Test Post'
          // Missing required fields
        })
        .expect(400);
    });
  });

  describe('POST /api/projects', () => {
    it('should require authentication', async () => {
      await request(app.callback())
        .post('/api/projects')
        .send({
          name: 'Test Project',
          description: 'Test description',
          language: 'TypeScript',
          url: 'https://github.com/test/project'
        })
        .expect(401);
    });

    it('should create project with valid auth', async () => {
      const response = await request(app.callback())
        .post('/api/projects')
        .set('Authorization', 'Bearer admin-token')
        .send({
          name: 'Test Project',
          description: 'Test description',
          language: 'TypeScript',
          url: 'https://github.com/test/project',
          featured: false
        })
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Project');
    });
  });
});