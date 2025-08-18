import { LitElement, css, html } from 'lit';
import { property } from 'lit/decorators.js';

export class BaseComponent extends LitElement {
  @property({ type: Boolean })
  loading = false;

  @property({ type: String })
  error = '';

  static styles = css`
    :host {
      display: block;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .error {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      padding: 1rem;
      border-radius: var(--border-radius);
      margin-bottom: 1rem;
    }

    @media (prefers-color-scheme: dark) {
      .error {
        background: #450a0a;
        border-color: #7f1d1d;
        color: #fca5a5;
      }
    }
  `;

  protected renderLoading() {
    return html`<div class="loading">Loading...</div>`;
  }

  protected renderError() {
    return html`<div class="error">${this.error}</div>`;
  }

  protected async fetchData(url: string, options?: RequestInit): Promise<any> {
    try {
      this.loading = true;
      this.error = '';
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'An error occurred';
      throw err;
    } finally {
      this.loading = false;
    }
  }
}