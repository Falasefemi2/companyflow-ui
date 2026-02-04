<!-- @format -->

# API Specification

## Overview

- **Base URL**: `http://localhost:8080/`
- **Authentication**: JWT Bearer Token
- **Version**: 1.0
- **Date**: 2024-07-30

## Data Models

### Company

| Field               | Type      | Description                       |
| ------------------- | --------- | --------------------------------- |
| id                  | uuid      | Unique identifier                 |
| name                | string    | Company name                      |
| slug                | string    | URL-friendly slug                 |
| industry            | string    | Industry type                     |
| country             | string    | Country of registration           |
| timezone            | string    | Timezone                          |
| currency            | string    | Currency used                     |
| registration_number | string    | Official registration number      |
| tax_id              | string    | Tax identification number         |
| address             | string    | Physical address                  |
| phone               | string    | Contact phone number              |
| logo_url            | string    | URL to company logo               |
| status              | string    | `active`, `suspended`, `inactive` |
| settings            | jsonb     | JSON object for settings          |
| created_at          | timestamp |                                   |
| updated_at          | timestamp |                                   |

### Department

| Field                | Type      | Description                                        |
| -------------------- | --------- | -------------------------------------------------- |
| id                   | uuid      | Unique identifier                                  |
| company_id           | uuid      | Foreign key to `companies` table                   |
| name                 | string    | Department name                                    |
| code                 | string    | Department code                                    |
| description          | text      |                                                    |
| parent_department_id | uuid      | Foreign key to `departments` table for hierarchies |
| cost_center          | string    |                                                    |
| status               | string    | `active`, `inactive`                               |
| created_at           | timestamp |                                                    |
| updated_at           | timestamp |                                                    |

### Designation

| Field         | Type      | Description                        |
| ------------- | --------- | ---------------------------------- |
| id            | uuid      | Unique identifier                  |
| company_id    | uuid      | Foreign key to `companies` table   |
| name          | string    | Designation name                   |
| description   | text      |                                    |
| level_id      | uuid      | Foreign key to `levels` table      |
| department_id | uuid      | Foreign key to `departments` table |
| status        | string    | `active`, `inactive`               |
| created_at    | timestamp |                                    |
| updated_at    | timestamp |                                    |

### Employee

| Field                   | Type      | Description                                                 |
| ----------------------- | --------- | ----------------------------------------------------------- |
| id                      | uuid      | Unique identifier                                           |
| company_id              | uuid      | Foreign key to `companies` table                            |
| email                   | string    | Unique email address                                        |
| password_hash           | string    | Hashed password                                             |
| phone                   | string    |                                                             |
| first_name              | string    |                                                             |
| last_name               | string    |                                                             |
| employee_code           | string    | Internal employee ID                                        |
| department_id           | uuid      | Foreign key to `departments` table                          |
| designation_id          | uuid      | Foreign key to `designations` table                         |
| level_id                | uuid      | Foreign key to `levels` table                               |
| manager_id              | uuid      | Foreign key to `employees` table for reporting lines        |
| role_id                 | uuid      | Foreign key to `roles` table                                |
| status                  | string    | `active`, `inactive`, `on_leave`, `terminated`, `probation` |
| employment_type         | string    | `full_time`, `part_time`, `contract`, `intern`              |
| hire_date               | date      |                                                             |
| termination_date        | date      |                                                             |
| date_of_birth           | date      |                                                             |
| gender                  | string    |                                                             |
| address                 | text      |                                                             |
| emergency_contact_name  | string    |                                                             |
| emergency_contact_phone | string    |                                                             |
| profile_image_url       | string    |                                                             |
| last_login_at           | timestamp |                                                             |
| created_at              | timestamp |                                                             |
| updated_at              | timestamp |                                                             |

### Level

| Field           | Type      | Description                         |
| --------------- | --------- | ----------------------------------- |
| id              | uuid      | Unique identifier                   |
| company_id      | uuid      | Foreign key to `companies` table    |
| name            | string    | Level name                          |
| hierarchy_level | integer   | For ordering levels (e.g., 1, 2, 3) |
| min_salary      | decimal   |                                     |
| max_salary      | decimal   |                                     |
| description     | text      |                                     |
| created_at      | timestamp |                                     |
| updated_at      | timestamp |                                     |

## Authentication

Authentication is handled via JWT (JSON Web Tokens).

1.  Send a `POST` request to `/auth/login` with the user's `email` and `password`.
2.  If the credentials are valid, the API will return a JWT token.
3.  For all subsequent requests to protected endpoints, include the token in the `Authorization` header with the `Bearer` scheme.

**Header Example:**
`Authorization: Bearer <your_jwt_token>`

## Endpoints

### Auth

#### POST /auth/login

- **Description**: Authenticate user and return JWT token.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "error": ""
  }
  ```
- **Status Codes**:
  - `200 OK`: Successful login.
  - `400 Bad Request`: Invalid request body.
  - `401 Unauthorized`: Invalid credentials.
  - `500 Internal Server Error`: Server error.

### Companies

#### GET /companies

- **Description**: Get a paginated list of companies.
- **Query Parameters**:
  - `page` (integer): Page number.
  - `page_size` (integer): Page size.
  - `status` (string): Filter by company status (`active`, `suspended`, `inactive`).
  - `search` (string): Search by name or slug.
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Companies retrieved successfully",
    "data": {
      "page": 1,
      "page_size": 10,
      "total": 1,
      "total_pages": 1,
      "has_prev": false,
      "has_next": false,
      "data": [
        {
          "id": "c7a8b9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
          "name": "Test Company",
          "slug": "test-company",
          ...
        }
      ]
    },
    "error": ""
  }
  ```
- **Status Codes**:
  - `200 OK`: Successful retrieval.
  - `400 Bad Request`: Invalid query parameters.
  - `500 Internal Server Error`: Server error.

#### POST /companies

- **Description**: Create a new company.
- **Request Body**:
  ```json
  {
    "name": "New Company",
    "slug": "new-company",
    "admin": {
      "email": "admin@newcompany.com",
      "password": "password123",
      "first_name": "Admin",
      "last_name": "User"
    }
  }
  ```
- **Response Example (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Company created successfully",
    "data": {
      "id": "d8b9c0e1-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
      "name": "New Company",
      "slug": "new-company",
      ...
    },
    "error": ""
  }
  ```
- **Status Codes**:
  - `201 Created`: Company created successfully.
  - `400 Bad Request`: Invalid request body.
  - `500 Internal Server Error`: Server error.

#### GET /companies/{id}

- **Description**: Retrieve a company by ID.
- **Path Parameters**:
  - `id` (string, required): Company ID.
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Company retrieved successfully",
    "data": {
      "id": "c7a8b9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
      "name": "Test Company",
      ...
    },
    "error": ""
  }
  ```
- **Status Codes**:
  - `200 OK`: Successful retrieval.
  - `404 Not Found`: Company not found.
  - `500 Internal Server Error`: Server error.

#### PUT /companies/{id}

- **Description**: Update a company by ID.
- **Path Parameters**:
  - `id` (string, required): Company ID.
- **Request Body**:
  ```json
  {
    "name": "Updated Company Name"
  }
  ```
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Company updated successfully",
    "data": {
      "id": "c7a8b9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
      "name": "Updated Company Name",
      ...
    },
    "error": ""
  }
  ```
- **Status Codes**:
  - `200 OK`: Successful update.
  - `400 Bad Request`: Invalid request body.
  - `404 Not Found`: Company not found.
  - `500 Internal Server Error`: Server error.

#### DELETE /companies/{id}

- **Description**: Delete a company by ID.
- **Path Parameters**:
  - `id` (string, required): Company ID.
- **Query Parameters**:
  - `hard_delete` (boolean): If `true`, performs a hard delete. Defaults to `false` (soft delete).
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Company deleted successfully",
    "data": null,
    "error": ""
  }
  ```
- **Status Codes**:
  - `200 OK`: Successful deletion.
  - `404 Not Found`: Company not found.
  - `500 Internal Server Error`: Server error.

### Departments

#### GET /companies/{company_id}/departments

- **Description**: Get a paginated list of departments for a company.
- **Authentication**: Required.
- **Path Parameters**:
  - `company_id` (string, required): Company ID.
- **Query Parameters**:
  - `page` (integer): Page number.
  - `page_size` (integer): Page size.
  - `status` (string): Filter by status (`active`, `inactive`).
  - `search` (string): Search by name or code.
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Departments retrieved successfully",
    "data": {
      ...
    },
    "error": ""
  }
  ```
- **Status Codes**:
  - `200 OK`
  - `400 Bad Request`
  - `401 Unauthorized`
  - `500 Internal Server Error`

#### POST /companies/{company_id}/departments

- **Description**: Create a new department.
- **Authentication**: Required.
- **Path Parameters**:
  - `company_id` (string, required): Company ID.
- **Request Body**:
  ```json
  {
    "name": "Engineering",
    "status": "active"
  }
  ```
- **Response Example (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Department created successfully",
    "data": {
      "id": "...",
      "name": "Engineering",
      ...
    },
    "error": ""
  }
  ```
- **Status Codes**:
  - `201 Created`
  - `400 Bad Request`
  - `401 Unauthorized`
  - `500 Internal Server Error`

... (and so on for all other endpoints)

#### GET /departments/{id}

- **Description**: Retrieve a department by ID.
- **Authentication**: Required.
- **Path Parameters**:
  - `id` (string, required): Department ID.
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Department retrieved successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 200, 401, 404, 500

#### PUT /departments/{id}

- **Description**: Update a department.
- **Authentication**: Required.
- **Path Parameters**:
  - `id` (string, required): Department ID.
- **Request Body**:
  ```json
  {
    "name": "Software Engineering",
    "status": "active"
  }
  ```
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Department updated successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 200, 400, 401, 404, 500

#### DELETE /departments/{id}

- **Description**: Delete a department.
- **Authentication**: Required.
- **Path Parameters**:
  - `id` (string, required): Department ID.
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Department deleted successfully"
  }
  ```
- **Status Codes**: 200, 401, 404, 500

### Designations

#### GET /companies/{company_id}/designations

- **Description**: Get a paginated list of designations for a company.
- **Authentication**: Required.
- **Path Parameters**:
  - `company_id` (string, required): Company ID.
- **Query Parameters**:
  - `page`, `page_size`, `status`, `department_id`, `level_id`, `search`
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Designations retrieved successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 200, 400, 401, 500

#### POST /companies/{company_id}/designations

- **Description**: Create a new designation.
- **Authentication**: Required.
- **Path Parameters**:
  - `company_id` (string, required): Company ID.
- **Request Body**:
  ```json
  {
    "name": "Software Engineer",
    "level_id": "...",
    "department_id": "...",
    "status": "active"
  }
  ```
- **Response Example (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Designation created successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 201, 400, 401, 500

#### GET /designations/{id}

- **Description**: Retrieve a designation by ID.
- **Authentication**: Required.
- **Path Parameters**:
  - `id` (string, required): Designation ID.
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Designation retrieved successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 200, 401, 404, 500

#### PUT /designations/{id}

- **Description**: Update a designation.
- **Authentication**: Required.
- **Path Parameters**:
  - `id` (string, required): Designation ID.
- **Request Body**:
  ```json
  {
    "name": "Senior Software Engineer"
  }
  ```
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Designation updated successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 200, 400, 401, 404, 500

#### DELETE /designations/{id}

- **Description**: Delete a designation.
- **Authentication**: Required.
- **Path Parameters**:
  - `id` (string, required): Designation ID.
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Designation deleted successfully"
  }
  ```
- **Status Codes**: 200, 401, 404, 500

### Employees

#### GET /companies/{company_id}/employees

- **Description**: Get a paginated list of employees for a company.
- **Authentication**: Required.
- **Path Parameters**:
  - `company_id` (string, required): Company ID.
- **Query Parameters**:
  - `page`, `page_size`, `status`, `department_id`, `manager_id`, `employment_type`, `search`
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Employees retrieved successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 200, 400, 401, 500

#### POST /companies/{company_id}/employees

- **Description**: Create a new employee.
- **Authentication**: Required.
- **Path Parameters**:
  - `company_id` (string, required): Company ID.
- **Request Body**: (See `dto.CreateEmployeeRequest` for all fields)
- **Response Example (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Employee created successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 201, 400, 401, 500

#### GET /employees/{id}

- **Description**: Retrieve an employee by ID.
- **Authentication**: Required.
- **Path Parameters**:
  - `id` (string, required): Employee ID.
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Employee retrieved successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 200, 401, 404, 500

#### PUT /employees/{id}

- **Description**: Update an employee.
- **Authentication**: Required.
- **Path Parameters**:
  - `id` (string, required): Employee ID.
- **Request Body**: (See `dto.UpdateEmployeeRequest` for all fields)
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Employee updated successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 200, 400, 401, 404, 500

#### DELETE /employees/{id}

- **Description**: Delete an employee.
- **Authentication**: Required.
- **Path Parameters**:
  - `id` (string, required): Employee ID.
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Employee deleted successfully"
  }
  ```
- **Status Codes**: 200, 401, 404, 500

### Levels

#### GET /companies/{company_id}/levels

- **Description**: Get a paginated list of levels for a company.
- **Authentication**: Required.
- **Path Parameters**:
  - `company_id` (string, required): Company ID.
- **Query Parameters**: `page`, `page_size`, `search`
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Levels retrieved successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 200, 400, 401, 500

#### POST /companies/{company_id}/levels

- **Description**: Create a new level.
- **Authentication**: Required.
- **Path Parameters**:
  - `company_id` (string, required): Company ID.
- **Request Body**:
  ```json
  {
    "name": "L1",
    "hierarchy_level": 1
  }
  ```
- **Response Example (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Level created successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 201, 400, 401, 500

#### GET /levels/{id}

- **Description**: Retrieve a level by ID.
- **Authentication**: Required.
- **Path Parameters**:
  - `id` (string, required): Level ID.
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Level retrieved successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 200, 401, 404, 500

#### PUT /levels/{id}

- **Description**: Update a level.
- **Authentication**: Required.
- **Path Parameters**:
  - `id` (string, required): Level ID.
- **Request Body**:
  ```json
  {
    "name": "L1 - Junior"
  }
  ```
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Level updated successfully",
    "data": { ... }
  }
  ```
- **Status Codes**: 200, 400, 401, 404, 500

#### DELETE /levels/{id}

- **Description**: Delete a level.
- **Authentication**: Required.
- **Path Parameters**:
  - `id` (string, required): Level ID.
- **Response Example (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Level deleted successfully"
  }
  ```
- **Status Codes**: 200, 401, 404, 500

## Error Handling

- **Common Error Codes**:
  - `400 Bad Request`: The request was invalid (e.g., malformed JSON, validation error).
  - `401 Unauthorized`: The request requires authentication, but a valid token was not provided.
  - `403 Forbidden`: The authenticated user does not have permission to perform the action.
  - `404 Not Found`: The requested resource could not be found.
  - `500 Internal Server Error`: An unexpected error occurred on the server.
- **Error Response Format**:
  ```json
  {
    "success": false,
    "message": "Error message",
    "data": null,
    "error": "error_code_or_details"
  }
  ```

## Notes

- The API is still under development.
- Rate limiting is not yet implemented.
