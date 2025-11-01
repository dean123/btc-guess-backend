# BTC Guess Backend

A real-time Bitcoin price guessing game backend built with NestJS. Users can guess whether Bitcoin's price will go UP or DOWN, and the system automatically resolves guesses and updates scores when new prices come in.

## Overview

This application fetches Bitcoin prices from CoinGecko every minute and allows users to make predictions about price movements. It features:

- **User Authentication** - JWT-based authentication with bcrypt password hashing
- **Real-time Price Tracking** - Automated Bitcoin price fetching via CoinGecko API
- **Guess System** - Users predict UP/DOWN price movements
- **Automatic Resolution** - Guesses are automatically resolved when new prices arrive
- **Scoring System** - +1 point for correct guesses, -1 for incorrect guesses
- **AWS DynamoDB** - NoSQL database for scalable storage

## Architecture

```
src/
├── auth/           # JWT authentication & user registration
├── users/          # User management & scoring
├── price-snapshots/ # Bitcoin price fetching & storage
├── guesses/        # Guess creation & resolution
├── config/         # Configuration (DynamoDB, etc.)
└── database/       # DynamoDB service wrapper
```

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **AWS DynamoDB** - NoSQL database
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CoinGecko API** - Bitcoin price data
- **Docker** - Containerization

## Prerequisites

- Node.js 22+
- npm or yarn
- AWS Account (for DynamoDB)
- AWS CLI configured (for local development with DynamoDB)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Local DynamoDB

You have two options for local development:

#### Option A: Use DynamoDB Local (Recommended for Local Development)

```bash
# Install and run DynamoDB Local with Docker
docker run -p 8000:8000 amazon/dynamodb-local

# In another terminal, create local tables
npm run dynamodb:create-tables
```

#### Option B: Use AWS DynamoDB

Make sure your AWS CLI is configured with credentials:

```bash
aws configure
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# AWS Configuration
AWS_REGION=eu-central-1

# DynamoDB Tables
DYNAMODB_PRICE_SNAPSHOTS_TABLE=price-snapshots
DYNAMODB_USERS_TABLE=users
DYNAMODB_GUESSES_TABLE=guesses

# For local DynamoDB, uncomment:
# DYNAMODB_ENDPOINT=http://localhost:8000

# JWT Configuration
JWT_SECRET=your-local-secret-key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

### 4. Create DynamoDB Tables

If using AWS DynamoDB:

```bash
# Using the automated script
./scripts/create-dynamodb-tables-aws.sh

# Or manually create tables with AWS CLI
aws dynamodb create-table \
    --table-name users \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

aws dynamodb create-table \
    --table-name price-snapshots \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST

aws dynamodb create-table \
    --table-name guesses \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST
```

### 5. Run the Development Server

```bash
# Development mode with hot-reload
npm run start:dev

# Regular development mode
npm run start

# Production mode
npm run start:prod
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

```bash
# Register a new user
POST /auth/register
Body: { "username": "john", "password": "SecurePass123!" }

# Login
POST /auth/login
Body: { "username": "john", "password": "SecurePass123!" }
Response: { "access_token": "jwt-token" }
```

### Price Snapshots

```bash
# Get latest price snapshots (requires auth)
GET /price-snapshots/latest
Headers: { "Authorization": "Bearer <token>" }
```

### Guesses

```bash
# Create a new guess (requires auth)
POST /guesses
Headers: { "Authorization": "Bearer <token>" }
Body: { "priceSnapshotId": "uuid", "direction": "UP" }

# Get my guesses
GET /guesses/me
Headers: { "Authorization": "Bearer <token>" }
```

### Users

```bash
# Get my profile
GET /users/me
Headers: { "Authorization": "Bearer <token>" }
```

## How It Works

1. **Price Fetching**: A cron job runs every minute to fetch the latest Bitcoin price from CoinGecko
2. **Price Storage**: Each price is stored as a snapshot in DynamoDB
3. **User Guessing**: Users can make a guess (UP or DOWN) for any price snapshot
4. **Automatic Resolution**: When a new price arrives, the system:
   - Finds all unresolved guesses
   - Compares the new price with the snapshot price
   - Determines if each guess was correct
   - Updates user scores (+1 correct, -1 incorrect)
   - Marks guesses as resolved

## Testing

```bash
# Unit tests
npm run test
```

## Building for Production

```bash
# Build the application
npm run build

# Run the built application
npm run start:prod
```

## Deployment

For production deployment to AWS App Runner.

## Environment Variables

| Variable                         | Description                    | Default           |
| -------------------------------- | ------------------------------ | ----------------- |
| `AWS_REGION`                     | AWS region for DynamoDB        | `eu-central-1`    |
| `DYNAMODB_ENDPOINT`              | DynamoDB endpoint (local only) | -                 |
| `DYNAMODB_USERS_TABLE`           | Users table name               | `users`           |
| `DYNAMODB_PRICE_SNAPSHOTS_TABLE` | Price snapshots table name     | `price-snapshots` |
| `DYNAMODB_GUESSES_TABLE`         | Guesses table name             | `guesses`         |
| `JWT_SECRET`                     | Secret key for JWT signing     | Required          |
| `JWT_EXPIRES_IN`                 | JWT expiration time            | `7d`              |
| `CORS_ORIGIN`                    | Allowed CORS origin            | `*`               |
| `PORT`                           | Server port                    | `3000`            |

## Project Structure

```
btc-guess-backend/
├── src/
│   ├── auth/                    # Authentication module
│   │   ├── auth.controller.ts   # Login/register endpoints
│   │   ├── auth.service.ts      # Auth business logic
│   │   ├── jwt.strategy.ts      # JWT passport strategy
│   │   └── jwt-auth.guard.ts    # JWT guard
│   ├── users/                   # User management
│   │   ├── users.service.ts     # User CRUD & scoring
│   │   ├── users.controller.ts  # User endpoints
│   │   └── entities/user.entity.ts
│   ├── price-snapshots/         # Bitcoin price tracking
│   │   ├── price-snapshots.service.ts
│   │   ├── bitcoin-price-fetcher.service.ts  # Cron job
│   │   └── entities/price-snapshot.entity.ts
│   ├── guesses/                 # Guess system
│   │   ├── guesses.service.ts   # Guess CRUD & resolution
│   │   ├── guesses.controller.ts
│   │   └── entities/
│   │       ├── guess.entity.ts
│   │       └── guess-direction.enum.ts
│   ├── database/                # DynamoDB wrapper
│   │   └── database.service.ts
│   ├── config/                  # Configuration
│   │   └── dynamodb.config.ts
│   ├── app.module.ts            # Root module
│   └── main.ts                  # Application entry
├── scripts/
│   ├── create-dynamodb-tables.ts        # Local table creation
│   ├── create-dynamodb-tables-aws.sh    # AWS table creation
│   ├── create-iam-role.sh               # IAM role setup
│   └── test-deployment.sh               # Deployment testing
├── Dockerfile                   # Docker configuration
├── DEPLOYMENT.md               # Deployment guide
└── README.md                   # This file
```
