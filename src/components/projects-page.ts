import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseComponent } from './base-component.js';
import type { Project } from '../types/index.js';

@customElement('projects-page')
export class ProjectsPage extends BaseComponent {
  @state()
  projects: Project[] = [];

  @state()
  featuredProjects: Project[] = [];

  static styles = css`
    ${BaseComponent.styles}
      .container {
        max-width: 1200px;
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

      .section-title {
        font-size: 1.75rem;
        font-weight: 600;
        margin-bottom: 2rem;
        color: var(--text-primary);
      }

      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 2rem;
        margin-bottom: 4rem;
      }

      .project-card {
        background: var(--background-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 2rem;
        box-shadow: var(--shadow);
        transition: all 0.2s;
        position: relative;
      }

      .project-card:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
      }

      .project-card.featured {
        border-color: var(--primary-color);
        background: linear-gradient(135deg, var(--background-color) 0%, var(--surface-color) 100%);
      }

      .featured-badge {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: var(--primary-color);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }

      .project-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
      }

      .project-language {
        display: inline-block;
        background: var(--accent-color);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .project-description {
        color: var(--text-secondary);
        line-height: 1.6;
        margin-bottom: 1.5rem;
      }

      .project-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .project-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--primary-color);
        color: white;
        text-decoration: none;
        border-radius: var(--border-radius);
        font-weight: 500;
        transition: all 0.2s;
        font-size: 0.875rem;
      }

      .project-link:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
      }

      .project-stars {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        color: var(--text-secondary);
        font-size: 0.875rem;
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

      @media (max-width: 768px) {
        .projects-grid {
          grid-template-columns: 1fr;
        }
        
        .page-title {
          font-size: 2rem;
        }
      }
    `;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadProjects();
  }

  private async loadProjects() {
    try {
      const [allProjects, featured] = await Promise.all([
        this.fetchData('/api/projects'),
        this.fetchData('/api/projects/featured')
      ]);
      
      this.projects = allProjects;
      this.featuredProjects = featured;
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  private renderProject(project: Project) {
    return html`
      <div class="project-card ${project.featured ? 'featured' : ''}">
        ${project.featured ? html`<div class="featured-badge">Featured</div>` : ''}
        
        <div class="project-header">
          <div>
            <h3 class="project-title">${project.name}</h3>
            <span class="project-language">${project.language}</span>
          </div>
        </div>
        
        <p class="project-description">${project.description}</p>
        
        <div class="project-footer">
          <a href="${project.url}" target="_blank" rel="noopener" class="project-link">
            <span>🔗</span>
            View Project
          </a>
          
          ${project.stars ? html`
            <div class="project-stars">
              <span>⭐</span>
              <span>${project.stars}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  render() {
    if (this.loading) return this.renderLoading();
    if (this.error) return this.renderError();

    const featuredProjects = this.projects.filter(p => p.featured);
    const otherProjects = this.projects.filter(p => !p.featured);

    return html`
      <div class="container">
        <h1 class="page-title">Projects</h1>
        <p class="page-subtitle">
          Here are some of the projects I've worked on, ranging from open source libraries 
          to full-stack applications. Each project represents a learning experience and 
          contribution to the developer community.
        </p>

        ${featuredProjects.length > 0 ? html`
          <section>
            <h2 class="section-title">Featured Projects</h2>
            <div class="projects-grid">
              ${featuredProjects.map(project => this.renderProject(project))}
            </div>
          </section>
        ` : ''}

        ${otherProjects.length > 0 ? html`
          <section>
            <h2 class="section-title">Other Projects</h2>
            <div class="projects-grid">
              ${otherProjects.map(project => this.renderProject(project))}
            </div>
          </section>
        ` : ''}

        ${this.projects.length === 0 ? html`
          <div class="empty-state">
            <div class="empty-icon">📁</div>
            <h3>No projects found</h3>
            <p>Check back later for updates!</p>
          </div>
        ` : ''}
      </div>
    `;
  }
}