import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseComponent } from './base-component.js';
import type { BlogPost } from '../types/index.js';

@customElement('blog-page')
export class BlogPage extends BaseComponent {
  @state()
  posts: BlogPost[] = [];

  static styles = css`
    ${BaseComponent.styles}
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }

      .page-title {
        font-size: 2.5rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 1rem;
        color: var(--text-primary);
      }

      .page-subtitle {
        font-size: 1.1rem;
        color: var(--text-secondary);
        text-align: center;
        margin-bottom: 3rem;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }

      .posts-list {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .post-card {
        background: var(--background-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 2rem;
        box-shadow: var(--shadow);
        transition: all 0.2s;
        cursor: pointer;
      }

      .post-card:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
      }

      .post-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
        text-decoration: none;
      }

      .post-title:hover {
        color: var(--primary-color);
      }

      .post-meta {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
      }

      .post-date {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .post-excerpt {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 1rem;
      }

      .read-more {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s;
      }

      .read-more:hover {
        gap: 0.75rem;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-secondary);
      }

      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }

      .admin-panel {
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 1.5rem;
        margin-bottom: 2rem;
      }

      .admin-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 1rem;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: var(--primary-color);
        color: white;
        text-decoration: none;
        border-radius: var(--border-radius);
        font-weight: 500;
        transition: all 0.2s;
        border: none;
        cursor: pointer;
        font-size: 0.875rem;
      }

      .btn:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
      }

      @media (max-width: 768px) {
        .page-title {
          font-size: 2rem;
        }
        
        .post-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.5rem;
        }
      }
    `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadPosts();
  }

  private async loadPosts() {
    try {
      this.posts = await this.fetchData('/api/blog');
    } catch (error) {
      console.error('Failed to load blog posts:', error);
    }
  }

  private navigateToPost(slug: string) {
    window.history.pushState({}, '', `/blog/${slug}`);
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { page: 'blog-post', slug },
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

  render() {
    if (this.loading) return this.renderLoading();
    if (this.error) return this.renderError();

    return html`
      <div class="container">
        <h1 class="page-title">Blog</h1>
        <p class="page-subtitle">
          Thoughts on software development, technology trends, and lessons learned 
          from building applications and contributing to open source projects.
        </p>

        ${this.posts.length > 0 ? html`
          <div class="posts-list">
            ${this.posts.map(post => html`
              <article class="post-card" @click=${() => this.navigateToPost(post.slug)}>
                <h2 class="post-title">${post.title}</h2>
                
                <div class="post-meta">
                  <div class="post-date">
                    <span>📅</span>
                    <span>${this.formatDate(post.createdAt.toString())}</span>
                  </div>
                </div>
                
                <p class="post-excerpt">${post.excerpt}</p>
                
                <a href="/blog/${post.slug}" class="read-more" @click=${(e: Event) => {
                  e.preventDefault();
                  this.navigateToPost(post.slug);
                }}>
                  Read more
                  <span>→</span>
                </a>
              </article>
            `)}
          </div>
        ` : html`
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>No blog posts yet</h3>
            <p>Check back soon for interesting content about software development and technology!</p>
          </div>
        `}
      </div>
    `;
  }
}