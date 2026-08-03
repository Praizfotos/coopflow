# Changelog

## [1.0.0] - 2026-08-03

### Added

- Initial release of CoopFlow
- Soroban smart contracts:
  - Registry contract for organizations, cooperatives, and members
  - Treasury contract for fund custody with multi-signature approvals
  - Contribution contract with configurable cycle types and penalty logic
  - Rotation contract with multiple payout order strategies
  - Governance contract with proposal lifecycle and voting
  - Loan contract with approval workflow and repayment tracking
- Backend API:
  - Authentication with JWT and refresh tokens
  - Cooperative management endpoints
  - Contribution tracking endpoints
  - Loan management endpoints
  - Treasury management endpoints
  - Notification service
  - Analytics and reporting endpoints
  - Event indexing from Stellar Horizon
- Frontend:
  - Next.js 15 with TypeScript
  - Tailwind CSS with Shadcn UI components
  - Dashboard with charts and analytics
  - Wallet integration (Freighter, Stellar Wallet Kit)
  - Responsive design
  - Multi-page application with role-based access
- Database:
  - PostgreSQL schema with 18 tables
  - TypeORM entities and migrations
  - Seed data for development
- DevOps:
  - Docker and Docker Compose configuration
  - GitHub Actions CI/CD pipeline
  - Multi-environment deployment support
- Documentation:
  - README with quick start guide
  - Architecture documentation
  - API reference
  - Security guidelines
  - Deployment guide
  - Database schema documentation
  - Smart contract documentation
  - Contributing guide
  - Roadmap

### Security

- Role-based access control
- JWT authentication with refresh tokens
- Rate limiting on all API endpoints
- Input validation and sanitization
- Audit logging for all sensitive operations
- Emergency pause functionality on all contracts