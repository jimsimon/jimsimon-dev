import { html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BaseComponent } from './base-component.js';

@customElement('admin-settings')
export class AdminSettings extends BaseComponent {
  @state()
  loading = false;

  @state()
  message = '';

  @state()
  error = '';

  static styles = css`
    ${BaseComponent.styles}
    :host {
      display: block;
    }

    .settings-header {
      margin-bottom: 2rem;
    }

    .settings-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }

    .settings-description {
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }

    .settings-section {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--text-primary);
    }

    .section-description {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    .form-group input {
      width: 100%;
      max-width: 400px;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      background: var(--background-color);
      color: var(--text-primary);
      font-size: 1rem;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
    }

    .password-form {
      max-width: 500px;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .success-message {
      background: var(--success-color);
      color: white;
      padding: 1rem;
      border-radius: var(--border-radius);
      margin-bottom: 1rem;
    }

    .error-message {
      background: var(--error-color);
      color: white;
      padding: 1rem;
      border-radius: var(--border-radius);
      margin-bottom: 1rem;
    }

    .password-requirements {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }

    .loading-overlay {
      opacity: 0.6;
      pointer-events: none;
    }
  `;

  private async handlePasswordChange(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Clear previous messages
    this.message = '';
    this.error = '';

    // Client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      this.error = 'All fields are required';
      return;
    }

    if (newPassword !== confirmPassword) {
      this.error = 'New passwords do not match';
      return;
    }

    if (newPassword.length < 6) {
      this.error = 'New password must be at least 6 characters long';
      return;
    }

    this.loading = true;

    try {
      const token = localStorage.getItem('admin-token');
      const response = await fetch('/api/admin/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      this.message = 'Password updated successfully!';
      form.reset();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to change password';
      console.error('Password change error:', error);
    } finally {
      this.loading = false;
    }
  }

  render() {
    return html`
      <div class="settings-header">
        <h1 class="settings-title">Admin Settings</h1>
        <p class="settings-description">
          Manage your admin account settings and preferences.
        </p>
      </div>

      ${this.message ? html`
        <div class="success-message">
          ${this.message}
        </div>
      ` : ''}

      ${this.error ? html`
        <div class="error-message">
          ${this.error}
        </div>
      ` : ''}

      <div class="settings-section ${this.loading ? 'loading-overlay' : ''}">
        <h2 class="section-title">Change Password</h2>
        <p class="section-description">
          Update your admin password. Make sure to use a strong password to keep your account secure.
        </p>

        <form class="password-form" @submit=${this.handlePasswordChange}>
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              required
              placeholder="Enter your current password"
              ?disabled=${this.loading}
            />
          </div>

          <div class="form-group">
            <label for="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              required
              placeholder="Enter your new password"
              ?disabled=${this.loading}
            />
            <div class="password-requirements">
              Password must be at least 6 characters long
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              placeholder="Confirm your new password"
              ?disabled=${this.loading}
            />
          </div>

          <div class="button-group">
            <button 
              type="submit" 
              class="button primary"
              ?disabled=${this.loading}
            >
              ${this.loading ? 'Updating...' : 'Update Password'}
            </button>
            <button 
              type="reset" 
              class="button secondary"
              ?disabled=${this.loading}
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>

      <div class="settings-section">
        <h2 class="section-title">Account Information</h2>
        <p class="section-description">
          Your current admin account details.
        </p>
        
        <div class="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value="jim.j.simon@gmail.com"
            readonly
            style="background-color: var(--surface-color); color: var(--text-secondary);"
          />
        </div>

        <div class="form-group">
          <label>Role</label>
          <input
            type="text"
            value="Administrator"
            readonly
            style="background-color: var(--surface-color); color: var(--text-secondary);"
          />
        </div>
      </div>
    `;
  }
}