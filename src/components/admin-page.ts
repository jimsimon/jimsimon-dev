import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseComponent } from './base-component.js';

export type AdminPageName = 'login' | 'dashboard' | 'create-post' | 'edit-post' | 'projects' | 'create-project' | 'edit-project' | 'settings';

@customElement('admin-page')
export class AdminPage extends BaseComponent {
  @state()
  currentAdminPage: AdminPageName = 'login';

  @state()
  isAuthenticated = false;

  @state()
  editPostId?: number;

  @state()
  editProjectId?: number;

  static styles = css`
    ${BaseComponent.styles}
    :host {
      display: block;
      min-height: 100vh;
      background: var(--background-color);
    }

    .admin-header {
      background: var(--surface-color);
      border-bottom: 1px solid var(--border-color);
      padding: 1rem 0;
    }

    .admin-header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .admin-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .admin-nav {
      display: flex;
      gap: 1rem;
    }

    .admin-nav-link {
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      color: var(--text-primary);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .admin-nav-link:hover,
    .admin-nav-link.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .admin-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .logout-button {
      padding: 0.5rem 1rem;
      background: var(--error-color);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .logout-button:hover {
      opacity: 0.8;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.checkAuthentication();
    this.setupAdminRouting();
  }

  private checkAuthentication() {
    const token = localStorage.getItem('admin-token');
    this.isAuthenticated = !!token;
    if (!this.isAuthenticated) {
      this.currentAdminPage = 'login';
    }
  }

  private setupAdminRouting() {
    const path = window.location.pathname;
    if (path === '/admin') {
      this.currentAdminPage = this.isAuthenticated ? 'dashboard' : 'login';
    } else if (path === '/admin/create') {
      this.currentAdminPage = 'create-post';
    } else if (path.startsWith('/admin/edit/')) {
      this.currentAdminPage = 'edit-post';
      this.editPostId = parseInt(path.split('/')[3]);
    } else if (path === '/admin/projects') {
      this.currentAdminPage = 'projects';
    } else if (path === '/admin/projects/create') {
      this.currentAdminPage = 'create-project';
    } else if (path.startsWith('/admin/projects/edit/')) {
      this.currentAdminPage = 'edit-project';
      this.editProjectId = parseInt(path.split('/')[4]);
    } else if (path === '/admin/settings') {
      this.currentAdminPage = 'settings';
    }
  }

  private navigate(page: AdminPageName, postId?: number, projectId?: number) {
    if (!this.isAuthenticated && page !== 'login') {
      this.currentAdminPage = 'login';
      return;
    }

    this.currentAdminPage = page;
    this.editPostId = postId;
    this.editProjectId = projectId;
    
    let url = '/admin';
    if (page === 'create-post') url = '/admin/create';
    else if (page === 'edit-post' && postId) url = `/admin/edit/${postId}`;
    else if (page === 'projects') url = '/admin/projects';
    else if (page === 'create-project') url = '/admin/projects/create';
    else if (page === 'edit-project' && projectId) url = `/admin/projects/edit/${projectId}`;
    else if (page === 'settings') url = '/admin/settings';
    
    window.history.pushState({}, '', url);
  }

  private async handleLogin(email: string, password: string) {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Login failed');
        return;
      }

      const data = await response.json();
      localStorage.setItem('admin-token', data.token);
      localStorage.setItem('admin-user', JSON.stringify(data.user));
      
      this.isAuthenticated = true;
      this.currentAdminPage = 'dashboard';
      this.navigate('dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  }

  private handleLogout() {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    this.isAuthenticated = false;
    this.currentAdminPage = 'login';
    this.navigate('login');
  }

  private renderLoginPage() {
    return html`
      <div class="admin-content">
        <div class="card" style="max-width: 400px; margin: 2rem auto;">
          <h2>Admin Login</h2>
          <p>Enter your credentials to access the blog management system.</p>
          <form @submit=${(e: Event) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            const email = formData.get('email') as string;
            const password = formData.get('password') as string;
            this.handleLogin(email, password);
          }}>
            <div class="form-group">
              <label for="email">Email:</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                value="jim.j.simon@gmail.com"
                style="width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 4px;"
              />
            </div>
            <div class="form-group">
              <label for="password">Password:</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                placeholder="Enter your password"
                style="width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 4px;"
              />
            </div>
            <button type="submit" class="button primary" style="width: 100%;">
              Login
            </button>
          </form>
          <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--text-secondary);">
            Default password: <code>admin123</code>
          </p>
        </div>
      </div>
    `;
  }

  private renderAdminPage() {
    switch (this.currentAdminPage) {
      case 'dashboard':
        return html`<admin-dashboard @navigate=${(e: CustomEvent) => this.navigate(e.detail.page, e.detail.postId)}></admin-dashboard>`;
      case 'create-post':
        return html`<blog-post-editor @navigate=${(e: CustomEvent) => this.navigate(e.detail.page)}></blog-post-editor>`;
      case 'edit-post':
        return html`<blog-post-editor .postId=${this.editPostId} @navigate=${(e: CustomEvent) => this.navigate(e.detail.page)}></blog-post-editor>`;
      case 'projects':
        return html`<admin-projects @navigate=${(e: CustomEvent) => this.navigate(e.detail.page, undefined, e.detail.projectId)}></admin-projects>`;
      case 'create-project':
        return html`<project-editor @navigate=${(e: CustomEvent) => this.navigate(e.detail.page)}></project-editor>`;
      case 'edit-project':
        return html`<project-editor .projectId=${this.editProjectId} @navigate=${(e: CustomEvent) => this.navigate(e.detail.page)}></project-editor>`;
      case 'settings':
        return html`<admin-settings></admin-settings>`;
      default:
        return html`<admin-dashboard @navigate=${(e: CustomEvent) => this.navigate(e.detail.page, e.detail.postId)}></admin-dashboard>`;
    }
  }

  render() {
    if (!this.isAuthenticated) {
      return this.renderLoginPage();
    }

    return html`
      <div class="admin-header">
        <div class="admin-header-content">
          <h1 class="admin-title">Admin Panel</h1>
          <div class="admin-nav">
            <a 
              class="admin-nav-link ${this.currentAdminPage === 'dashboard' ? 'active' : ''}"
              @click=${() => this.navigate('dashboard')}
            >
              Blog Posts
            </a>
            <a
              class="admin-nav-link ${this.currentAdminPage === 'projects' || this.currentAdminPage === 'create-project' || this.currentAdminPage === 'edit-project' ? 'active' : ''}"
              @click=${() => this.navigate('projects')}
            >
              Projects
            </a>
            <a
              class="admin-nav-link ${this.currentAdminPage === 'settings' ? 'active' : ''}"
              @click=${() => this.navigate('settings')}
            >
              Settings
            </a>
            <button class="logout-button" @click=${this.handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div class="admin-content">
        ${this.renderAdminPage()}
      </div>
    `;
  }
}