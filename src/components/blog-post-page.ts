import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { BaseComponent } from './base-component.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import type { BlogPost } from '../types/index.js';

@customElement('blog-post-page')
export class BlogPostPage extends BaseComponent {
  @property({ type: String })
  slug?: string;

  @state()
  post?: BlogPost;

  @state()
  renderedContent = '';

  static styles = css`
    ${BaseComponent.styles}
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }

      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
        margin-bottom: 2rem;
        transition: all 0.2s;
      }

      .back-link:hover {
        gap: 0.75rem;
      }

      .post-header {
        margin-bottom: 3rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--border-color);
      }

      .post-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 1rem;
        line-height: 1.2;
      }

      .post-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .post-date {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .post-content {
        color: var(--text-primary);
        line-height: 1.8;
        font-size: 1.1rem;
      }

      .post-content h1,
      .post-content h2,
      .post-content h3,
      .post-content h4,
      .post-content h5,
      .post-content h6 {
        margin-top: 2rem;
        margin-bottom: 1rem;
        color: var(--text-primary);
        font-weight: 600;
      }

      .post-content h1 {
        font-size: 2rem;
      }

      .post-content h2 {
        font-size: 1.5rem;
      }

      .post-content h3 {
        font-size: 1.25rem;
      }

      .post-content p {
        margin-bottom: 1.5rem;
      }

      .post-content ul,
      .post-content ol {
        margin-bottom: 1.5rem;
        padding-left: 2rem;
      }

      .post-content li {
        margin-bottom: 0.5rem;
      }

      .post-content blockquote {
        border-left: 4px solid var(--primary-color);
        padding-left: 1.5rem;
        margin: 2rem 0;
        font-style: italic;
        color: var(--text-secondary);
      }

      .post-content code {
        background: var(--surface-color);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.9rem;
        font-family: 'Monaco', 'Menlo', monospace;
      }

      .post-content pre {
        background: var(--surface-color);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        overflow-x: auto;
        margin: 2rem 0;
      }

      .post-content pre code {
        background: none;
        padding: 0;
      }

      .post-content a {
        color: var(--primary-color);
        text-decoration: none;
        border-bottom: 1px solid transparent;
        transition: border-color 0.2s;
      }

      .post-content a:hover {
        border-bottom-color: var(--primary-color);
      }

      .post-footer {
        margin-top: 4rem;
        padding-top: 2rem;
        border-top: 1px solid var(--border-color);
        text-align: center;
      }

      .share-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
      }

      .share-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: var(--surface-color);
        color: var(--text-primary);
        text-decoration: none;
        border-radius: var(--border-radius);
        transition: all 0.2s;
        border: 1px solid var(--border-color);
      }

      .share-btn:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-1px);
      }

      .not-found {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
      }

      .not-found-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      @media (max-width: 768px) {
        .post-title {
          font-size: 2rem;
        }
        
        .post-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }
        
        .share-buttons {
          flex-direction: column;
          align-items: center;
        }
      }
    `;

  async connectedCallback() {
    super.connectedCallback();
    if (this.slug) {
      await this.loadPost();
    }
  }

  async updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('slug') && this.slug) {
      await this.loadPost();
    }
  }

  private async loadPost() {
    if (!this.slug) return;
    
    try {
      this.post = await this.fetchData(`/api/blog/${this.slug}`);
      if (this.post) {
        this.renderedContent = await marked(this.post.content);
      }
    } catch (error) {
      console.error('Failed to load blog post:', error);
    }
  }

  private navigateBack() {
    window.history.pushState({}, '', '/blog');
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { page: 'blog' },
      bubbles: true,
      composed: true
    }));
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private sharePost() {
    if (navigator.share && this.post) {
      navigator.share({
        title: this.post.title,
        text: this.post.excerpt,
        url: window.location.href,
      });
    }
  }

  render() {
    if (this.loading) return this.renderLoading();
    if (this.error || !this.post) {
      return html`
        <div class="container">
          <a href="#" class="back-link" @click=${(e: Event) => {
            e.preventDefault();
            this.navigateBack();
          }}>
            <span>←</span>
            Back to Blog
          </a>
          
          <div class="not-found">
            <div class="not-found-icon">📄</div>
            <h2>Post Not Found</h2>
            <p>The blog post you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      `;
    }

    return html`
      <div class="container">
        <a href="#" class="back-link" @click=${(e: Event) => {
          e.preventDefault();
          this.navigateBack();
        }}>
          <span>←</span>
          Back to Blog
        </a>

        <article>
          <header class="post-header">
            <h1 class="post-title">${this.post.title}</h1>
            
            <div class="post-meta">
              <div class="post-date">
                <span>📅</span>
                <span>Published ${this.formatDate(this.post.createdAt.toString())}</span>
              </div>
              ${this.post.updatedAt !== this.post.createdAt ? html`
                <div class="post-date">
                  <span>✏️</span>
                  <span>Updated ${this.formatDate(this.post.updatedAt.toString())}</span>
                </div>
              ` : ''}
            </div>
          </header>

          <div class="post-content">
            ${unsafeHTML(this.renderedContent)}
          </div>
        </article>

        <footer class="post-footer">
          <p>Thanks for reading! Feel free to share this post if you found it helpful.</p>
          
          <div class="share-buttons">
            ${typeof navigator !== 'undefined' && 'share' in navigator ? html`
              <button class="share-btn" @click=${this.sharePost}>
                <span>🔗</span>
                Share
              </button>
            ` : ''}
            
            <a 
              href="https://twitter.com/intent/tweet?text=${encodeURIComponent(this.post.title)}&url=${encodeURIComponent(window.location.href)}"
              target="_blank"
              rel="noopener"
              class="share-btn"
            >
              <span>🐦</span>
              Tweet
            </a>
            
            <a 
              href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}"
              target="_blank"
              rel="noopener"
              class="share-btn"
            >
              <span>💼</span>
              LinkedIn
            </a>
          </div>
        </footer>
      </div>
    `;
  }
}