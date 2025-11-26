# Pathly Backend API Dokumentáció

## Alap Információk

- **Base URL**: `http://localhost:5000/api`
- **Autentikáció**: JWT Bearer Token
- **Content-Type**: `application/json`

## Autentikáció

### Register (Regisztráció)

**POST** `/auth/register`

Új felhasználó létrehozása.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "János Kovács"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "János Kovács",
    "createdAt": "2024-11-26T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login (Bejelentkezés)

**POST** `/auth/login`

Felhasználó bejelentkeztetése.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "János Kovács"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout (Kijelentkezés)

**POST** `/auth/logout`

Kijelentkeztetés (kliens oldali token törléshez).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

## Felhasználó API

### Get User Profile

**GET** `/users/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "János Kovács",
    "createdAt": "2024-11-26T10:00:00Z",
    "lastLogin": "2024-11-26T11:00:00Z"
  },
  "preferences": {
    "preferredOptimization": "fastest",
    "avoidTransfers": false,
    "maxWalkingDistance": 500,
    "theme": "light"
  }
}
```

### Update User Profile

**PUT** `/users/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "fullName": "Új Név"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Új Név"
  }
}
```

### Update User Preferences

**PUT** `/users/preferences`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "preferredOptimization": "least_transfers",
  "avoidTransfers": true,
  "maxWalkingDistance": 1000,
  "theme": "dark"
}
```

**Response (200):**
```json
{
  "message": "Preferences updated successfully",
  "preferences": {
    "id": "uuid",
    "userId": "uuid",
    "preferredOptimization": "least_transfers",
    "avoidTransfers": true,
    "maxWalkingDistance": 1000,
    "theme": "dark"
  }
}
```

### Delete User Account (GDPR)

**DELETE** `/users/account`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "password": "currentPassword123"
}
```

**Response (200):**
```json
{
  "message": "Account and all associated data deleted successfully (GDPR - Right to be Forgotten)"
}
```

## Útvonal API

### Search Routes (Útvonalak keresése)

**POST** `/routes/search`

Útvonalak keresése két pont között.

**Headers:**
```
Authorization: Bearer {token}  (optional)
```

**Request Body:**
```json
{
  "originLat": 47.4979,
  "originLon": 19.0402,
  "destinationLat": 47.5,
  "destinationLon": 19.05,
  "departureTime": "2024-11-26T14:00:00Z",
  "optimization": "fastest",
  "maxTransfers": 3
}
```

**Response (200):**
```json
{
  "routes": [
    {
      "id": "route-1",
      "legs": [
        {
          "type": "walking",
          "distance": 250,
          "duration": 180,
          "from": "Start",
          "to": "Deák Ferenc tér"
        },
        {
          "type": "transit",
          "routeId": "uuid",
          "routeName": "4",
          "departure": "2024-11-26T14:05:00Z",
          "arrival": "2024-11-26T14:20:00Z",
          "departureStop": "Deák Ferenc tér",
          "arrivalStop": "Kossuth Lajos tér"
        },
        {
          "type": "walking",
          "distance": 100,
          "duration": 70,
          "from": "Kossuth Lajos tér",
          "to": "Destination"
        }
      ],
      "totalDuration": 1200,
      "totalDistance": 3500,
      "transfers": 0,
      "departureTime": "2024-11-26T14:00:00Z",
      "arrivalTime": "2024-11-26T14:20:00Z"
    }
  ],
  "count": 1,
  "optimization": "fastest"
}
```

### Save Route (Útvonal mentése)

**POST** `/routes/save`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "originName": "Deák Ferenc tér",
  "originLat": 47.4979,
  "originLon": 19.0402,
  "destinationName": "Kossuth Lajos tér",
  "destinationLat": 47.5,
  "destinationLon": 19.05,
  "label": "Munkahelyre",
  "isFavorite": true,
  "routeData": { }
}
```

**Response (201):**
```json
{
  "message": "Route saved successfully",
  "route": {
    "id": "uuid",
    "userId": "uuid",
    "originName": "Deák Ferenc tér",
    "destinationName": "Kossuth Lajos tér",
    "label": "Munkahelyre",
    "isFavorite": true,
    "createdAt": "2024-11-26T10:00:00Z"
  }
}
```

### Get Saved Routes (Mentett útvonalak)

**GET** `/routes/saved`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "routes": [
    {
      "id": "uuid",
      "userId": "uuid",
      "originName": "Otthon",
      "destinationName": "Munkahelyre",
      "label": "Napi útvonal",
      "isFavorite": true,
      "createdAt": "2024-11-26T10:00:00Z",
      "updatedAt": "2024-11-26T10:00:00Z"
    }
  ],
  "count": 1
}
```

### Update Saved Route

**PUT** `/routes/saved/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "label": "Új címke",
  "isFavorite": false
}
```

**Response (200):**
```json
{
  "message": "Route updated successfully",
  "route": { }
}
```

### Delete Saved Route

**DELETE** `/routes/saved/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Route deleted successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Origin and destination coordinates are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```
