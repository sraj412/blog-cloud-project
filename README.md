# Blog Cloud Project

A minimal full-stack blogging application designed for learning Docker, CI/CD, and AWS deployment. The application features a clean architecture with environment configuration and scalability readiness.

## Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, JWT auth, bcrypt, class-validator, Swagger
- **Frontend**: React (Vite), Axios, React Router

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm

## Project Structure

```
blog-cloud-project/
├── backend/          # NestJS API
├── frontend/         # React (Vite) app
└── README.md
```

## Database Setup

Create a PostgreSQL database and user:

```sql
CREATE USER bloguser WITH PASSWORD 'blogpass';
CREATE DATABASE blogdb OWNER bloguser;
GRANT ALL PRIVILEGES ON DATABASE blogdb TO bloguser;
```

## Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):

   ```bash
   cp .env.example .env
   ```

4. Ensure the `.env` contains:

   ```
   PORT=8500
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=bloguser
   DB_PASSWORD=blogpass
   DB_NAME=blogdb
   JWT_SECRET=supersecret
   JWT_EXPIRES_IN=1d
   ```

5. Start the backend in development mode:

   ```bash
   npm run start:dev
   ```

   The API will run at http://localhost:8500

   Swagger documentation: http://localhost:8500/api/docs

## Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file if the API URL differs:

   ```
   VITE_API_URL=http://localhost:8500
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The app will run at http://localhost:5173 (or the next available port)

## API Endpoints

### Auth

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login

### Posts

- `GET /posts` - List published posts
- `GET /posts/:id` - Get a published post by ID
- `GET /posts/my` - Get current user's posts (authenticated)
- `GET /posts/my/:id` - Get own post for editing (authenticated)
- `POST /posts` - Create a post (authenticated)
- `PATCH /posts/:id` - Update a post (authenticated)
- `PATCH /posts/:id/publish` - Publish a post (authenticated)
- `DELETE /posts/:id` - Delete a post (authenticated)

### Health

- `GET /health` - Health check

## Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Posts**: Create drafts, publish, edit, and delete posts
- **Authorization**: Users can only edit/delete their own posts
- **API Documentation**: Swagger UI at `/api/docs`

## Next Steps (Docker & AWS)

This application is structured to be easily Dockerized and deployed to AWS. Future steps include:

- Docker containers for backend and frontend
- Docker Compose for local development
- CI/CD pipeline (e.g., GitHub Actions)
- AWS deployment (ECS, RDS, S3, etc.)
