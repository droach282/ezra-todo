# Ezra Todo Application

A full-stack todo management application with a .NET backend and React frontend.

## Quick Start

### Prerequisites

- .NET 10 SDK or later
- Node.js 18 or later

### Running the Application

**1. Start the Backend:**

```bash
cd Todo.Backend/Todo.Backend.Api
dotnet run
```

The API will be available at `http://localhost:5186` (HTTPS: `https://localhost:7195`)

**2. Start the Frontend (in a new terminal):**

```bash
cd todo-frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

### Running Tests

```bash
# Backend tests (34 tests: domain, service, API validation)
cd Todo.Backend
dotnet test

# Frontend tests (71 tests: components, hooks)
cd todo-frontend
npm test
```

## API Endpoints

All endpoints are prefixed with `/todos`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/todos` | Get all todos |
| GET | `/todos/incomplete` | Get incomplete todos only |
| GET | `/todos/{id}` | Get a specific todo by ID |
| POST | `/todos` | Create a new todo |
| PATCH | `/todos/{id}` | Update todo (description and/or completion status) |
| DELETE | `/todos/{id}` | Delete a todo |

## Assumptions

1. **Single User**: No authentication or authorization - designed for single-user local use
2. **Description Length**: Todo descriptions are limited to 80 characters
3. **Database**: SQLite database stored at `%LocalAppData%/EzraTodo.db`, migrations auto-apply on startup
4. **CORS**: Backend configured for `http://localhost:3000` frontend access
5. **Validation**: Multi-layered validation at both API (DataAnnotations) and domain level ensures data integrity

## Architecture & Tradeoffs

### Backend

**Clean Architecture**: API Layer → Service Layer → Data Layer (Repository) → Domain Layer

**API Design**: The API uses a single PATCH endpoint for updates, supporting partial updates for both description and completion status. This provides flexibility while maintaining RESTful principles, allowing clients to update just what they need in a single request.

**Domain Model**: The domain uses imperative methods (`Complete()`, `ResetCompletion()`, `UpdateDescription()`) rather than simple property setters. This maintains encapsulation and ensures all state changes go through controlled pathways. These methods are designed to be idempotent - calling `Complete()` on an already-completed todo won't throw an exception, it simply ensures the todo is completed and updates the timestamp. This design choice simplifies client code (no need to check state before toggling), aligns with REST idempotency principles, and makes operations safe to retry. The tradeoff is losing explicit error feedback when attempting redundant operations, but we gain simpler, more robust implementations. All modification methods update `LastModified`, providing a clear audit trail.

**Service Layer Coordination**: The service layer translates between the API's data-oriented PATCH requests and the domain's behavior-oriented methods. This allows the domain to maintain its business logic and validation (e.g., description length constraints) while the API provides a clean, flexible interface. The tradeoff is additional coordination logic in the service layer to bridge these two approaches.

### Frontend

**Component Architecture**: Presentational components (UI) → Container components (data/logic) → Custom hooks (mutations/queries) → Services (API)

**State Management**: TanStack Query handles server state with automatic caching, background refetching, and optimistic updates for immediate UI feedback.

## Technology Stack

**Backend:** .NET 10, ASP.NET Core Minimal APIs, Entity Framework Core, SQLite, xUnit, Moq

**Frontend:** React 19, TypeScript 5.7, Vite 7, TanStack Router/Query, Tailwind CSS 4, Vitest

## Next Steps

This current implementation is very basic - it wouldn't do well for more than a single user in an isolated environment.  What I'd like to do next (if I were to continue building this out) would be to create the concept of a user, then implement authorization and authentication.  I'd like to be able to tie the todos to the user that created them and only show todos owned by the currently logged in user.

I'd then move away from SQLite to a managed database of some kind that could be scaled by a cloud provider based on demand.  Immediately after that, I'd work to containerize both the React and .NET applications so that they could be deployed to a kubernetes cluster (or managed kubernetes service).  This would allow the application to scale horizontally with relative ease.

## License

This project is part of a take-home assessment.
