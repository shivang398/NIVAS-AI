# NIVAS-AI

Real Estate Platform

## Architecture

NIVAS-AI is structured as a monorepo with separate `frontend` and `backend` services.

## Prerequisites

- Node.js (v25.2.1 as per engine specifications)
- Redis (for Socket.io adapter and caching)
- SQL Database (for Prisma ORM)

## Key Dependencies

### Backend

The backend is built with Express.js and uses the following major packages:
- **Core Framework & Middleware:** `express`, `cors`, `helmet`, `morgan`, `express-rate-limit`
- **Database & ORM:** `prisma`, `@prisma/client`
- **Authentication & Security:** `bcrypt`, `bcryptjs`, `jsonwebtoken`
- **Real-time Communication:** `socket.io`, `@socket.io/redis-adapter`, `ioredis`
- **AI & File Processing:** `groq-sdk`, `tesseract.js`, `multer`
- **Validation & Logging:** `zod`, `winston`
- **Testing:** `vitest`, `supertest`

### Frontend

The frontend is a modern React application built with Vite:
- **Core Framework & Routing:** `react`, `react-dom`, `react-router-dom`
- **Mapping & UI Components:** `leaflet`, `react-leaflet`, `lucide-react`
- **HTTP Client:** `axios`
- **Build Tool:** `vite`

## Getting Started

### 1. Install Dependencies

You can install dependencies for both the frontend and backend concurrently from the root directory:

```bash
npm run install-all
```

### 2. Environment Setup

Ensure you configure your `.env` variables in both the `frontend/` and `backend/` directories. This includes setting up your database URL, Redis connection string, JWT secrets, and Groq SDK API keys.

### 3. Running the Application

To start both the frontend and backend development servers concurrently:

```bash
npm run dev
```

Alternatively, you can run them individually:
- **Backend:** `npm run dev-backend`
- **Frontend:** `npm run dev-frontend`

### 4. Build for Production

To build the frontend for production, run:

```bash
npm run build
```

## Deployment

The project is containerized and designed for deployment on Kubernetes. The CI/CD pipeline is configured via GitHub Actions.

### Deployment Dependencies
- **Containerization:** Docker (`Dockerfile` in both frontend and backend)
- **Orchestration:** Kubernetes (manifests located in `k8s/`)
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)
- **PaaS Option:** Render (configured via `render.yaml`)

### Steps to Deploy to Kubernetes
1. Ensure your cluster is running and your `kubectl` is configured.
2. In your GitHub repository settings, add the following Secrets:
   - `DOCKER_USERNAME`: Your DockerHub username
   - `DOCKER_PASSWORD`: Your DockerHub password or access token
   - `KUBECONFIG`: The contents of your cluster's kubeconfig file
3. Push to the `main` branch to trigger the CI/CD pipeline. It will build the Docker images, push them to Docker Hub, and apply the Kubernetes manifests.