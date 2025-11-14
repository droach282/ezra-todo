# Ezra Todo Application

A full-stack todo management application demonstrating modern development practices with a .NET backend and React frontend.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Features](#features)
- [Project Structure](#project-structure)
- [Backend API](#backend-api)
  - [API Endpoints](#api-endpoints)
  - [Backend Architecture](#backend-architecture)
  - [Database](#database)
  - [Backend Development](#backend-development)
- [Frontend Application](#frontend-application)
  - [Frontend Architecture](#frontend-architecture)
  - [Frontend Development](#frontend-development)
- [Testing](#testing)
  - [Backend Tests](#backend-tests)
  - [Frontend Tests](#frontend-tests)
- [Technology Stack](#technology-stack)
- [License](#license)

## Overview

This project implements a complete todo management system with:
- **Backend**: RESTful API built with .NET 10 and ASP.NET Core Minimal APIs
- **Frontend**: Modern React 19 application with TypeScript and TanStack libraries
- **Architecture**: Clean architecture on the backend, component-based architecture on the frontend
- **Testing**: Comprehensive unit tests for both frontend and backend
- **Database**: SQLite with Entity Framework Core
- **Real-time Updates**: Optimistic UI updates with TanStack Query

## Quick Start

### Prerequisites

- .NET 10 SDK or later
- Node.js 18 or later
- A code editor (Visual Studio, Visual Studio Code, or Rider)

### Running the Full Stack

**1. Start the Backend:**

```bash
cd Todo.Backend/Todo.Backend.Api
dotnet run
```

The API will be available at:
- HTTPS: `https://localhost:7195`
- HTTP: `http://localhost:5186`

**2. Start the Frontend (in a new terminal):**

```bash
cd todo-frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Features

**Todo Management:**
- Create, read, update, and delete todos
- Toggle todo completion status
- Edit todo descriptions inline
- Filter between all todos and incomplete todos
- Input validation with detailed error messages

**User Experience:**
- Clean, intuitive UI with responsive design
- Real-time UI updates with optimistic mutations
- Delete confirmation modal for safety
- Loading states and error handling

**Developer Experience:**
- Type-safe API integration with TypeScript and Zod
- Comprehensive unit testing (105 total tests)
- OpenAPI/Swagger documentation (development mode)
- CORS support for frontend integration
- Hot module replacement in development

## Project Structure

```
ezra-todo/
├── Todo.Backend/                       # .NET Backend
│   ├── Todo.Backend.Api/              # API layer with endpoints
│   ├── Todo.Backend.Services/         # Business logic
│   ├── Todo.Backend.Data/             # Data access with EF Core
│   ├── Todo.Backend.Models/           # Domain models
│   ├── Todo.Backend.Abstractions/     # Interfaces
│   ├── Todo.Backend.Models.Tests/     # xUnit tests (domain)
│   ├── Todo.Backend.Services.Tests/   # xUnit tests (service)
│   └── Todo.Backend.Api.Tests/        # xUnit tests (API validation)
│
└── todo-frontend/                      # React Frontend
    ├── src/
    │   ├── components/                # React components
    │   │   └── todo/                 # Todo-specific components
    │   ├── routes/                   # TanStack Router routes
    │   ├── services/                 # API client functions
    │   ├── hooks/                    # Custom React hooks
    │   ├── models/                   # TypeScript types
    │   ├── config/                   # Configuration
    │   ├── test/                     # Test utilities
    │   └── integrations/             # Third-party integrations
    ├── vite.config.ts               # Vite configuration
    └── package.json                 # Dependencies
```

---

## Backend API

The backend is built with .NET 10 and ASP.NET Core Minimal APIs, demonstrating clean architecture principles and modern C# development practices.

### API Endpoints

All endpoints are prefixed with `/todos`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/todos` | Get all todos |
| GET | `/todos/incomplete` | Get incomplete todos only |
| GET | `/todos/{id}` | Get a specific todo by ID |
| POST | `/todos` | Create a new todo |
| PATCH | `/todos/{id}` | Update todo (description and/or completion status) |
| DELETE | `/todos/{id}` | Delete a todo |

#### PATCH Request Body

The PATCH endpoint accepts partial updates with optional fields:

```json
{
  "description": "Updated description",  // optional
  "isCompleted": true                    // optional
}
```

You can update just the description, just the completion status, or both in a single request.

### Backend Architecture

The backend follows clean architecture principles with clear layer separation:

#### Layers

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

#### Key Design Decisions

- **Immutable Domain Models**: The `Todo` class uses private setters and factory methods to ensure data integrity
- **Repository Pattern**: Abstracts data access and enables easier testing
- **Dependency Injection**: All dependencies are injected, promoting loose coupling
- **Global Exception Handling**: Centralized error handling with RFC 7807 Problem Details
- **Validation**: Multi-layered validation at both the API (DataAnnotations) and domain level

#### Tradeoffs

**API Design**: The API uses a single PATCH endpoint for updates, supporting partial updates for both description and completion status. This provides flexibility while maintaining RESTful principles, allowing clients to update just what they need in a single request.

**Domain Model**: The domain uses imperative methods (`Complete()`, `ResetCompletion()`, `UpdateDescription()`) rather than simple property setters. This maintains encapsulation and ensures all state changes go through controlled pathways. These methods are designed to be idempotent - calling `Complete()` on an already-completed todo won't throw an exception, it simply ensures the todo is completed and updates the timestamp. This design choice simplifies client code (no need to check state before toggling), aligns with REST idempotency principles, and makes operations safe to retry. The tradeoff is losing explicit error feedback when attempting redundant operations, but we gain simpler, more robust implementations. All modification methods update `LastModified`, providing a clear audit trail.

**Service Layer Coordination**: The service layer translates between the API's data-oriented PATCH requests and the domain's behavior-oriented methods. This allows the domain to maintain its business logic and validation (e.g., description length constraints) while the API provides a clean, flexible interface. The tradeoff is additional coordination logic in the service layer to bridge these two approaches.

### Database

The application uses SQLite with Entity Framework Core. The database file is stored at:
```
%LocalAppData%/EzraTodo.db
```

Migrations are applied automatically on application startup.

### Backend Development

#### Adding New Migrations

```bash
cd Todo.Backend/Todo.Backend.Data
dotnet ef migrations add <MigrationName> --startup-project ../Todo.Backend.Api
```

#### Exploring the API

In development mode, OpenAPI documentation is available at:
```
https://localhost:7195/openapi/v1.json
```

---

## Frontend Application

The frontend is a modern React 19 application built with TypeScript, demonstrating modern frontend architecture with TanStack libraries and Tailwind CSS.

### Frontend Architecture

#### State Management

The application uses TanStack Query for server state management, providing:
- Automatic caching and background refetching
- Optimistic updates for immediate UI feedback
- Automatic error handling and retry logic

#### Routing

TanStack Router provides:
- File-based routing with automatic route generation
- Type-safe navigation and parameters
- Code splitting for optimal performance
- Integrated with TanStack Query for data loading

#### API Integration

The frontend connects to the backend API at `http://localhost:5186/todos` (configurable in `src/config/api.ts`). All API calls are type-safe using TypeScript and Zod validation.

#### Component Architecture

Components follow a clear separation of concerns:
- **Presentational Components**: Handle UI rendering and user interactions
- **Container Components**: Manage data fetching and business logic
- **Hooks**: Encapsulate reusable logic for mutations and queries
- **Services**: Handle API communication

### Frontend Development

#### Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm test` - Run tests with Vitest
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run check` - Format and fix linting issues

---

## Testing

The application includes comprehensive unit tests for both backend and frontend components.

### Backend Tests

**Framework**: xUnit with Moq

**Coverage**: 34 tests across domain, service, and API layers

**Locations**:
- `Todo.Backend/Todo.Backend.Models.Tests/` (8 tests)
- `Todo.Backend/Todo.Backend.Services.Tests/` (18 tests)
- `Todo.Backend/Todo.Backend.Api.Tests/` (8 tests)

**Running Tests**:
```bash
# Run all backend tests
cd Todo.Backend
dotnet test

# Or run individual test projects
cd Todo.Backend/Todo.Backend.Models.Tests
dotnet test
```

**Test Coverage**:

**Domain Model Tests** (8 tests):
- Domain model validation (description length, empty values)
- State transition methods (Complete, ResetCompletion, UpdateDescription)
- Idempotent behavior verification
- Timestamp updates on modifications

**Service Layer Tests** (18 tests):
- CreateTodoAsync: Repository interaction, ID assignment, timestamp handling, validation
- GetTodoAsync: Repository delegation, data retrieval
- GetAllTodosAsync: Batch retrieval, empty state handling
- UpdateTodoAsync: Partial updates, completion toggling, timestamp updates, validation
- DeleteTodoAsync: Repository delegation, completion verification

**API Validation Tests** (8 tests):
- NotWhitespaceAttribute: Custom validation attribute testing
- Valid strings, empty strings, whitespace-only strings, null handling
- Edge cases: tabs, newlines, mixed whitespace, leading/trailing whitespace
- Non-string value handling

### Frontend Tests

**Framework**: Vitest with React Testing Library

**Coverage**: 71 tests across components and hooks

**Location**: Co-located with source files in `todo-frontend/src/`

#### Test Infrastructure

- **Vitest** - Fast, Vite-native test runner with jsdom environment
- **React Testing Library** - User-centric component testing
- **@testing-library/user-event** - Realistic user interaction simulation
- **@testing-library/jest-dom** - Custom matchers for DOM assertions

#### Test Coverage

**Components** (58 tests):
- `addTodo.test.tsx` (14 tests) - Form submission, validation, error handling, loading states
- `todoItem.test.tsx` (24 tests) - Rendering, editing, deletion, completion toggling, loading states
- `todoList.test.tsx` (20 tests) - Data loading, filtering, error states, empty list handling

**Hooks** (13 tests):
- `useTodoMutations.test.tsx` (13 tests) - Create, update, and delete mutations with error handling

#### Test Utilities

Custom test utilities are provided in `src/test/`:
- `test-utils.tsx` - `renderWithQueryClient()` function to wrap components with QueryClientProvider
- `setup.ts` - Global test configuration with jest-dom matchers and automatic cleanup

#### Running Frontend Tests

```bash
cd todo-frontend

# Run all tests
npm test

# Run tests in watch mode
npx vitest

# Run tests with coverage
npx vitest --coverage
```

#### Testing Patterns

Tests follow these patterns:
- **Co-located tests** - Test files live next to their source files for easy discovery
- **Mocked dependencies** - API calls and child components are mocked for isolation
- **User-centric queries** - Tests use accessible queries (getByRole, getByText) over implementation details
- **Async handling** - Proper use of `waitFor()` and `act()` for async state updates
- **Error suppression** - Expected errors are suppressed with `vi.spyOn(console, 'error')` to keep output clean

---

## Technology Stack

### Backend

- **.NET 10** - Latest .NET platform
- **ASP.NET Core Minimal APIs** - Lightweight, high-performance endpoints
- **Entity Framework Core 10** - Modern ORM with migrations
- **SQLite** - Embedded database
- **xUnit** - Unit testing framework

### Frontend

- **React 19** - Latest React with modern features
- **TypeScript 5.7** - Type safety and enhanced developer experience
- **Vite 7** - Fast build tool and development server
- **TanStack Router** - Type-safe routing with file-based routes
- **TanStack Query** - Powerful data fetching and caching with optimistic updates
- **TanStack Form** - Type-safe form handling with validation
- **Tailwind CSS 4** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **Zod 4** - Schema validation and type inference
- **Lucide React** - Modern icon library
- **Vitest** - Fast unit testing framework
- **React Testing Library** - User-centric component testing
- **@testing-library/user-event** - Realistic user interaction simulation
- **@testing-library/jest-dom** - DOM matcher assertions

---

## License

This project is part of a take-home assessment.
