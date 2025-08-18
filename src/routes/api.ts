import Router from '@koa/router';
import { getDatabase } from '../database/connection.js';
import { blogPosts, projects, users } from '../database/schema.js';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, requireAdmin, AuthContext, generateToken, authMiddleware } from '../middleware/auth.js';
import type { BlogPost, Project } from '../types/index.js';
import bcrypt from 'bcrypt';

const router = new Router({ prefix: '/api' });

// Apply auth middleware to all routes
router.use(authMiddleware);

// Authentication endpoints
router.post('/auth/login', async (ctx) => {
  const { email, password } = ctx.request.body as { email: string; password: string };
  
  if (!email || !password) {
    ctx.status = 400;
    ctx.body = { error: 'Email and password are required' };
    return;
  }
  
  try {
    const db = getDatabase();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (!user) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid credentials' };
      return;
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid credentials' };
      return;
    }
    
    const token = generateToken(user.id);
    ctx.body = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Login failed' };
  }
});

// Blog endpoints
router.get('/blog', async (ctx) => {
  const db = getDatabase();
  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.createdAt));
  
  ctx.body = posts;
});

// Admin blog endpoints
router.get('/admin/blog', requireAuth, requireAdmin, async (ctx: AuthContext) => {
  const db = getDatabase();
  const posts = await db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt));
  
  ctx.body = posts;
});

router.get('/blog/:slug', async (ctx) => {
  const db = getDatabase();
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, ctx.params.slug))
    .limit(1);
  
  if (!post) {
    ctx.status = 404;
    ctx.body = { error: 'Post not found' };
    return;
  }
  
  if (!post.published) {
    ctx.status = 404;
    ctx.body = { error: 'Post not found' };
    return;
  }
  
  ctx.body = post;
});

router.post('/blog', requireAuth, requireAdmin, async (ctx: AuthContext) => {
  const db = getDatabase();
  const { title, content, excerpt, slug, published } = ctx.request.body as Partial<BlogPost>;
  
  if (!title || !content || !excerpt || !slug) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required fields' };
    return;
  }
  
  try {
    const [newPost] = await db
      .insert(blogPosts)
      .values({
        title,
        content,
        excerpt,
        slug,
        published: published || false,
      })
      .returning();
    
    ctx.body = newPost;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'Failed to create post' };
  }
});

router.put('/blog/:id', requireAuth, requireAdmin, async (ctx: AuthContext) => {
  const db = getDatabase();
  const id = parseInt(ctx.params.id);
  const { title, content, excerpt, slug, published } = ctx.request.body as Partial<BlogPost>;
  
  try {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({
        title,
        content,
        excerpt,
        slug,
        published,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();
    
    if (!updatedPost) {
      ctx.status = 404;
      ctx.body = { error: 'Post not found' };
      return;
    }
    
    ctx.body = updatedPost;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'Failed to update post' };
  }
});

router.delete('/blog/:id', requireAuth, requireAdmin, async (ctx: AuthContext) => {
  const db = getDatabase();
  const id = parseInt(ctx.params.id);
  
  try {
    const [deletedPost] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id))
      .returning();
    
    if (!deletedPost) {
      ctx.status = 404;
      ctx.body = { error: 'Post not found' };
      return;
    }
    
    ctx.body = { message: 'Post deleted successfully' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'Failed to delete post' };
  }
});

// Projects endpoints
router.get('/projects', async (ctx) => {
  const db = getDatabase();
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.featured), desc(projects.createdAt));
  
  ctx.body = allProjects;
});

router.get('/projects/featured', async (ctx) => {
  const db = getDatabase();
  const featuredProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.featured, true))
    .orderBy(desc(projects.createdAt));
  
  ctx.body = featuredProjects;
});

// Admin project endpoints
router.get('/admin/projects', requireAuth, requireAdmin, async (ctx: AuthContext) => {
  const db = getDatabase();
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.featured), desc(projects.createdAt));
  
  ctx.body = allProjects;
});

router.post('/projects', requireAuth, requireAdmin, async (ctx: AuthContext) => {
  const db = getDatabase();
  const { name, description, language, url, stars, featured } = ctx.request.body as Partial<Project>;
  
  if (!name || !description || !language || !url) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required fields' };
    return;
  }
  
  try {
    const [newProject] = await db
      .insert(projects)
      .values({
        name,
        description,
        language,
        url,
        stars,
        featured: featured || false,
      })
      .returning();
    
    ctx.body = newProject;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'Failed to create project' };
  }
});

router.put('/projects/:id', requireAuth, requireAdmin, async (ctx: AuthContext) => {
  const db = getDatabase();
  const id = parseInt(ctx.params.id);
  const { name, description, language, url, stars, featured } = ctx.request.body as Partial<Project>;
  
  try {
    const [updatedProject] = await db
      .update(projects)
      .set({
        name,
        description,
        language,
        url,
        stars,
        featured,
      })
      .where(eq(projects.id, id))
      .returning();
    
    if (!updatedProject) {
      ctx.status = 404;
      ctx.body = { error: 'Project not found' };
      return;
    }
    
    ctx.body = updatedProject;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'Failed to update project' };
  }
});

router.delete('/projects/:id', requireAuth, requireAdmin, async (ctx: AuthContext) => {
  const db = getDatabase();
  const id = parseInt(ctx.params.id);
  
  try {
    const [deletedProject] = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();
    
    if (!deletedProject) {
      ctx.status = 404;
      ctx.body = { error: 'Project not found' };
      return;
    }
    
    ctx.body = { message: 'Project deleted successfully' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'Failed to delete project' };
  }
});

// Admin user settings endpoints
router.put('/admin/change-password', requireAuth, requireAdmin, async (ctx: AuthContext) => {
  const { currentPassword, newPassword } = ctx.request.body as {
    currentPassword: string;
    newPassword: string;
  };
  
  if (!currentPassword || !newPassword) {
    ctx.status = 400;
    ctx.body = { error: 'Current password and new password are required' };
    return;
  }
  
  if (newPassword.length < 6) {
    ctx.status = 400;
    ctx.body = { error: 'New password must be at least 6 characters long' };
    return;
  }
  
  try {
    const db = getDatabase();
    const userId = ctx.user!.id;
    
    // Get current user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: 'User not found' };
      return;
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      ctx.status = 401;
      ctx.body = { error: 'Current password is incorrect' };
      return;
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db
      .update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, userId));
    
    ctx.body = { message: 'Password updated successfully' };
  } catch (error) {
    console.error('Password change error:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to change password' };
  }
});

export default router;