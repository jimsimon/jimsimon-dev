import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseComponent } from './base-component.js';
import type { Project } from '../types/index.js';

@customElement('admin-projects')
export class AdminProjects extends BaseComponent {
  @state()
  projects: Project[] = [];

  @state()
  loading = true;

  @state()
  error = '';

  static styles = css`
    ${BaseComponent.styles}
    :host {
      display: block;
    }

    .projects-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .projects-grid {
      display: grid;
      gap: 1rem;
    }

    .project-item {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .project-info {
      flex: 1;
    }

    .project-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .project-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .project-status {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .project-status.featured {
      background: var(--success-color);
      color: white;
    }

    .project-status.normal {
      background: var(--surface-color);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
    }

    .project-description {
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 0.5rem;
    }

    .project-url {
      font-size: 0.875rem;
      color: var(--primary-color);
      text-decoration: none;
    }

    .project-url:hover {
      text-decoration: underline;
    }

    .project-actions {
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

    .stars {
      color: var(--warning-color);
    }
  `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadProjects();
  }

  private async loadProjects() {
    this.loading = true;
    this.error = '';

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('/api/admin/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load projects');
      }

      this.projects = await response.json();
    } catch (error) {
      this.error = 'Failed to load projects';
      console.error('Error loading projects:', error);
    } finally {
      this.loading = false;
    }
  }

  private async deleteProject(id: number) {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      await this.loadProjects();
    } catch (error) {
      alert('Failed to delete project');
      console.error('Error deleting project:', error);
    }
  }

  private async toggleFeatured(project: Project) {
    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...project,
          featured: !project.featured
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      await this.loadProjects();
    } catch (error) {
      alert('Failed to update project');
      console.error('Error updating project:', error);
    }
  }

  private navigate(page: string, projectId?: number) {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { page, projectId }
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
      return html`<div class="loading">Loading projects...</div>`;
    }

    if (this.error) {
      return html`
        <div class="error">
          ${this.error}
          <button class="button primary" @click=${this.loadProjects} style="margin-left: 1rem;">
            Retry
          </button>
        </div>
      `;
    }

    return html`
      <div class="projects-header">
        <h2>Projects</h2>
        <button class="button primary" @click=${() => this.navigate('create-project')}>
          Create New Project
        </button>
      </div>

      ${this.projects.length === 0 ? html`
        <div class="empty-state">
          <p>No projects yet.</p>
          <button class="button primary" @click=${() => this.navigate('create-project')}>
            Create Your First Project
          </button>
        </div>
      ` : html`
        <div class="projects-grid">
          ${this.projects.map(project => html`
            <div class="project-item">
              <div class="project-info">
                <h3 class="project-title">${project.name}</h3>
                <div class="project-meta">
                  <span>Language: ${project.language}</span>
                  ${project.stars ? html`<span class="stars">⭐ ${project.stars}</span>` : ''}
                  <span>Created: ${this.formatDate(project.createdAt)}</span>
                  <span class="project-status ${project.featured ? 'featured' : 'normal'}">
                    ${project.featured ? 'Featured' : 'Normal'}
                  </span>
                </div>
                <p class="project-description">${project.description}</p>
                <a class="project-url" href="${project.url}" target="_blank" rel="noopener noreferrer">
                  ${project.url}
                </a>
              </div>
              <div class="project-actions">
                <button 
                  class="action-button" 
                  @click=${() => this.navigate('edit-project', project.id)}
                  title="Edit project"
                >
                  ✏️
                </button>
                <button 
                  class="action-button" 
                  @click=${() => this.toggleFeatured(project)}
                  title="${project.featured ? 'Remove from featured' : 'Mark as featured'}"
                >
                  ${project.featured ? '⭐' : '☆'}
                </button>
                <button 
                  class="action-button danger" 
                  @click=${() => this.deleteProject(project.id)}
                  title="Delete project"
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