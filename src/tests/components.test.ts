import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fixture, html } from '@open-wc/testing';
import '../components/app-component.js';
import '../components/home-page.js';
import '../components/projects-page.js';
import '../components/blog-page.js';
import type { AppComponent } from '../components/app-component.js';
import type { HomePage } from '../components/home-page.js';
import type { ProjectsPage } from '../components/projects-page.js';
import type { BlogPage } from '../components/blog-page.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('Components', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('AppComponent', () => {
    it('should render navigation', async () => {
      const el: AppComponent = await fixture(html`<jim-app></jim-app>`);
      
      const nav = el.shadowRoot?.querySelector('.nav');
      expect(nav).toBeTruthy();
      
      const navLinks = el.shadowRoot?.querySelectorAll('.nav-link');
      expect(navLinks?.length).toBe(3);
    });

    it('should handle navigation', async () => {
      const el: AppComponent = await fixture(html`<jim-app></jim-app>`);
      
      expect(el.currentPage).toBe('home');
      
      // Simulate navigation
      const projectsLink = el.shadowRoot?.querySelector('.nav-link:nth-child(2)') as HTMLElement;
      projectsLink?.click();
      
      await el.updateComplete;
      expect(el.currentPage).toBe('projects');
    });
  });

  describe('HomePage', () => {
    it('should render loading state initially', async () => {
      const mockResponse = {
        name: 'Jim Simon',
        title: 'Staff Software Engineer',
        location: 'Michigan, USA',
        bio: 'Test bio',
        email: 'jim.j.simon@gmail.com',
        github: 'https://github.com/jimsimon',
        linkedin: 'https://linkedin.com/in/jim-simon-engineer'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const el: HomePage = await fixture(html`<home-page></home-page>`);
      
      // Should show loading initially
      expect(el.loading).toBe(true);
      
      // Wait for data to load
      await new Promise(resolve => setTimeout(resolve, 100));
      await el.updateComplete;
      
      expect(el.profile?.name).toBe('Jim Simon');
    });

    it('should render profile information', async () => {
      const mockResponse = {
        name: 'Jim Simon',
        title: 'Staff Software Engineer',
        location: 'Michigan, USA',
        bio: 'Test bio',
        email: 'jim.j.simon@gmail.com',
        github: 'https://github.com/jimsimon',
        linkedin: 'https://linkedin.com/in/jim-simon-engineer'
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const el: HomePage = await fixture(html`<home-page></home-page>`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await el.updateComplete;
      
      const title = el.shadowRoot?.querySelector('.hero-title');
      expect(title?.textContent).toBe('Jim Simon');
      
      const socialLinks = el.shadowRoot?.querySelectorAll('.social-link');
      expect(socialLinks?.length).toBeGreaterThan(0);
    });
  });

  describe('ProjectsPage', () => {
    it('should render projects list', async () => {
      const mockProjects = [
        {
          id: 1,
          name: 'Test Project',
          description: 'A test project',
          language: 'TypeScript',
          url: 'https://github.com/test/project',
          featured: true,
          createdAt: new Date()
        }
      ];

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProjects
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProjects.filter(p => p.featured)
        });

      const el: ProjectsPage = await fixture(html`<projects-page></projects-page>`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await el.updateComplete;
      
      expect(el.projects.length).toBe(1);
      expect(el.projects[0].name).toBe('Test Project');
      
      const projectCards = el.shadowRoot?.querySelectorAll('.project-card');
      expect(projectCards?.length).toBe(1);
    });

    it('should show empty state when no projects', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      const el: ProjectsPage = await fixture(html`<projects-page></projects-page>`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await el.updateComplete;
      
      const emptyState = el.shadowRoot?.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });
  });

  describe('BlogPage', () => {
    it('should render blog posts list', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Test Post',
          content: '<p>Test content</p>',
          excerpt: 'Test excerpt',
          slug: 'test-post',
          published: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts
      });

      const el: BlogPage = await fixture(html`<blog-page></blog-page>`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await el.updateComplete;
      
      expect(el.posts.length).toBe(1);
      expect(el.posts[0].title).toBe('Test Post');
      
      const postCards = el.shadowRoot?.querySelectorAll('.post-card');
      expect(postCards?.length).toBe(1);
    });

    it('should show empty state when no posts', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const el: BlogPage = await fixture(html`<blogs-page></blog-page>`);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await el.updateComplete;
      
      const emptyState = el.shadowRoot?.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });
  });
});