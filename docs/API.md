# API Reference

## Base URL

```
http://localhost:3001/api/v1
```

## Authentication

All API endpoints (except `/auth/register` and `/auth/login`) require a Bearer token in the Authorization header.

### Register

```
POST /api/v1/auth/register
```

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "cooperativeId": "uuid"
}
```

### Login

```
POST /api/v1/auth/login
```

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "string", "email": "string", "role": "string" },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### Get Current User

```
GET /api/v1/auth/me
```

**Headers:** `Authorization: Bearer <token>`

## Cooperative Endpoints

### Get All Cooperatives

```
GET /api/v1/cooperatives
```

### Create Cooperative

```
POST /api/v1/cooperatives
```

**Body:**
```json
{
  "name": "string",
  "organizationId": "uuid",
  "description": "string"
}
```

### Get Cooperative by ID

```
GET /api/v1/cooperatives/:id
```

### Update Cooperative

```
PUT /api/v1/cooperatives/:id
```

### Delete Cooperative

```
DELETE /api/v1/cooperatives/:id
```

### Get Members

```
GET /api/v1/cooperatives/:id/members
```

### Add Member

```
POST /api/v1/cooperatives/:id/members
```

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "walletAddress": "string",
  "role": "Member"
}
```

## Contribution Endpoints

### Get Active Cycles

```
GET /api/v1/contributions/cycles?cooperativeId=uuid
```

### Create Cycle

```
POST /api/v1/contributions/cycles
```

### Record Payment

```
POST /api/v1/contributions/cycles/:id/pay
```

### Get Cycle Payments

```
GET /api/v1/contributions/cycles/:id/payments
```

### Get Member Summary

```
GET /api/v1/contributions/member/:memberId/summary
```

### Calculate Penalty

```
GET /api/v1/contributions/cycles/:id/penalty?memberId=uuid
```

### Complete Cycle

```
POST /api/v1/contributions/cycles/:id/complete
```

## Loan Endpoints

### Get All Loans

```
GET /api/v1/loans?cooperativeId=uuid&status=Active
```

### Request Loan

```
POST /api/v1/loans
```

### Approve Loan

```
PUT /api/v1/loans/:id/approve
```

### Reject Loan

```
PUT /api/v1/loans/:id/reject
```

### Disburse Loan

```
POST /api/v1/loans/:id/disburse
```

### Record Repayment

```
POST /api/v1/loans/:id/repay
```

## Treasury Endpoints

### Get Balance

```
GET /api/v1/treasury/balance?cooperativeId=uuid&asset=XLM
```

### Get All Balances

```
GET /api/v1/treasury/balances?cooperativeId=uuid
```

### Deposit

```
POST /api/v1/treasury/deposit
```

### Request Withdrawal

```
POST /api/v1/treasury/withdrawal
```

### Approve Withdrawal

```
POST /api/v1/treasury/withdrawal/:id/approve
```

### Execute Withdrawal

```
POST /api/v1/treasury/withdrawal/:id/execute
```

### Get Transactions

```
GET /api/v1/treasury/transactions?cooperativeId=uuid
```

## Governance Endpoints

### Get Active Proposals

```
GET /api/v1/governance/proposals?cooperativeId=uuid
```

### Create Proposal

```
POST /api/v1/governance/proposals
```

### Vote on Proposal

```
POST /api/v1/governance/proposals/:id/vote
```

### Execute Proposal

```
POST /api/v1/governance/proposals/:id/execute
```

## Analytics Endpoints

### Dashboard Stats

```
GET /api/v1/analytics/dashboard?cooperativeId=uuid
```

### Contribution Trends

```
GET /api/v1/analytics/contribution-trends?cooperativeId=uuid&period=monthly
```

### Loan Repayment Rates

```
GET /api/v1/analytics/loan-repayment-rates?cooperativeId=uuid
```

### Treasury Health

```
GET /api/v1/analytics/treasury-health?cooperativeId=uuid
```

### Financial Forecasting

```
GET /api/v1/analytics/forecasting?cooperativeId=uuid
```

## Notification Endpoints

### Get Notifications

```
GET /api/v1/notifications
```

### Mark as Read

```
PUT /api/v1/notifications/:id/read
```

## Health Check

```
GET /api/v1/health
```