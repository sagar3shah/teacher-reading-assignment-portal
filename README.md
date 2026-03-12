# teacher-reading-assignment-portal
A web portal for teachers and students to use to assign reading and track assignment status

## Setup Instructions

### Prerequisites
- Java 21 (JDK)
- Node.js 20.19+ or 22.12+ (this repo was developed with Node 24.x)

### Run locally
Open two terminals from the repo root.

**Terminal 1 — Backend (Spring Boot)**
```powershell
cd backend
./mvnw spring-boot:run
```
Backend runs at: http://localhost:8080

**Terminal 2 — Frontend (React + Vite)**
```powershell
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

### Quick sanity check
- Backend health endpoint: http://localhost:8080/api/health
- The frontend calls the backend via a Vite dev proxy (`/api/*` -> `http://localhost:8080`).

## Current Implemenetation

## Architectural Decisions/Tradeoffs
- Tech stack:
    - Languages: React.js/Java Spring Boot vs. Next.js full stack
        - Went with React.js/Java Spring Boot because if we need to make more features and it becomes an actual project, we don't need to rewrite the backend code, java spring boot is more scalable, more realistic production type architecture
        - Considered next.js full stack as it's slightly faster to make a prototype as both front end and backend code lives in same app
    - Database: H2 vs Postgres vs MongoDB vs SQLite
        - 



## Future Improvements