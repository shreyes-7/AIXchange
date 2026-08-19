# Error Handling

## Overview

The AIXchange backend uses a centralized error-handling strategy with structured custom error objects and consistent API responses across all routes.

---

## 1. Custom Error Class (`server/src/utils/ApiError.js`)

```javascript
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
```

---

## 2. Standardized Response Format (`server/src/utils/ApiResponse.js`)

```javascript
export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
```

---

## 3. Global Error Middleware (`server/src/middlewares/error.middleware.js`)

- Intercepts all uncaught exceptions, Joi validation errors, and Mongoose database errors (such as `11000` duplicate key violations).
- Automatically logs error stack traces with Winston in development.
- Sanitizes error messages in production to prevent leaking internal database schemas or credentials.
- Returns a uniform JSON payload:
  ```json
  {
    "success": false,
    "statusCode": 400,
    "message": "Invalid license type specified"
  }
  ```
