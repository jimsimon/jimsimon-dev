import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseComponent } from './base-component.js';
import type { BlogPost } from '../types/index.js';

@customElement('admin-dashboard')
export class AdminDashboard extends BaseComponent {
  @state()
  posts: BlogPost[] = [];

  @state()
  loading = true;

  @state()
  error = '';

  static styles = css`
    ${BaseComponent.styles}
    :host {
      display: block;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .posts-grid {
      display: grid;
      gap: 1rem;
    }

    .post-item {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .post-info {
      flex: 1;
    }

    .post-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .post-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .post-status {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .post-status.published {
      background: var(--success-color);
      color: white;
    }

    .post-status.draft {
      background: var(--warning-color);
      color: white;
    }

    .post-excerpt {
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .post-actions {
      display: flex;
      gap: 0.5rem;
      margin-left: 1rem;
    }

    .action-button {
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-button:hover {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .action-button.danger {
      border-color: var(--error-color);
      color: var(--error-color);
    }

    .action-button.danger:hover {
      background: var(--error-color);
      color: white;
    }

    .loading, .error {
      text-align: center;
      padding: 2rem;
    }

    .error {
      color: var(--error-color);
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadPosts();
  }

  private async loadPosts() {
    this.loading = true;
    this.error = '';

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('/api/admin/blog', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load posts');
      }

      this.posts = await response.json();
    } catch (error) {
      this.error = 'Failed to load blog posts';
      console.error('Error loading posts:', error);
    } finally {
      this.loading = false;
    }
  }

  private async deletePost(id: number) {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      await this.loadPosts();
    } catch (error) {
      alert('Failed to delete post');
      console.error('Error deleting post:', error);
    }
  }

  private async togglePublished(post: BlogPost) {
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/blog/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...post,
          published: !post.published
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update post');
      }

      await this.loadPosts();
    } catch (error) {
      alert('Failed to update post');
      console.error('Error updating post:', error);
    }
  }

  private navigate(page: string, postId?: number) {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { page, postId }
    }));
  }

  private formatDate(dateString: string | Date) {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">Loading posts...</div>`;
    }

    if (this.error) {
      return html`
        <div class="error">
          ${this.error}
          <button class="button primary" @click=${this.loadPosts} style="margin-left: 1rem;">
            Retry
          </button>
        </div>
      `;
    }

    return html`
      <div class="dashboard-header">
        <h2>Blog Posts</h2>
        <button class="button primary" @click=${() => this.navigate('create-post')}>
          Create New Post
        </button>
      </div>

      ${this.posts.length === 0 ? html`
        <div class="empty-state">
          <p>No blog posts yet.</p>
          <button class="button primary" @click=${() => this.navigate('create-post')}>
            Create Your First Post
          </button>
        </div>
      ` : html`
        <div class="posts-grid">
          ${this.posts.map(post => html`
            <div class="post-item">
              <div class="post-info">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-meta">
                  <span>Created: ${this.formatDate(post.createdAt)}</span>
                  <span>Updated: ${this.formatDate(post.updatedAt)}</span>
                  <span class="post-status ${post.published ? 'published' : 'draft'}">
                    ${post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p class="post-excerpt">${post.excerpt}</p>
              </div>
              <div class="post-actions">
                <button 
                  class="action-button" 
                  @click=${() => this.navigate('edit-post', post.id)}
                  title="Edit post"
                >
                  ✏️
                </button>
                <button 
                  class="action-button" 
                  @click=${() => this.togglePublished(post)}
                  title="${post.published ? 'Unpublish' : 'Publish'} post"
                >
                  ${post.published ? '👁️' : '👁️‍🗨️'}
                </button>
                <button 
                  class="action-button danger" 
                  @click=${() => this.deletePost(post.id)}
                  title="Delete post"
                >
                  🗑️
                </button>
              </div>
            </div>
          `)}
        </div>
      `}
    `;
  }
}