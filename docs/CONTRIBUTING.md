# Contributing to CoopFlow

## Getting Started

### Prerequisites

- Rust 1.75+
- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose

### Setup

```bash
# Clone the repository
git clone https://github.com/coopflow/coopflow.git
cd coopflow

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Set up environment
cp .env.example .env

# Start development environment
docker compose up -d
```

### Running Tests

```bash
# Contract tests
cd contracts && cargo test --all

# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Code Style

### Rust

- Follow `rustfmt` formatting
- Use `clippy` for linting
- Document all public functions
- Use meaningful variable names

### TypeScript

- Use ESLint and Prettier
- Follow the existing code style
- Add JSDoc comments for public functions
- Use TypeScript strict mode

### React/Next.js

- Use functional components with hooks
- Follow the existing component structure
- Use Tailwind CSS for styling
- Use Shadcn UI components

## Commit Guidelines

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Maintenance tasks

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add or update tests for new functionality
4. Request review from at least one maintainer
5. Address review feedback
6. Merge after approval

## Reporting Issues

When reporting bugs, please include:

- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Screenshots or logs if applicable

## Feature Requests

When requesting features, please include:

- Clear description of the feature
- Use case and motivation
- Proposed implementation approach
- Impact on existing functionality