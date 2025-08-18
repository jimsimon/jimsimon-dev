# Jim Simon Personal Website

A modern, professional personal website built with TypeScript, Lit Elements, Koa, PGlite, and Drizzle ORM. Features a home page with personal information, a projects showcase, and a full-featured blog.

## Features

- **Home Page**: Professional introduction with personal information and highlights
- **Projects Page**: Showcase of notable GitHub repositories and personal projects
- **Blog**: Full-featured blog with CRUD operations and rich content support
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode**: Automatic dark mode support based on user preferences
- **Modern Stack**: Built with the latest web technologies

## Technology Stack

- **Frontend**: Lit Elements, TypeScript, CSS3
- **Backend**: Koa.js, Node.js
- **Database**: PGlite with Drizzle ORM
- **Authentication**: EasyAuth middleware
- **Testing**: Vitest with comprehensive test coverage
- **Build**: TypeScript compiler with ESM modules
- **Linting**: ESLint with TypeScript support

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd personal-site-gpt-oss
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm test` - Run the test suite
- `npm run test:ui` - Run tests with Vitest UI
- `npm run lint` - Lint the codebase
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── components/          # Lit Element components
│   ├── app-component.ts        # Main application component
│   ├── base-component.ts       # Base component with common functionality
│   ├── home-page.ts           # Home page component
│   ├── projects-page.ts       # Projects showcase component
│   ├── blog-page.ts           # Blog listing component
│   └── blog-post-page.ts      # Individual blog post component
├── database/           # Database schema and connection
│   ├── connection.ts          # PGlite database connection
│   └── schema.ts             # Drizzle ORM schema definitions
├── middleware/         # Koa middleware
│   └── auth.ts               # Authentication middleware
├── routes/            # API routes
│   └── api.ts               # RESTful API endpoints
├── types/             # TypeScript type definitions
│   └── index.ts             # Shared interfaces and types
├── tests/             # Test files
│   ├── setup.ts            # Test setup and mocks
│   ├── api.test.ts         # API endpoint tests
│   ├── database.test.ts    # Database functionality tests
│   └── components.test.ts  # Component tests
├── public/            # Static assets
│   ├── css/
│   │   └── styles.css      # Global styles and CSS variables
│   └── js/
│       └── app.js         # Client-side JavaScript entry point
└── server.ts          # Main server file
```

## API Endpoints

### Public Endpoints
- `GET /api/profile` - Get personal profile information
- `GET /api/projects` - Get all projects
- `GET /api/projects/featured` - Get featured projects only
- `GET /api/blog` - Get published blog posts
- `GET /api/blog/:slug` - Get specific blog post by slug

### Protected Endpoints (Admin only)
- `POST /api/blog` - Create new blog post
- `PUT /api/blog/:id` - Update existing blog post
- `DELETE /api/blog/:id` - Delete blog post
- `POST /api/projects` - Create new project

## Authentication

The application includes a simple authentication system for admin functions:

- Blog post creation, editing, and deletion require admin authentication
- Use the Bearer token `admin-token` in the Authorization header for admin access
- In production, replace with a proper JWT implementation

## Database

The application uses PGlite (WebAssembly PostgreSQL) with Drizzle ORM:

- **PGlite**: Embedded PostgreSQL database that runs in-process
- **Drizzle ORM**: Type-safe SQL query builder
- **Schema**: Includes tables for users, blog posts, and projects
- **Seeding**: Automatically seeds initial data on startup

## Testing

Comprehensive test suite includes:

- **API Tests**: Testing all endpoints with various scenarios
- **Database Tests**: Testing CRUD operations and data integrity
- **Component Tests**: Testing Lit Element components and user interactions
- **Mocking**: Proper mocking of external dependencies

Run tests with:
```bash
npm test           # Run all tests
npm run test:ui    # Run with Vitest UI
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The application will be available on the specified port (default: 3000).

## Development

### Adding New Features

1. **Components**: Create new Lit Element components in `src/components/`
2. **API Endpoints**: Add routes to `src/routes/api.ts`
3. **Database**: Update schema in `src/database/schema.ts`
4. **Types**: Add TypeScript interfaces to `src/types/index.ts`

### Code Style

- Follow TypeScript strict mode
- Use ESLint for code linting
- Components should extend `BaseComponent` for consistent error handling
- Use CSS custom properties for theming

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.

## About

This personal website showcases the work and projects of Jim Simon, a Staff Software Engineer at Reddit. The site demonstrates modern web development practices and serves as both a portfolio and a platform for sharing thoughts on software development.

For questions or collaboration opportunities, feel free to reach out through the contact information on the website.