import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseComponent } from './base-component.js';
import type { PersonalInfo } from '../types/index.js';

@customElement('home-page')
export class HomePage extends BaseComponent {
  private profile: PersonalInfo = {
    name: 'Jim Simon',
    title: 'Staff Software Engineer at Reddit',
    location: 'Michigan, USA',
    bio: 'Passionate software engineer with expertise in backend development, microservices, and open source contributions. Strong focus on Dart, TypeScript, and modern web technologies.',
    email: 'jim.j.simon@gmail.com',
    github: 'https://github.com/jimsimon',
    linkedin: 'https://www.linkedin.com/in/jim-simon-engineer/',
    bluesky: '@jimsimon.dev',
    profilePicture: '/assets/jim.jpeg'
  };

  static styles = css`
    ${BaseComponent.styles}
      .hero {
        text-align: center;
        padding: 4rem 0;
        background: linear-gradient(135deg, var(--surface-color) 0%, var(--background-color) 100%);
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }

      .profile-picture {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        margin: 0 auto 2rem;
        display: block;
        object-fit: cover;
        border: 4px solid var(--primary-color);
        box-shadow: var(--shadow-lg);
        transition: transform 0.2s;
      }

      .profile-picture:hover {
        transform: scale(1.05);
      }

      .hero-title {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 1rem;
        color: var(--text-primary);
      }

      .hero-subtitle {
        font-size: 1.25rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
      }

      .hero-location {
        font-size: 1rem;
        color: var(--text-secondary);
        margin-bottom: 1rem;
      }

      .hero-bio {
        font-size: 1.1rem;
        color: var(--text-secondary);
        max-width: 600px;
        margin: 0 auto 2rem;
        line-height: 1.6;
      }

      .social-links {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
        flex-wrap: wrap;
      }

      .social-link {
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

      .social-link:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .highlights {
        padding: 4rem 0;
      }

      .section-title {
        font-size: 2rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 3rem;
        color: var(--text-primary);
      }

      .highlights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
      }

      .highlight-card {
        background: var(--background-color);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        padding: 2rem;
        text-align: center;
        box-shadow: var(--shadow);
        transition: all 0.2s;
      }

      .highlight-card:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
      }

      .highlight-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
      }

      .highlight-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--text-primary);
      }

      .highlight-description {
        color: var(--text-secondary);
        line-height: 1.6;
      }

      @media (max-width: 768px) {
        .profile-picture {
          width: 120px;
          height: 120px;
        }

        .hero-title {
          font-size: 2rem;
        }
        
        .hero-subtitle {
          font-size: 1.1rem;
        }
        
        .social-links {
          flex-direction: column;
          align-items: center;
        }
        
        .highlights-grid {
          grid-template-columns: 1fr;
        }
      }
    `;

  render() {

    return html`
      <section class="hero">
        <div class="container">
          ${this.profile.profilePicture ? html`
            <img
              src="${this.profile.profilePicture}"
              alt="${this.profile.name}"
              class="profile-picture"
            />
          ` : ''}
          <h1 class="hero-title">${this.profile.name}</h1>
          <h2 class="hero-subtitle">${this.profile.title}</h2>
          <p class="hero-location">📍 ${this.profile.location}</p>
          <p class="hero-bio">${this.profile.bio}</p>
          
          <div class="social-links">
            <a href="${this.profile.github}" target="_blank" rel="noopener" class="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a href="${this.profile.linkedin}" target="_blank" rel="noopener" class="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            ${this.profile.bluesky ? html`
              <a href="https://bsky.app/profile/${this.profile.bluesky}" target="_blank" rel="noopener" class="social-link">
                <svg width="20" height="18" viewBox="0 0 64 57" fill="currentColor">
                  <path d="M13.873 3.805C21.21 9.332 29.103 20.537 32 26.55v15.882c0-.338-.13.044-.41.867-1.512 4.456-7.418 21.847-20.923 7.944-7.111-7.32-3.819-14.64 9.125-16.85-7.405 1.264-15.73-.825-18.014-9.015C1.12 23.022 0 8.51 0 6.55 0-3.268 8.579-.182 13.873 3.805ZM50.127 3.805C42.79 9.332 34.897 20.537 32 26.55v15.882c0-.338.13.044.41.867 1.512 4.456 7.418 21.847 20.923 7.944 7.111-7.32 3.819-14.64-9.125-16.85 7.405 1.264 15.73-.825 18.014-9.015C62.88 23.022 64 8.51 64 6.55c0-9.818-8.578-6.732-13.873-2.745Z"/>
                </svg>
                Bluesky
              </a>
            ` : ''}
            <a href="mailto:${this.profile.email}" class="social-link">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636C.732 21.003 0 20.271 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.727L12 10.455l9.637-6.634h.727c.904 0 1.636.732 1.636 1.636z"/>
              </svg>
              Email
            </a>
          </div>
        </div>
      </section>

      <section class="highlights">
        <div class="container">
          <h2 class="section-title">What I Do</h2>
          <div class="highlights-grid">
            <div class="highlight-card">
              <div class="highlight-icon">🚀</div>
              <h3 class="highlight-title">Backend Development</h3>
              <p class="highlight-description">
                Specializing in scalable backend systems, microservices architecture, 
                and API design with a focus on performance and reliability.
              </p>
            </div>
            
            <div class="highlight-card">
              <div class="highlight-icon">🔧</div>
              <h3 class="highlight-title">Open Source</h3>
              <p class="highlight-description">
                Active contributor to open source projects with libraries and tools 
                used by developers worldwide, including Dart and TypeScript projects.
              </p>
            </div>
            
            <div class="highlight-card">
              <div class="highlight-icon">⚡</div>
              <h3 class="highlight-title">Modern Technologies</h3>
              <p class="highlight-description">
                Expertise in Dart, TypeScript, JavaScript, and modern web technologies. 
                Always learning and adopting the latest tools and best practices.
              </p>
            </div>
          </div>
        </div>
      </section>
    `;
  }
}