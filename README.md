# teacher-reading-assignment-portal
A web portal for teachers and students to use to assign reading and track assignment status

Public Link - https://teacher-reading-assignment-portal-1.onrender.com
(Please click the backend link as well to start up service. 
https://teacher-reading-assignment-portal.onrender.com/)

## Setup Instructions

### Prerequisites
- Docker Desktop

### Demo accounts
Login at: http://localhost:5173/login

- Teacher: `teacher` / `teacher123`
- Student 1: `student1` / `student123`
- Student 2: `student2` / `student123`

### Run (Docker)
From the repo root:

```powershell
docker compose up --build
```

Open:
- App: http://localhost:5173
- Login page: http://localhost:5173/login

Notes:
- You do NOT need Java or Node installed locally (the Docker images include runtimes).
- The backend uses an H2 database stored in a Docker volume, so data persists across restarts.
- Optional DB viewer (H2 Console): http://localhost:5173/h2-console

### Stop
```powershell
docker compose down
```

To also delete the persisted database volume:
```powershell
docker compose down -v
```

### Troubleshooting
- If you see “orphan containers”, re-run with `docker compose up --build --remove-orphans`.
- If the app doesn’t open, make sure nothing else is using port `5173`.

## Current Implemenetation
- Java 21, Spring Boot + Spring Security, React.js, H2 Database, Docker

## Architectural Decisions/Tradeoffs
- Tech stack:
    - Languages: React.js/Java Spring Boot vs. Next.js full stack
        - Went with React.js/Java Spring Boot because if we need to make more features and it becomes an actual project, we don't need to rewrite the backend code, java spring boot is more scalable, more realistic production type architecture
        - Considered next.js full stack as it's slightly faster to make a prototype as both front end and backend code lives in same app
    - Database: H2 vs Postgres vs MongoDB vs SQLite
        - H2, lightweight, no docker setup needed, file based persistance
    - Public deployment: Render




## Future Improvements
- UI:
    - Using things like shadcn, 21st.dev. I did not use it and I noticed that AI development was significantly worse at making modern designs when not using a UI library dependency. I'd also refactor the code so it's manageable with reusable components and better architecture.
- Business:
    - I would personally think that a reading assignment portal is a feature within a school management portal such as Edline or Blackboard. The home page for students would be for more "urgent" notifications like upcoming assignments, upcoming tests, alerts if you forgot to update assignment progress on the student portal. On the teacher home portal I would add alerts like if specific students haven't updated their status in a while, upcoming assignments, todo's for creating assignments, etc.
- Backend:
    If this progresses, change the DB to postgres, use cloud services such as AWS. Refactor services into proper spring boot layered architecture.