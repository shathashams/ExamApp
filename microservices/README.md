# Microservices Demo

This directory contains a simple Docker-based microservices architecture demonstration, added as an isolated milestone for the ExamApp project. It demonstrates service-to-service communication within an isolated Docker network.

## Architecture

```
Browser (Host Machine)
   │
   ▼ (Port 3000)
┌─────────────────────────────────┐
│     Node.js Gateway Service     │ (Exposed to Host)
└─────────────────────────────────┘
   │
   ▼ (Internal Docker Network, Port 4000)
┌─────────────────────────────────┐
│      Analytics Microservice     │ (Private to Network)
└─────────────────────────────────┘
```

1. **Gateway Service (`gateway/`)**:
   - Built with Express.js.
   - Runs on port `3000` (mapped to host port `3000`).
   - Acts as the public entry point.
   - Fetches and merges stats from the internal `analytics-service`.

2. **Analytics Service (`analytics-service/`)**:
   - Built with Express.js.
   - Runs internally on port `4000` (not exposed to the host).
   - Serves stats to the gateway service over the internal network using Docker's service name routing (`http://analytics-service:4000/stats`).

---

## How to Run

1. Open a terminal and navigate to the `microservices` folder:
   ```bash
   cd microservices
   ```

2. Build and start the containers using Docker Compose:
   ```bash
   docker compose up --build
   ```

---

## How to Access

- **Public Gateway Status / Main Response:**
  Open your web browser and navigate to:
  [http://localhost:3000](http://localhost:3000)

  You will see a combined JSON payload displaying the status of both services:
  ```json
  {
    "service": "nodejs-gateway",
    "status": "running",
    "message": "Gateway is working",
    "analytics": {
      "service": "analytics-service",
      "status": "running",
      "totalExams": 5,
      "totalStudents": 7
    }
  }
  ```

- **Gateway Health Check:**
  [http://localhost:3000/health](http://localhost:3000/health)

- **Gateway Analytics Direct Query:**
  [http://localhost:3000/analytics](http://localhost:3000/analytics)

- **Internal Service (Security Check):**
  Attempting to load [http://localhost:4000/stats](http://localhost:4000/stats) directly in your browser will **fail**, verifying that the Analytics Service is safely hidden within the Docker network.

---

## How to Stop

To stop the containers and clean up the network resources, run:
```bash
docker compose down
```
