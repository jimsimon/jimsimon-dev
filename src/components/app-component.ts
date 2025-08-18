import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseComponent } from './base-component.js';

export type PageName = 'home' | 'projects' | 'blog' | 'blog-post' | 'admin';

@customElement('jim-app')
export class AppComponent extends BaseComponent {
  @state()
  currentPage: PageName = 'home';

  @state()
  currentSlug?: string;

  static styles = css`
    ${BaseComponent.styles}
      :host {
        display: block;
        min-height: 100vh;
      }

      .header {
        background: var(--background-color);
        border-bottom: 1px solid var(--border-color);
        position: sticky;
        top: 0;
        z-index: 100;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
        max-width: 1200px;
        margin: 0 auto;
        padding-left: 1rem;
        padding-right: 1rem;
      }

      .logo {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--primary-color);
        text-decoration: none;
        cursor: pointer;
      }

      .nav {
        display: flex;
        gap: 2rem;
      }

      .nav-link {
        color: var(--text-secondary);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
        cursor: pointer;
      }

      .nav-link:hover,
      .nav-link.active {
        color: var(--primary-color);
      }

      .main {
        min-height: calc(100vh - 120px);
      }

      .footer {
        background: var(--surface-color);
        border-top: 1px solid var(--border-color);
        padding: 2rem 0;
        text-align: center;
        color: var(--text-secondary);
      }

      @media (max-width: 768px) {
        .nav {
          gap: 1rem;
        }
      }
    `;

  connectedCallback() {
    super.connectedCallback();
    this.setupRouting();
  }

  private setupRouting() {
    // Simple client-side routing
    const path = window.location.pathname;
    if (path === '/projects') {
      this.currentPage = 'projects';
    } else if (path === '/blog') {
      this.currentPage = 'blog';
    } else if (path.startsWith('/blog/')) {
      this.currentPage = 'blog-post';
      this.currentSlug = path.split('/')[2];
    } else if (path.startsWith('/admin')) {
      this.currentPage = 'admin';
    } else {
      this.currentPage = 'home';
    }

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.setupRouting();
    });
  }

  private navigate(page: PageName, slug?: string) {
    this.currentPage = page;
    this.currentSlug = slug;
    
    let url = '/';
    if (page === 'projects') url = '/projects';
    else if (page === 'blog') url = '/blog';
    else if (page === 'blog-post' && slug) url = `/blog/${slug}`;
    else if (page === 'admin') url = '/admin';
    
    window.history.pushState({}, '', url);
  }

  private renderPage() {
    switch (this.currentPage) {
      case 'home':
        return html`<home-page></home-page>`;
      case 'projects':
        return html`<projects-page></projects-page>`;
      case 'blog':
        return html`<blog-page></blog-page>`;
      case 'blog-post':
        return html`<blog-post-page .slug=${this.currentSlug}></blog-post-page>`;
      case 'admin':
        return html`<admin-page></admin-page>`;
      default:
        return html`<home-page></home-page>`;
    }
  }

  render() {
    return html`
      <div class="header">
        <div class="header-content">
          <a class="logo" @click=${() => this.navigate('home')}>Jim Simon</a>
          <nav class="nav">
            <a 
              class="nav-link ${this.currentPage === 'home' ? 'active' : ''}"
              @click=${() => this.navigate('home')}
            >
              Home
            </a>
            <a 
              class="nav-link ${this.currentPage === 'projects' ? 'active' : ''}"
              @click=${() => this.navigate('projects')}
            >
              Projects
            </a>
            <a 
              class="nav-link ${this.currentPage === 'blog' || this.currentPage === 'blog-post' ? 'active' : ''}"
              @click=${() => this.navigate('blog')}
            >
              Blog
            </a>
            ${this.currentPage === 'admin' || localStorage.getItem('admin-token') ? html`
              <a 
                class="nav-link ${this.currentPage === 'admin' ? 'active' : ''}"
                @click=${() => this.navigate('admin')}
              >
                Admin
              </a>
            ` : ''}
          </nav>
        </div>
      </div>

      <main class="main">
        ${this.renderPage()}
      </main>

      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 Jim Simon. Built with Lit Elements, Koa, and ❤️</p>
        </div>
      </footer>
    `;
  }
}