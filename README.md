# CoopFlow

**Programmable Cooperative Finance Platform powered by Stellar and Soroban.**

CoopFlow is a complete operating system for cooperatives, savings groups, SACCOs, rotating savings clubs (Ajo/Esusu/Chama/Susu), investment clubs, NGOs, and community finance organizations.

## Overview

CoopFlow modernizes cooperative finance using Stellar and Soroban, providing:

- **Cooperative Management** - Create cooperatives, invite members, assign roles
- **Contribution Engine** - Weekly, biweekly, monthly, quarterly, yearly, and custom cycles
- **Rotating Payout Engine** - Lottery, manual order, priority, random draw, voting
- **Treasury** - Built on Soroban for XLM, classic Stellar assets, and future Soroban tokens
- **Governance** - On-chain proposals, voting, spending approval
- **Loan Module** - Member loans with committee approval, interest, repayment schedules
- **Emergency Fund** - Separate community emergency savings
- **Investment Pool** - Track returns and distribute profits
- **Notifications** - Email, SMS, Discord, Slack, Telegram, push notifications
- **Reports** - CSV, Excel, PDF export with financial statements
- **Dashboard** - Overview with charts, graphs, contribution heatmaps

## Smart Contract Architecture

| Contract | Purpose |
|----------|---------|
| Registry | Organizations, cooperatives, members, metadata |
| Treasury | Fund custody, deposits, withdrawals, approvals |
| Contribution | Contribution schedules, records, penalty logic |
| Rotation | Payout order, scheduling, execution |
| Governance | Voting, proposal lifecycle, threshold enforcement |
| Loan | Loan issuance, repayments, interest, defaults |

## Quick Start

### Prerequisites

- Rust 1.75+
- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose

### Development

```bash
# Start all services
docker compose up -d

# Run backend
cd backend && npm run dev

# Run frontend
cd frontend && npm run dev

# Run contract tests
cd contracts && cargo test --all
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Security](docs/SECURITY.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Database](docs/DATABASE.md)
- [Contracts](docs/CONTRACTS.md)
- [Contributing](docs/CONTRIBUTING.md)
- [Changelog](docs/CHANGELOG.md)
- [Roadmap](docs/ROADMAP.md)

## License

MIT - See [LICENSE](LICENSE)

## Support

For questions, issues, and contributions, please visit our [GitHub repository](https://github.com/coopflow/coopflow).