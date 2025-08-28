# 🤝 Contributing to Findamine

Thank you for your interest in contributing to Findamine! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Architecture Guidelines](#architecture-guidelines)
- [Troubleshooting](#troubleshooting)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Package manager (recommended) or npm
- **Docker**: For running the database
- **Git**: Version control
- **Code Editor**: VS Code recommended with extensions

### Required Extensions (VS Code)

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Prisma**: Database schema support
- **Tailwind CSS IntelliSense**: CSS class suggestions

## 🛠️ Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub first
git clone https://github.com/YOUR_USERNAME/findamine.git
cd findamine
git remote add upstream https://github.com/mk-bold/findamine.git
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

```bash
# Copy environment files
cp .env.example .env
cp services/api/.env.example services/api/.env
cp apps/web/.env.example apps/web/.env.local

# Edit the files with your local configuration
```

### 4. Database Setup

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Run database migrations
cd services/api
npx prisma migrate dev
npx prisma generate
cd ../..
```

### 5. Start Development

```bash
# Start all services
pnpm dev

# Or start individual services
pnpm --filter @findamine/web dev
pnpm --filter @findamine/api dev
pnpm --filter @findamine/mobile start
```

## 🔧 Making Changes

### Branch Naming Convention

Use descriptive branch names with prefixes:

```bash
# Feature branches
git checkout -b feature/user-authentication
git checkout -b feature/game-creation

# Bug fix branches
git checkout -b fix/login-redirect-issue
git checkout -b fix/database-connection-error

# Documentation branches
git checkout -b docs/api-endpoints
git checkout -b docs/setup-guide
```

### Commit Message Format

Follow conventional commit format:

```bash
# Format: type(scope): description
git commit -m "feat(auth): add JWT refresh token support"
git commit -m "fix(web): resolve logout redirect issue"
git commit -m "docs(api): update authentication endpoints"
git commit -m "style(web): improve button hover effects"
git commit -m "refactor(auth): simplify token validation logic"
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific app tests
pnpm --filter @findamine/web test
pnpm --filter @findamine/api test

# Run tests in watch mode
pnpm --filter @findamine/web test:watch
```

### Writing Tests

- **Backend**: Use Jest with NestJS testing utilities
- **Frontend**: Use Jest with React Testing Library
- **Coverage**: Aim for at least 80% code coverage

### Test Structure

```typescript
// Example test structure
describe('AuthService', () => {
  describe('login', () => {
    it('should authenticate valid credentials', async () => {
      // Test implementation
    });

    it('should reject invalid credentials', async () => {
      // Test implementation
    });
  });
});
```

## 🔄 Pull Request Process

### 1. Prepare Your Changes

```bash
# Ensure your branch is up to date
git fetch upstream
git rebase upstream/main

# Run tests and linting
pnpm lint
pnpm test
```

### 2. Create Pull Request

1. **Title**: Use conventional commit format
2. **Description**: Explain what and why, not how
3. **Checklist**: Include testing and documentation updates
4. **Screenshots**: For UI changes
5. **Related Issues**: Link to relevant issues

### 3. PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No hardcoded values

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

## 🎨 Code Style

### TypeScript

- **Strict Mode**: Always enabled
- **Interfaces**: Use for object shapes
- **Types**: Use for unions, intersections, etc.
- **Generics**: Use when appropriate
- **Async/Await**: Prefer over Promises

### React/Next.js

- **Functional Components**: Use hooks and functional components
- **Props Interface**: Define prop types with interfaces
- **Custom Hooks**: Extract reusable logic
- **Error Boundaries**: Implement for error handling

### NestJS

- **Dependency Injection**: Use constructor injection
- **Guards**: Implement for authorization
- **Interceptors**: Use for logging and transformation
- **Validation**: Use DTOs with class-validator

### Database

- **Prisma**: Use for all database operations
- **Migrations**: Always create migrations for schema changes
- **Seeding**: Use Prisma seeding for test data
- **Relations**: Define proper relationships in schema

## 🏗️ Architecture Guidelines

### Monorepo Structure

```
findamine/
├── apps/                 # Frontend applications
│   ├── mobile/          # React Native app
│   └── web/            # Next.js web app
├── services/            # Backend services
│   └── api/            # NestJS API
├── packages/            # Shared packages (future)
└── tools/              # Build and development tools
```

### Code Organization

- **Feature-based**: Group related functionality together
- **Separation of Concerns**: Keep business logic separate from UI
- **Dependency Direction**: Dependencies flow inward
- **Shared Code**: Extract common utilities to shared packages

### API Design

- **RESTful**: Follow REST principles
- **Versioning**: Use URL versioning (/api/v1/)
- **Error Handling**: Consistent error response format
- **Validation**: Input validation at API boundaries

## 🐛 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Check if Docker is running
docker ps

# Restart database
docker-compose down
docker-compose up -d

# Reset database
docker-compose down -v
docker-compose up -d
```

#### Port Conflicts
```bash
# Check what's using a port
lsof -i :3000
lsof -i :4000

# Kill process
kill -9 <PID>
```

#### Dependencies
```bash
# Clear node_modules and reinstall
rm -rf node_modules
pnpm install

# Clear cache
pnpm store prune
```

#### Build Issues
```bash
# Clear build cache
rm -rf .next
rm -rf dist
pnpm build
```

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)

### Community
- [GitHub Issues](https://github.com/mk-bold/findamine/issues)
- [GitHub Discussions](https://github.com/mk-bold/findamine/discussions)
- [Discord Server](link-to-discord)

## 🙏 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor hall of fame
- GitHub contributors page

---

**Thank you for contributing to Findamine! 🗺️✨**

Your contributions help make treasure hunting more accessible and enjoyable for everyone.
