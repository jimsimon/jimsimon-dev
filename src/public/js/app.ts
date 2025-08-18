// Import all components
import '../../components/base-component.ts';
import '../../components/app-component.ts';
import '../../components/home-page.ts';
import '../../components/projects-page.ts';
import '../../components/blog-page.ts';
import '../../components/blog-post-page.ts';
import '../../components/admin-page.ts';
import '../../components/admin-dashboard.ts';
import '../../components/admin-settings.ts';
import '../../components/blog-post-editor.ts';
import '../../components/admin-projects.ts';
import '../../components/project-editor.ts';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  console.log('Jim Simon Personal Website loaded');
  
  // Handle navigation events
  document.addEventListener('navigate', (event: Event) => {
    const customEvent = event as CustomEvent;
    const { page, slug } = customEvent.detail;
    const app = document.querySelector('jim-app') as any;
    if (app) {
      app.currentPage = page;
      if (slug) {
        app.currentSlug = slug;
      }
    }
  });
});