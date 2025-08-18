import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { BaseComponent } from './base-component.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import type { BlogPost } from '../types/index.js';

@customElement('blog-post-editor')
export class BlogPostEditor extends BaseComponent {
  @property({ type: Number })
  postId?: number;

  @state()
  title = '';

  @state()
  content = '';

  @state()
  excerpt = '';

  @state()
  slug = '';

  @state()
  published = false;

  @state()
  loading = false;

  @state()
  saving = false;

  @state()
  error = '';

  @state()
  previewContent = '';

  @state()
  slugManuallyEdited = false;

  static styles = css`
    ${BaseComponent.styles}
    :host {
      display: block;
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .editor-actions {
      display: flex;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-family: inherit;
      font-size: 1rem;
      background: var(--background-color);
      color: var(--text-primary);
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 300px;
      font-family: 'Courier New', monospace;
    }

    .form-group.excerpt textarea {
      min-height: 100px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .checkbox-group input[type="checkbox"] {
      width: auto;
    }

    .preview-section {
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid var(--border-color);
    }

    .preview-content {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 2rem;
      line-height: 1.6;
    }

    .preview-content h1,
    .preview-content h2,
    .preview-content h3,
    .preview-content h4,
    .preview-content h5,
    .preview-content h6 {
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      color: var(--text-primary);
      font-weight: 600;
    }

    .preview-content p {
      margin-bottom: 1rem;
    }

    .preview-content ul,
    .preview-content ol {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }

    .preview-content li {
      margin-bottom: 0.25rem;
    }

    .preview-content blockquote {
      border-left: 4px solid var(--primary-color);
      padding-left: 1rem;
      margin: 1rem 0;
      font-style: italic;
      color: var(--text-secondary);
    }

    .preview-content code {
      background: var(--background-color);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
      font-family: 'Monaco', 'Menlo', monospace;
    }

    .preview-content pre {
      background: var(--background-color);
      padding: 1rem;
      border-radius: var(--border-radius);
      overflow-x: auto;
      margin: 1rem 0;
    }

    .preview-content pre code {
      background: none;
      padding: 0;
    }

    .loading, .error {
      text-align: center;
      padding: 2rem;
    }

    .error {
      color: var(--error-color);
    }

    .slug-preview {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .editor-actions {
        flex-direction: column;
      }
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    if (this.postId) {
      await this.loadPost();
    }
  }

  private async loadPost() {
    this.loading = true;
    this.error = '';

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/admin/blog`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load posts');
      }

      const posts: BlogPost[] = await response.json();
      const post = posts.find(p => p.id === this.postId);

      if (!post) {
        throw new Error('Post not found');
      }

      this.title = post.title;
      this.content = post.content;
      this.excerpt = post.excerpt;
      this.slug = post.slug;
      this.published = post.published;
      this.slugManuallyEdited = true; // Existing post, consider slug as manually set
      await this.updatePreview();
    } catch (error) {
      this.error = 'Failed to load post';
      console.error('Error loading post:', error);
    } finally {
      this.loading = false;
    }
  }

  private async updatePreview() {
    if (this.content) {
      this.previewContent = await marked(this.content);
    } else {
      this.previewContent = '';
    }
  }

  private generateSlug(): string {
    if (!this.title) return '';
    
    return this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private async savePost() {
    if (!this.title || !this.content || !this.excerpt || !this.slug) {
      alert('Please fill in all required fields');
      return;
    }

    this.saving = true;
    this.error = '';

    try {
      const token = localStorage.getItem('admin-token');
      const postData = {
        title: this.title,
        content: this.content,
        excerpt: this.excerpt,
        slug: this.slug,
        published: this.published
      };

      const url = this.postId ? `/api/blog/${this.postId}` : '/api/blog';
      const method = this.postId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      const savedPost = await response.json();
      alert(`Post ${this.postId ? 'updated' : 'created'} successfully!`);
      
      if (!this.postId) {
        this.navigate('edit-post', savedPost.id);
      }
    } catch (error) {
      this.error = 'Failed to save post';
      console.error('Error saving post:', error);
    } finally {
      this.saving = false;
    }
  }

  private navigate(page: string, postId?: number) {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { page, postId }
    }));
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">Loading post...</div>`;
    }

    return html`
      <div class="editor-header">
        <h2>${this.postId ? 'Edit Post' : 'Create New Post'}</h2>
        <div class="editor-actions">
          <button class="button secondary" @click=${() => this.navigate('dashboard')}>
            Back to Dashboard
          </button>
          <button 
            class="button primary" 
            @click=${this.savePost}
            ?disabled=${this.saving}
          >
            ${this.saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      ${this.error ? html`
        <div class="error">
          ${this.error}
        </div>
      ` : ''}

      <form @submit=${(e: Event) => e.preventDefault()}>
        <div class="form-group">
          <label for="title">Title *</label>
          <input
            id="title"
            type="text"
            .value=${this.title}
            @input=${(e: Event) => {
              this.title = (e.target as HTMLInputElement).value;
              if (!this.slugManuallyEdited) {
                this.slug = this.generateSlug();
              }
            }}
            placeholder="Enter post title..."
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="slug">Slug *</label>
            <input
              id="slug"
              type="text"
              .value=${this.slug}
              @input=${(e: Event) => {
                this.slug = (e.target as HTMLInputElement).value;
                this.slugManuallyEdited = true;
              }}
              placeholder="post-url-slug"
              required
            />
            <div class="slug-preview">URL: /blog/${this.slug}</div>
          </div>
          <div class="form-group">
            <div class="checkbox-group">
              <input
                id="published"
                type="checkbox"
                .checked=${this.published}
                @change=${(e: Event) => this.published = (e.target as HTMLInputElement).checked}
              />
              <label for="published">Published</label>
            </div>
          </div>
        </div>

        <div class="form-group excerpt">
          <label for="excerpt">Excerpt *</label>
          <textarea
            id="excerpt"
            .value=${this.excerpt}
            @input=${(e: Event) => this.excerpt = (e.target as HTMLTextAreaElement).value}
            placeholder="Brief description of the post..."
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="content">Content *</label>
          <textarea
            id="content"
            .value=${this.content}
            @input=${async (e: Event) => {
              this.content = (e.target as HTMLTextAreaElement).value;
              await this.updatePreview();
            }}
            placeholder="Write your post content here... (Markdown supported)"
            required
          ></textarea>
        </div>
      </form>

      ${this.content ? html`
        <div class="preview-section">
          <h3>Markdown Preview</h3>
          <div class="preview-content">
            ${unsafeHTML(this.previewContent)}
          </div>
        </div>
      ` : ''}
    `;
  }
}