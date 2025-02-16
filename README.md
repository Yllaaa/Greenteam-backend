# Green Team Backend

## Description

## Installation

```bash
npm install
```

## Environment Setup

* Create .env file

```bash
# Database configuration
DATABASE_URL=postgres://username:password@localhost:5432/green-team

# Server configuration
PORT=3000

# JWT Authentication
JWT_SECRET=your_jwt_secret

# Google Cloud Storage
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Public New
PUBLIC_NEWS_API_KEY=

# Bloger
BLOGGER_API_KEY=

# News Expire
NEWS_DELETE_AFTER_DAYS=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Subscriptions
SUBSCRIPTION_PRICE_Volunteer=
```

* Run drizzle push

```bash
npx drizzle-kit push
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
