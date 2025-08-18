import { vi } from 'vitest';

// Mock fetch for all tests
Object.defineProperty(window, 'fetch', {
  value: vi.fn(),
  writable: true,
});

// Mock window.history for navigation tests
Object.defineProperty(window, 'history', {
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
  },
  writable: true,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock navigator.share for sharing functionality
Object.defineProperty(navigator, 'share', {
  value: vi.fn(),
  writable: true,
});