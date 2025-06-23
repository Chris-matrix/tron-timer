# Deployment Guide

## Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- PostgreSQL database (local or cloud)

## Environment Setup

1. Copy the environment variables:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration.

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Start the backend server:

   ```bash
   npm run serve
   ```

## Production Build

1. Build the application:

   ```bash
   npm run build
   ```

2. Start the production server:

   ```bash
   npm run prod
   ```

## Deployment to Heroku

1. Create a new Heroku app:

   ```bash
   heroku create your-app-name
   ```

2. Add PostgreSQL add-on:

   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. Set environment variables on Heroku:

   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set NEXTAUTH_SECRET=your-secret-here
   heroku config:set NEXTAUTH_URL=https://your-app-name.herokuapp.com
   ```

4. Deploy to Heroku:

   ```bash
   git push heroku main
   ```

5. Run database migrations:

   ```bash
   heroku run npx prisma migrate deploy
   ```

## Environment Variables

| Variable        | Description                     | Required | Default         |
|----------------|---------------------------------|----------|----------------|
| PORT           | Port to run the server on       | No       | 3000           |
| NODE_ENV       | Node environment               | No       | development    |
| DATABASE_URL   | PostgreSQL connection URL       | Yes      | -              |
| NEXTAUTH_SECRET| Secret for NextAuth.js         | Yes      | -              |
| NEXTAUTH_URL   | Base URL of your application   | Yes      | <http://localhost:3000> |

## Troubleshooting

- If you get a "Port already in use" error, make sure no other process is using the port or change the `PORT` in your `.env` file.
- If you encounter database connection issues, verify your `DATABASE_URL` in the `.env` file.
- For production deployments, ensure all environment variables are set in your hosting environment.
