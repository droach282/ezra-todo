# Ezra Todo API

A RESTful Todo API built with .NET 10 and ASP.NET Core Minimal APIs, demonstrating clean architecture principles and modern C# development practices.

## Overview

This project implements a complete Todo management system with a focus on:
- Clean Architecture with clear separation of concerns
- Domain-Driven Design with rich domain models
- Entity Framework Core with SQLite for data persistence
- Minimal APIs for lightweight, high-performance endpoints
- Comprehensive error handling and validation
- Unit testing

## Project Structure

```
Todo.Backend/
├── Todo.Backend.Api/              # API layer with endpoints and middleware
├── Todo.Backend.Services/         # Business logic and orchestration
├── Todo.Backend.Data/             # Data access with EF Core and repositories
├── Todo.Backend.Models/           # Domain models with business rules
├── Todo.Backend.Abstractions/     # Interfaces and contracts
└── Todo.Backend.Models.Tests/     # Unit tests
```

## Features

- Create, read, update, and delete todos
- Partial updates with PATCH (update description and/or completion status)
- Filter incomplete todos
- Input validation with detailed error messages
- Automatic database migrations
- OpenAPI/Swagger documentation (in development mode)
- CORS support for frontend integration

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

### PATCH Request Body

The PATCH endpoint accepts partial updates with optional fields:

```json
{
  "description": "Updated description",  // optional
  "isCompleted": true                    // optional
}
```

You can update just the description, just the completion status, or both in a single request.

## Getting Started

### Prerequisites

- .NET 10 SDK or later
- A code editor (Visual Studio, Visual Studio Code, or Rider)

### Running the Application

1. Navigate to the API project:
```bash
cd Todo.Backend/Todo.Backend.Api
```

2. Run the application:
```bash
dotnet run
```

The API will start and be available at:
- HTTPS: `https://localhost:7195`
- HTTP: `http://localhost:5186`

### Running Tests

```bash
cd Todo.Backend/Todo.Backend.Models.Tests
dotnet test
```

## Architecture

### Layers

1. **API Layer** (`Todo.Backend.Api`)
   - Minimal API endpoints
   - Request/response DTOs
   - Global exception handling
   - Validation middleware

2. **Service Layer** (`Todo.Backend.Services`)
   - Business logic orchestration
   - Coordination between repositories and models

3. **Data Layer** (`Todo.Backend.Data`)
   - Entity Framework Core DbContext
   - Repository pattern implementation
   - Database migrations

4. **Domain Layer** (`Todo.Backend.Models`)
   - Rich domain models with encapsulated business rules
   - Validation logic
   - Domain exceptions

5. **Abstractions** (`Todo.Backend.Abstractions`)
   - Interface definitions
   - Contracts for dependency injection

### Key Design Decisions

- **Immutable Domain Models**: The `Todo` class uses private setters and factory methods to ensure data integrity
- **Repository Pattern**: Abstracts data access and enables easier testing
- **Dependency Injection**: All dependencies are injected, promoting loose coupling
- **Global Exception Handling**: Centralized error handling with RFC 7807 Problem Details
- **Validation**: Multi-layered validation at both the API (DataAnnotations) and domain level

### Tradeoffs

The API uses a single PATCH endpoint for updates, supporting partial updates for both description and completion status. This provides flexibility while maintaining RESTful principles. The domain model uses imperative methods (`Complete()`, `ResetCompletion()`, `UpdateDescription()`) which maintain encapsulation and control over state transitions, while the service layer translates the PATCH request into appropriate domain operations.

This approach allows the domain model to maintain its business logic and validation (e.g., description length constraints) while providing a clean, flexible API for clients. The tradeoff is that the service layer needs to coordinate between the API's data-oriented approach and the domain's behavior-oriented design.

## Database

The application uses SQLite with Entity Framework Core. The database file is stored at:
```
%LocalAppData%/EzraTodo.db
```

Migrations are applied automatically on application startup.

## Development

### Adding New Migrations

```bash
cd Todo.Backend/Todo.Backend.Data
dotnet ef migrations add <MigrationName> --startup-project ../Todo.Backend.Api
```

### Exploring the API

In development mode, OpenAPI documentation is available at:
```
https://localhost:7195/openapi/v1.json
```

## Technologies Used

- .NET 10
- ASP.NET Core Minimal APIs
- Entity Framework Core 10
- SQLite
- xUnit (for testing)

## License

This project is part of a take-home assessment.
