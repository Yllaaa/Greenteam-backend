# Green Team Backend

## Description

## Requirements

* NodeJs
* PostgreSQL
* Docker

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

# Good SMTP
SMTP_EMAIL=
SMTP_PASSWORD=

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

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

* Run drizzle push

```bash
npx drizzle-kit push
```

* Install Redis

-On Linux

```bash
sudo apt install redis-server
sudo service redis-server start
```

-On Windows

```bash
docker pull redis
docker run --name redis -d -p 6379:6379 redis
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
