# GlobeTrotter — API Contracts & Handshake Specification

> **Base URL:** `http://localhost:4000`
> **Content-Type:** `application/json`
> **Authentication:** `Authorization: Bearer <jwt-token>`

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
- **Auth:** Public
- **Request Body:**
```json
{
  "email": "traveler@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "city": "Paris",
  "country": "France",
  "photo": "https://..."
}
```
- **Response 201 Created:**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "uuid",
    "email": "traveler@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "TRAVELER"
  }
}
```

### `POST /api/auth/login`
- **Auth:** Public
- **Request Body:**
```json
{
  "email": "traveler@example.com",
  "password": "Password123!"
}
```
- **Response 200 OK:**
```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": { ... }
}
```

### `GET /api/auth/me`
- **Auth:** Bearer Token required
- **Response 200 OK:** `{ "user": { ... } }`

---

## 2. Trips (`/api/trips`)

### `GET /api/trips`
- **Auth:** Bearer Token
- **Response 200 OK:**
```json
{
  "trips": [
    {
      "id": "uuid",
      "name": "Summer in Paris",
      "startDate": "2026-07-01T00:00:00.000Z",
      "endDate": "2026-07-10T00:00:00.000Z",
      "status": "UPCOMING",
      "isPublic": false,
      "totalBudget": 1500,
      "sections": []
    }
  ]
}
```

### `POST /api/trips`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "name": "Japan Adventure",
  "startDate": "2026-09-01T00:00:00Z",
  "endDate": "2026-09-15T00:00:00Z",
  "description": "Tokyo & Kyoto journey",
  "coverPhoto": "https://..."
}
```

### `POST /api/trips/:id/toggle-share`
- **Auth:** Bearer Token
- **Response 200 OK:**
```json
{
  "isPublic": true,
  "shareToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

### `POST /api/trips/:id/copy`
- **Auth:** Bearer Token
- **Response 201 Created:** `{ "trip": { ... } }` (deep copies trip + sections + stop activities)

---

## 3. Sections (`/api/sections`)

### `POST /api/sections`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "tripId": "uuid",
  "name": "Paris Leg",
  "sectionStart": "2026-07-01T00:00:00Z",
  "sectionEnd": "2026-07-05T00:00:00Z",
  "budget": 500,
  "sequence": 1
}
```

### `POST /api/sections/:id/activities`
- **Auth:** Bearer Token
- **Request Body:**
```json
{
  "activityId": "uuid",
  "day": 1,
  "expense": 35,
  "notes": "Book online early"
}
```

---

## 4. Cities & Activities (`/api/cities`, `/api/activities`)

### `GET /api/cities`
- **Auth:** Public
- **Query Params:** `?search=paris` | `?popular=true`
- **Response 200 OK:**
```json
{
  "cities": [
    {
      "id": "uuid",
      "name": "Paris",
      "country": "France",
      "image": "https://...",
      "popularity": 98
    }
  ]
}
```

### `GET /api/activities`
- **Auth:** Public
- **Query Params:** `?cityId=uuid` | `?category=ADVENTURE|CULTURE|FOOD|NATURE|OTHER` | `?search=museum`

---

## 5. Community (`/api/community`)

### `GET /api/community`
- **Auth:** Public
- **Query Params:** `?page=1&limit=20`
- **Response 200 OK:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "content": "Loved the Paris trip!",
      "image": "https://...",
      "createdAt": "2026-08-22T08:00:00.000Z",
      "user": { "id": "uuid", "firstName": "John", "lastName": "Doe" }
    }
  ],
  "total": 1,
  "page": 1,
  "totalPages": 1
}
```

---

## 6. Public Share (`/api/share`)

### `GET /api/share/:token`
- **Auth:** **Public (No token required)**
- **Response 200 OK:** Full read-only trip object with sections and activities.
- **Response 404 Not Found:** Returned if token is invalid or `isPublic` is false.


