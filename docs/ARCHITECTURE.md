# Architecture

## System Overview

CoopFlow is a full-stack decentralized application built on the Stellar blockchain with Soroban smart contracts at its core.

## Architecture Layers

### 1. Smart Contracts (Soroban/Rust)

Six separate Soroban contracts handle on-chain logic:

- **Registry Contract** - Organizations, cooperatives, members, roles, metadata
- **Treasury Contract** - Fund custody, deposits, withdrawals, approval workflows
- **Contribution Contract** - Contribution schedules, payment records, penalty logic
- **Rotation Contract** - Payout order management, scheduling, execution
- **Governance Contract** - Proposal lifecycle, voting, threshold enforcement
- **Loan Contract** - Loan issuance, repayments, interest, defaults

### 2. Backend (Node.js/TypeScript/Express)

The backend provides:

- REST API with JWT authentication and RBAC
- PostgreSQL data persistence via TypeORM
- Redis caching for session management
- Event indexing from Stellar Horizon
- Notification service (email, SMS, Discord, Slack, Telegram)
- Rate limiting and input validation

### 3. Frontend (Next.js 15/TypeScript/Tailwind/Shadcn)

The frontend provides:

- Server-side rendering for SEO and performance
- Responsive design with Tailwind CSS
- Shadcn UI components
- Wallet integration (Freighter, Stellar Wallet Kit)
- Real-time dashboard with charts and analytics
- Multi-page application with role-based access

### 4. Infrastructure

- **PostgreSQL** - Primary database
- **Redis** - Caching and session storage
- **Stellar Horizon** - Blockchain data indexing
- **Soroban RPC** - Smart contract interaction
- **Docker** - Containerized deployment
- **GitHub Actions** - CI/CD pipeline

## Data Flow

1. User interacts with frontend
2. Frontend calls backend REST API
3. Backend validates and processes requests
4. Backend reads/writes to PostgreSQL
5. Backend interacts with Soroban contracts via Stellar SDK
6. Events are indexed from Horizon
7. Notifications are sent via configured channels

## Security Model

- Role-based access control (RBAC)
- JWT authentication with refresh tokens
- Soroban authorization guards
- Proposal expiration and threshold enforcement
- Emergency pause functionality
- Input validation and sanitization
- Rate limiting on API endpoints
- Audit logging for all sensitive operations