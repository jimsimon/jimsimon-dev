import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { BaseComponent } from './base-component.js';
import type { Project } from '../types/index.js';

@customElement('project-editor')
export class ProjectEditor extends BaseComponent {
  @property({ type: Number })
  projectId?: number;

  @state()
  name = '';

  @state()
  description = '';

  @state()
  language = '';

  @state()
  url = '';

  @state()
  stars: number | null = null;

  @state()
  featured = false;

  @state()
  loading = false;

  @state()
  saving = false;

  @state()
  error = '';

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
    .form-group textarea,
    .form-group select {
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
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 120px;
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

    .loading, .error {
      text-align: center;
      padding: 2rem;
    }

    .error {
      color: var(--error-color);
    }

    .help-text {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .language-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .language-tag {
      padding: 0.25rem 0.5rem;
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .language-tag:hover {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
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

  private commonLanguages = [
    'TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 
    'Swift', 'Kotlin', 'Dart', 'PHP', 'Ruby', 'HTML/CSS', 'Shell'
  ];

  async connectedCallback() {
    super.connectedCallback();
    if (this.projectId) {
      await this.loadProject();
    }
  }

  private async loadProject() {
    this.loading = true;
    this.error = '';

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch(`/api/admin/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load projects');
      }

      const projects: Project[] = await response.json();
      const project = projects.find(p => p.id === this.projectId);

      if (!project) {
        throw new Error('Project not found');
      }

      this.name = project.name;
      this.description = project.description;
      this.language = project.language;
      this.url = project.url;
      this.stars = project.stars ?? null;
      this.featured = project.featured;
    } catch (error) {
      this.error = 'Failed to load project';
      console.error('Error loading project:', error);
    } finally {
      this.loading = false;
    }
  }

  private async saveProject() {
    if (!this.name || !this.description || !this.language || !this.url) {
      alert('Please fill in all required fields');
      return;
    }

    this.saving = true;
    this.error = '';

    try {
      const token = localStorage.getItem('admin-token');
      const projectData = {
        name: this.name,
        description: this.description,
        language: this.language,
        url: this.url,
        stars: this.stars,
        featured: this.featured
      };

      const url = this.projectId ? `/api/projects/${this.projectId}` : '/api/projects';
      const method = this.projectId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      const savedProject = await response.json();
      alert(`Project ${this.projectId ? 'updated' : 'created'} successfully!`);
      
      if (!this.projectId) {
        this.navigate('edit-project', savedProject.id);
      }
    } catch (error) {
      this.error = 'Failed to save project';
      console.error('Error saving project:', error);
    } finally {
      this.saving = false;
    }
  }

  private selectLanguage(language: string) {
    this.language = language;
  }

  private navigate(page: string, projectId?: number) {
    this.dispatchEvent(new CustomEvent('navigate', {
      detail: { page, projectId }
    }));
  }

  render() {
    if (this.loading) {
      return html`<div class="loading">Loading project...</div>`;
    }

    return html`
      <div class="editor-header">
        <h2>${this.projectId ? 'Edit Project' : 'Create New Project'}</h2>
        <div class="editor-actions">
          <button class="button secondary" @click=${() => this.navigate('projects')}>
            Back to Projects
          </button>
          <button 
            class="button primary" 
            @click=${this.saveProject}
            ?disabled=${this.saving}
          >
            ${this.saving ? 'Saving...' : 'Save Project'}
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
          <label for="name">Project Name *</label>
          <input
            id="name"
            type="text"
            .value=${this.name}
            @input=${(e: Event) => this.name = (e.target as HTMLInputElement).value}
            placeholder="Enter project name..."
            required
          />
        </div>

        <div class="form-group">
          <label for="description">Description *</label>
          <textarea
            id="description"
            .value=${this.description}
            @input=${(e: Event) => this.description = (e.target as HTMLTextAreaElement).value}
            placeholder="Describe what this project does..."
            required
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="language">Programming Language *</label>
            <input
              id="language"
              type="text"
              .value=${this.language}
              @input=${(e: Event) => this.language = (e.target as HTMLInputElement).value}
              placeholder="e.g., TypeScript, Python, etc."
              required
            />
            <div class="language-options">
              ${this.commonLanguages.map(lang => html`
                <span 
                  class="language-tag"
                  @click=${() => this.selectLanguage(lang)}
                >
                  ${lang}
                </span>
              `)}
            </div>
          </div>
          <div class="form-group">
            <label for="stars">GitHub Stars</label>
            <input
              id="stars"
              type="number"
              .value=${this.stars?.toString() || ''}
              @input=${(e: Event) => {
                const value = (e.target as HTMLInputElement).value;
                this.stars = value ? parseInt(value) : null;
              }}
              placeholder="Leave empty if none"
              min="0"
            />
            <div class="help-text">Optional: Number of stars on GitHub</div>
          </div>
        </div>

        <div class="form-group">
          <label for="url">Project URL *</label>
          <input
            id="url"
            type="url"
            .value=${this.url}
            @input=${(e: Event) => this.url = (e.target as HTMLInputElement).value}
            placeholder="https://github.com/username/project"
            required
          />
          <div class="help-text">GitHub repository URL or project homepage</div>
        </div>

        <div class="checkbox-group">
          <input
            id="featured"
            type="checkbox"
            .checked=${this.featured}
            @change=${(e: Event) => this.featured = (e.target as HTMLInputElement).checked}
          />
          <label for="featured">Featured Project</label>
        </div>
      </form>
    `;
  }
}