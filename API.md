Interactive Lessons REST API Specification

Comprehensive documentation for the Interactive Lessons REST API built with Node.js, Express, and PostgreSQL (Sequelize ORM).

---

## Overview

- Base URL: http://localhost:3000
- Protocol: HTTP/1.1
- Format: JSON (Content-Type: application/json)
- Authentication: Stateless JWT via HTTP Authorization Header (Bearer)

---

## Security & Architecture

### Role-Based Access Control (RBAC)
The API enforces user permission tiers:
- user: Default role. Can view public endpoints, access personal profile (GET /auth/me), and create new lessons (POST /lessons).
- admin: Full system privileges, including deleting lessons (DELETE /lessons/:id).

---

## API Endpoints

### 1. Authentication Domain (/auth)

- POST /auth/register
  - Access: Public
  - Description: Registers a new user account.

- POST /auth/login
  - Access: Public
  - Description: Authenticates user credentials and issues a JWT access token.

- GET /auth/me
  - Access: Authenticated (user, admin)
  - Description: Retrieves the profile of the currently authenticated user.

---

### 2. Lessons Domain (/lessons)

- GET /lessons
  - Access: Public
  - Query Parameters:
    - search (optional, string): Case-insensitive search string for lesson title.
    - minDuration (optional, integer): Filter lessons with duration greater than or equal to this value in minutes.
  - Description: Retrieves a list of all educational lessons.

- GET /lessons/:id
  - Access: Public
  - Description: Retrieves detailed information about a specific lesson by its ID.

- POST /lessons
  - Access: Authenticated (user, admin)
  - Description: Creates a new interactive lesson. The creator becomes the author.

- PUT /lessons/:id
  - Access: Restricted (Author of the lesson or Admin)
  - Description: Updates an existing lesson by ID.

- DELETE /lessons/:id
  - Access: Restricted (Admin)
  - Description: Removes a lesson from the database.

---

## Data Schemas

### User Entity
- id: INTEGER (Primary Key, Auto-Increment)
- email: STRING (Unique, Required)
- passwordHash: STRING (Required, bcrypt hash)
- role: ENUM ('user', 'admin'), Default: 'user'
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP

### Lesson Entity
- id: INTEGER (Primary Key, Auto-Increment)
- title: STRING (Required)
- slug: STRING (Unique, Required) - Identifier for URLs
- content: TEXT (Required)
- duration: INTEGER (Required, in minutes)
- level: STRING (Required) - e.g., Beginner, Intermediate, Advanced
- authorId: INTEGER (Foreign Key referencing User.id)
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP