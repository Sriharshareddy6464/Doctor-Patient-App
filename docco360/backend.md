# Docco360 Backend — API Reference

> **Base URL:** `/api`
> **Server health:** `GET /health` → `{ success: true, message: "Server is running" }`

---

## Table of Contents

- [Authentication & Middleware](#authentication--middleware)
- [Auth Routes (`/api/auth`)](#1-auth-routes--apiauth)
- [Doctor Routes (`/api/doctor`)](#2-doctor-routes--apidoctor)
- [Patient Routes (`/api/patient`)](#3-patient-routes--apipatient)
- [Admin Routes (`/api/admin`)](#4-admin-routes--apiadmin)
- [Enums & Data Models](#enums--data-models)
- [Standard Error Response](#standard-error-response)

---

## Authentication & Middleware

All routes (except Auth public routes) require a valid **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

| Middleware      | Description |
|-----------------|-------------|
| `authenticate`  | Verifies the JWT access token. Attaches `req.user = { userId, email, role }` to the request. |
| `authorize(…roles)` | Checks `req.user.role` against the allowed roles. Returns `403` if the role is not permitted. |

**Route-level authorization:**

| Prefix           | Required Role |
|-------------------|---------------|
| `/api/auth/*`     | Public (register, login, refresh-token) · Authenticated (logout, me) |
| `/api/doctor/*`   | `DOCTOR` |
| `/api/patient/*`  | `PATIENT` |
| `/api/admin/*`    | `ADMIN` |

---

## 1. Auth Routes — `/api/auth`

### 1.1 `POST /api/auth/register`

> **Auth:** Public (no token required)

Register a new user (PATIENT or DOCTOR only — no ADMIN self-registration).

**Request Body:**

| Field      | Type     | Required | Validation |
|------------|----------|----------|------------|
| `name`     | `string` | ✅       | 2–100 characters |
| `email`    | `string` | ✅       | Valid email format |
| `password` | `string` | ✅       | Min 8 chars; must contain at least 1 uppercase, 1 lowercase, 1 number |
| `role`     | `string` | ✅       | `"PATIENT"` or `"DOCTOR"` |

**Success Response — `201 Created`:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "PATIENT | DOCTOR"
    },
    "accessToken": "jwt-string",
    "refreshToken": "jwt-string"
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400`  | Validation failed (missing/invalid fields) |
| `409`  | A user with this email already exists |

---

### 1.2 `POST /api/auth/login`

> **Auth:** Public (no token required)

Login with email and password. Doctors must be admin-approved before they can log in.

**Request Body:**

| Field      | Type     | Required | Validation |
|------------|----------|----------|------------|
| `email`    | `string` | ✅       | Valid email format |
| `password` | `string` | ✅       | Non-empty |

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "PATIENT | DOCTOR | ADMIN"
    },
    "accessToken": "jwt-string",
    "refreshToken": "jwt-string"
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400`  | Validation failed |
| `401`  | Invalid email or password |
| `403`  | Account deactivated / Doctor pending approval / Doctor application rejected |

---

### 1.3 `POST /api/auth/refresh-token`

> **Auth:** Public (no token required)

Exchange a valid refresh token for a new access + refresh token pair (token rotation).

**Request Body:**

| Field          | Type     | Required | Validation |
|----------------|----------|----------|------------|
| `refreshToken` | `string` | ✅       | Non-empty string |

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-jwt-string",
    "refreshToken": "new-jwt-string"
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400`  | Validation failed |
| `401`  | Invalid / expired / revoked refresh token |

---

### 1.4 `POST /api/auth/logout`

> **Auth:** 🔒 Authenticated (any role)

Clears the stored refresh token, invalidating all future refresh attempts.

**Request Body:** _None_

**Headers:**

| Header          | Value |
|-----------------|-------|
| `Authorization` | `Bearer <accessToken>` |

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `401`  | Not authenticated / invalid token |

---

### 1.5 `GET /api/auth/me`

> **Auth:** 🔒 Authenticated (any role)

Returns the profile of the currently authenticated user.

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "PATIENT | DOCTOR | ADMIN",
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601"
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `401`  | Not authenticated |
| `404`  | User not found |

---

## 2. Doctor Routes — `/api/doctor`

> **Auth:** 🔒 All routes require `authenticate` + `authorize("DOCTOR")`

### 2.1 `GET /api/doctor/profile`

Get the authenticated doctor's full profile (user info + doctor profile details).

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "DOCTOR",
      "createdAt": "ISO-8601"
    },
    "profile": {
      "id": "uuid",
      "userId": "uuid",
      "specializations": ["string"],
      "experience": 0,
      "qualifications": ["string"],
      "bio": "string | null",
      "consultationFee": 0.0,
      "availableFrom": "HH:mm | null",
      "availableTo": "HH:mm | null",
      "approvalStatus": "PENDING | APPROVED | REJECTED",
      "rejectionReason": "string | null",
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601"
    }
  }
}
```

> **Note:** `profile` will be `null` if the doctor has not yet set up their profile.

---

### 2.2 `PUT /api/doctor/profile`

Update (or create) the authenticated doctor's profile. Uses upsert — creates if it doesn't exist.

**Request Body (all fields optional):**

| Field              | Type       | Validation |
|--------------------|------------|------------|
| `specializations`  | `string[]` | Each item non-empty |
| `experience`       | `integer`  | ≥ 0 |
| `qualifications`   | `string[]` | Each item non-empty |
| `bio`              | `string \| null` | Max 1000 chars |
| `consultationFee`  | `number \| null` | ≥ 0 |
| `availableFrom`    | `string \| null` | `HH:mm` format (e.g. `"09:00"`) |
| `availableTo`      | `string \| null` | `HH:mm` format (e.g. `"17:00"`) |

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { "id", "name", "email", "role" },
    "profile": { "id", "userId", "specializations", "experience", "..." }
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400`  | Validation failed |
| `401`  | Not authenticated |

---

### 2.3 `POST /api/doctor/time-slots`

Configure 30-minute time slots for a specific date. Replaces all existing unbooked slots for that date (booked slots are preserved).

**Request Body:**

| Field       | Type     | Required | Validation |
|-------------|----------|----------|------------|
| `date`      | `string` | ✅       | `YYYY-MM-DD` format; cannot be a past date |
| `startTime` | `string` | ✅       | `HH:mm` format |
| `endTime`   | `string` | ✅       | `HH:mm` format; must be after `startTime` |

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Time slots configured successfully",
  "data": [
    {
      "id": "uuid",
      "doctorId": "uuid",
      "date": "2026-05-22",
      "startTime": "09:00",
      "endTime": "09:30",
      "isBooked": false,
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601"
    }
  ]
}
```

> Slots are auto-generated in **30-minute intervals** between `startTime` and `endTime`.

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400`  | Validation failed / past date / startTime ≥ endTime |
| `401`  | Not authenticated |

---

### 2.4 `GET /api/doctor/appointments`

List all appointments for the authenticated doctor, ordered by date ascending.

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "timeSlotId": "uuid",
      "patientId": "uuid",
      "doctorId": "uuid",
      "paymentStatus": "PAID",
      "paymentId": "PAY-xxx",
      "amount": 500.0,
      "channelName": "appt-xxx",
      "callStatus": "SCHEDULED | IN_PROGRESS | COMPLETED",
      "status": "CONFIRMED | CANCELLED | COMPLETED",
      "notes": "string | null",
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601",
      "timeSlot": { "id", "date", "startTime", "endTime", "isBooked" },
      "patient": {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "patientProfile": { "..." }
      }
    }
  ]
}
```

---

### 2.5 `GET /api/doctor/appointments/:id/join`

Get an Agora video-call token for the doctor to join a consultation. Marks the call status as `IN_PROGRESS`.

**URL Params:**

| Param | Type     | Description |
|-------|----------|-------------|
| `id`  | `string` | Appointment UUID |

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "appId": "agora-app-id",
    "channelName": "appt-xxx",
    "token": "agora-rtc-token",
    "uid": 1,
    "role": "doctor",
    "expiresIn": 3600,
    "appointment": {
      "id": "uuid",
      "date": "2026-05-22",
      "startTime": "09:00",
      "endTime": "09:30",
      "patient": { "id": "uuid", "name": "string" }
    }
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400`  | Appointment is cancelled or already completed |
| `403`  | Authenticated user is not the doctor for this appointment |
| `404`  | Appointment not found |

---

### 2.6 `PATCH /api/doctor/appointments/:id/end`

End the video call and mark the appointment as `COMPLETED`.

**URL Params:**

| Param | Type     | Description |
|-------|----------|-------------|
| `id`  | `string` | Appointment UUID |

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Call ended and appointment marked as completed",
  "data": {
    "id": "uuid",
    "status": "COMPLETED",
    "callStatus": "COMPLETED",
    "..."
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `403`  | Not authorized (not the doctor or patient for this appointment) |
| `404`  | Appointment not found |

---

## 3. Patient Routes — `/api/patient`

> **Auth:** 🔒 All routes require `authenticate` + `authorize("PATIENT")`

### 3.1 `GET /api/patient/profile`

Get the authenticated patient's full profile (user info + patient profile details).

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "role": "PATIENT",
      "createdAt": "ISO-8601"
    },
    "profile": {
      "id": "uuid",
      "userId": "uuid",
      "dateOfBirth": "ISO-8601 | null",
      "gender": "MALE | FEMALE | OTHER | null",
      "bloodGroup": "string | null",
      "phone": "string | null",
      "address": "string | null",
      "allergies": ["string"],
      "medicalHistory": "string | null",
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601"
    }
  }
}
```

> **Note:** `profile` will be `null` if the patient has not yet set up their profile.

---

### 3.2 `PUT /api/patient/profile`

Update (or create) the authenticated patient's profile. Uses upsert.

**Request Body (all fields optional):**

| Field            | Type       | Validation |
|------------------|------------|------------|
| `dateOfBirth`    | `string \| null` | Valid ISO datetime string |
| `gender`         | `string \| null` | `"MALE"`, `"FEMALE"`, or `"OTHER"` |
| `bloodGroup`     | `string \| null` | Max 10 chars |
| `phone`          | `string \| null` | 7–20 chars |
| `address`        | `string \| null` | Max 500 chars |
| `allergies`      | `string[]` | Each item non-empty |
| `medicalHistory` | `string \| null` | Max 5000 chars |

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { "id", "name", "email", "role" },
    "profile": { "id", "userId", "dateOfBirth", "gender", "..." }
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400`  | Validation failed |
| `401`  | Not authenticated |

---

### 3.3 `GET /api/patient/all-doctors`

Get a list of all **active, admin-approved** doctors with their profiles.

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "user": {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "role": "DOCTOR",
        "createdAt": "ISO-8601"
      },
      "profile": {
        "specializations": ["string"],
        "experience": 5,
        "qualifications": ["string"],
        "bio": "string | null",
        "consultationFee": 500.0,
        "availableFrom": "09:00",
        "availableTo": "17:00",
        "approvalStatus": "APPROVED",
        "..."
      }
    }
  ]
}
```

---

### 3.4 `GET /api/patient/doctors/:id`

Get a specific doctor's full profile by their user ID.

**URL Params:**

| Param | Type     | Description |
|-------|----------|-------------|
| `id`  | `string` | Doctor's user UUID |

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "user": { "id", "name", "email", "role", "createdAt" },
    "profile": { "specializations", "experience", "qualifications", "..." }
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400`  | Doctor ID is missing |
| `404`  | User not found |

---

### 3.5 `GET /api/patient/doctors/:id/slots?date=YYYY-MM-DD`

Get available (unbooked) time slots for a doctor on a specific date.

**URL Params:**

| Param | Type     | Description |
|-------|----------|-------------|
| `id`  | `string` | Doctor's user UUID |

**Query Params:**

| Param  | Type     | Required | Validation |
|--------|----------|----------|------------|
| `date` | `string` | ✅       | `YYYY-MM-DD` format; cannot be a past date |

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "isActive": true,
      "doctorProfile": { "..." }
    },
    "slots": [
      {
        "id": "uuid",
        "doctorId": "uuid",
        "date": "2026-05-22",
        "startTime": "09:00",
        "endTime": "09:30",
        "isBooked": false,
        "createdAt": "ISO-8601",
        "updatedAt": "ISO-8601"
      }
    ]
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400`  | Missing doctor ID or invalid/missing date / past date |
| `403`  | Doctor is not active or not approved |
| `404`  | Doctor not found |

---

### 3.6 `POST /api/patient/appointments`

Book an available time slot. Runs a mock payment and creates a confirmed appointment with an Agora video channel.

**Request Body:**

| Field        | Type     | Required | Validation |
|--------------|----------|----------|------------|
| `timeSlotId` | `string` | ✅       | Valid UUID |
| `notes`      | `string` | ❌       | Max 500 chars |

**Success Response — `201 Created`:**

```json
{
  "success": true,
  "message": "Appointment booked and payment successful",
  "data": {
    "appointment": {
      "id": "uuid",
      "timeSlotId": "uuid",
      "patientId": "uuid",
      "doctorId": "uuid",
      "paymentStatus": "PAID",
      "paymentId": "PAY-1716300000000-ABCDEFG",
      "amount": 500.0,
      "channelName": "appt-xxx",
      "callStatus": "SCHEDULED",
      "status": "CONFIRMED",
      "notes": "string | null",
      "timeSlot": { "id", "date", "startTime", "endTime", "isBooked" },
      "doctor": { "id", "name", "email" },
      "patient": { "id", "name", "email" }
    },
    "payment": {
      "status": "PAID",
      "transactionId": "PAY-xxx",
      "amount": 500.0,
      "currency": "INR",
      "message": "Mock payment successful"
    }
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400`  | Validation failed / time slot is in the past |
| `404`  | Time slot not found |
| `409`  | Time slot was just booked by someone else (race condition guard) |

---

### 3.7 `GET /api/patient/appointments`

List all appointments for the authenticated patient, ordered by date ascending.

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "timeSlotId": "uuid",
      "patientId": "uuid",
      "doctorId": "uuid",
      "paymentStatus": "PAID",
      "paymentId": "PAY-xxx",
      "amount": 500.0,
      "channelName": "appt-xxx",
      "callStatus": "SCHEDULED | IN_PROGRESS | COMPLETED",
      "status": "CONFIRMED | CANCELLED | COMPLETED",
      "notes": "string | null",
      "timeSlot": { "id", "date", "startTime", "endTime", "isBooked" },
      "doctor": {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "doctorProfile": { "..." }
      }
    }
  ]
}
```

---

### 3.8 `GET /api/patient/appointments/:id/join`

Get an Agora video-call token for the patient to join a consultation. Marks the call status as `IN_PROGRESS`.

**URL Params:**

| Param | Type     | Description |
|-------|----------|-------------|
| `id`  | `string` | Appointment UUID |

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "appId": "agora-app-id",
    "channelName": "appt-xxx",
    "token": "agora-rtc-token",
    "uid": 2,
    "role": "patient",
    "expiresIn": 3600,
    "appointment": {
      "id": "uuid",
      "date": "2026-05-22",
      "startTime": "09:00",
      "endTime": "09:30",
      "doctor": { "id": "uuid", "name": "string" }
    }
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400`  | Appointment is cancelled or already completed |
| `403`  | Authenticated user is not the patient for this appointment |
| `404`  | Appointment not found |

---

### 3.9 `PATCH /api/patient/appointments/:id/end`

End the video call and mark the appointment as `COMPLETED`. (Same handler as doctor's end-call.)

**URL Params:**

| Param | Type     | Description |
|-------|----------|-------------|
| `id`  | `string` | Appointment UUID |

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Call ended and appointment marked as completed",
  "data": {
    "id": "uuid",
    "status": "COMPLETED",
    "callStatus": "COMPLETED",
    "..."
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `403`  | Not authorized (not the doctor or patient for this appointment) |
| `404`  | Appointment not found |

---

## 4. Admin Routes — `/api/admin`

> **Auth:** 🔒 All routes require `authenticate` + `authorize("ADMIN")`
> The single ADMIN account is seeded at startup via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).

### 4.1 `GET /api/admin/stats`

Get platform-wide statistics for the admin dashboard.

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "totalDoctors": 10,
    "activeDoctors": 7,
    "pendingApprovals": 2,
    "totalPatients": 50,
    "totalAppointments": 120,
    "confirmedAppointments": 30,
    "completedAppointments": 80,
    "cancelledAppointments": 10,
    "totalRevenue": 45000.0
  }
}
```

---

### 4.2 `GET /api/admin/doctors`

Get all doctors (including inactive and unapproved), ordered by creation date descending.

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "isActive": true,
      "createdAt": "ISO-8601",
      "doctorProfile": {
        "approvalStatus": "PENDING | APPROVED | REJECTED",
        "rejectionReason": "string | null",
        "specializations": ["string"],
        "experience": 5,
        "consultationFee": 500.0,
        "qualifications": ["string"]
      },
      "_count": {
        "doctorAppointments": 15
      }
    }
  ]
}
```

---

### 4.3 `PATCH /api/admin/doctors/:id/approve`

Approve a pending doctor. Also sets `isActive = true`. The doctor can now log in.

**URL Params:**

| Param | Type     | Description |
|-------|----------|-------------|
| `id`  | `string` | Doctor's user UUID |

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "message": "Doctor approved successfully. They can now log in."
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `404`  | Doctor not found |

---

### 4.4 `PATCH /api/admin/doctors/:id/reject`

Reject a pending doctor application with an optional reason.

**URL Params:**

| Param | Type     | Description |
|-------|----------|-------------|
| `id`  | `string` | Doctor's user UUID |

**Request Body:**

| Field    | Type     | Required | Description |
|----------|----------|----------|-------------|
| `reason` | `string` | ❌       | Rejection reason (defaults to empty string) |

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "message": "Doctor application rejected."
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `404`  | Doctor not found |

---

### 4.5 `PATCH /api/admin/doctors/:id/activate`

Re-activate a previously deactivated doctor.

**URL Params:**

| Param | Type     | Description |
|-------|----------|-------------|
| `id`  | `string` | Doctor's user UUID |

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "message": "Doctor reactivated successfully."
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `404`  | Doctor not found |

---

### 4.6 `PATCH /api/admin/doctors/:id/deactivate`

Deactivate a doctor. Blocked if the doctor is currently in an active video call or has upcoming confirmed appointments.

**URL Params:**

| Param | Type     | Description |
|-------|----------|-------------|
| `id`  | `string` | Doctor's user UUID |

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "message": "Doctor deactivated. They can no longer log in or appear in searches."
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `404`  | Doctor not found |
| `409`  | Doctor is currently in an active video consultation |
| `409`  | Doctor has scheduled/confirmed appointments that must be cancelled first |

---

### 4.7 `GET /api/admin/patients`

Get all patients with their profile details, ordered by creation date descending.

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "createdAt": "ISO-8601",
      "patientProfile": {
        "phone": "string | null",
        "dateOfBirth": "ISO-8601 | null",
        "gender": "MALE | FEMALE | OTHER | null",
        "bloodGroup": "string | null"
      },
      "_count": {
        "patientAppointments": 3
      }
    }
  ]
}
```

---

### 4.8 `GET /api/admin/appointments`

Get all appointments with full relations (doctor, patient, time slot). Limited to 200 most recent.

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "timeSlotId": "uuid",
      "patientId": "uuid",
      "doctorId": "uuid",
      "paymentStatus": "PENDING | PAID | REFUNDED",
      "paymentId": "PAY-xxx | null",
      "amount": 500.0,
      "channelName": "appt-xxx",
      "callStatus": "SCHEDULED | IN_PROGRESS | COMPLETED",
      "status": "CONFIRMED | CANCELLED | COMPLETED",
      "notes": "string | null",
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601",
      "timeSlot": { "id", "date", "startTime", "endTime", "isBooked" },
      "doctor": { "id": "uuid", "name": "string", "email": "string" },
      "patient": { "id": "uuid", "name": "string", "email": "string" }
    }
  ]
}
```

---

### 4.9 `PATCH /api/admin/appointments/:id/cancel`

Cancel any confirmed appointment (admin override). Frees up the associated time slot.

**URL Params:**

| Param | Type     | Description |
|-------|----------|-------------|
| `id`  | `string` | Appointment UUID |

**Request Body:** _None_

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    { "...updated appointment with status CANCELLED..." },
    { "...updated time slot with isBooked = false..." }
  ]
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400`  | Only CONFIRMED appointments can be cancelled |
| `404`  | Appointment not found |

---

## Enums & Data Models

### Roles

| Value     | Description |
|-----------|-------------|
| `PATIENT` | End user seeking medical consultation |
| `DOCTOR`  | Medical professional (requires admin approval) |
| `ADMIN`   | Platform administrator (seeded, not self-registered) |

### Doctor Approval Status

| Value      | Description |
|------------|-------------|
| `PENDING`  | Newly registered doctor, awaiting admin review |
| `APPROVED` | Admin approved — can log in and accept appointments |
| `REJECTED` | Admin rejected — cannot log in |

### Gender

| Value    |
|----------|
| `MALE`   |
| `FEMALE` |
| `OTHER`  |

### Appointment Status

| Value       | Description |
|-------------|-------------|
| `CONFIRMED` | Booked and paid for |
| `CANCELLED` | Cancelled by admin |
| `COMPLETED` | Consultation finished |

### Payment Status

| Value      | Description |
|------------|-------------|
| `PENDING`  | Payment not yet made |
| `PAID`     | Payment successful (mock) |
| `REFUNDED` | Payment refunded |

### Call Status

| Value         | Description |
|---------------|-------------|
| `SCHEDULED`   | Call not yet started |
| `IN_PROGRESS` | At least one participant has joined |
| `COMPLETED`   | Call ended |

---

## Standard Error Response

All error responses follow this shape:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": {
    "fieldName": "Validation error message"
  }
}
```

> The `errors` field is only present for `400` validation errors (Zod). Other errors only include `message`.

### Common HTTP Status Codes

| Code  | Meaning |
|-------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient role or account blocked) |
| `404` | Resource Not Found |
| `409` | Conflict (duplicate email, slot already booked, active calls) |
| `500` | Internal Server Error |

---

## Route Summary Table

| #  | Method  | Endpoint                                  | Auth      | Role      | Description |
|----|---------|-------------------------------------------|-----------|-----------|-------------|
| 1  | `GET`   | `/health`                                 | Public    | —         | Health check |
| 2  | `POST`  | `/api/auth/register`                      | Public    | —         | Register new user |
| 3  | `POST`  | `/api/auth/login`                         | Public    | —         | Login |
| 4  | `POST`  | `/api/auth/refresh-token`                 | Public    | —         | Refresh tokens |
| 5  | `POST`  | `/api/auth/logout`                        | 🔒        | Any       | Logout |
| 6  | `GET`   | `/api/auth/me`                            | 🔒        | Any       | Get current user |
| 7  | `GET`   | `/api/doctor/profile`                     | 🔒        | DOCTOR    | Get doctor profile |
| 8  | `PUT`   | `/api/doctor/profile`                     | 🔒        | DOCTOR    | Update doctor profile |
| 9  | `POST`  | `/api/doctor/time-slots`                  | 🔒        | DOCTOR    | Create time slots |
| 10 | `GET`   | `/api/doctor/appointments`                | 🔒        | DOCTOR    | List doctor's appointments |
| 11 | `GET`   | `/api/doctor/appointments/:id/join`       | 🔒        | DOCTOR    | Get Agora token (doctor) |
| 12 | `PATCH` | `/api/doctor/appointments/:id/end`        | 🔒        | DOCTOR    | End call |
| 13 | `GET`   | `/api/patient/profile`                    | 🔒        | PATIENT   | Get patient profile |
| 14 | `PUT`   | `/api/patient/profile`                    | 🔒        | PATIENT   | Update patient profile |
| 15 | `GET`   | `/api/patient/all-doctors`                | 🔒        | PATIENT   | List all approved doctors |
| 16 | `GET`   | `/api/patient/doctors/:id`                | 🔒        | PATIENT   | Get doctor by ID |
| 17 | `GET`   | `/api/patient/doctors/:id/slots?date=`    | 🔒        | PATIENT   | Get available slots |
| 18 | `POST`  | `/api/patient/appointments`               | 🔒        | PATIENT   | Book appointment |
| 19 | `GET`   | `/api/patient/appointments`               | 🔒        | PATIENT   | List patient's appointments |
| 20 | `GET`   | `/api/patient/appointments/:id/join`      | 🔒        | PATIENT   | Get Agora token (patient) |
| 21 | `PATCH` | `/api/patient/appointments/:id/end`       | 🔒        | PATIENT   | End call |
| 22 | `GET`   | `/api/admin/stats`                        | 🔒        | ADMIN     | Platform statistics |
| 23 | `GET`   | `/api/admin/doctors`                      | 🔒        | ADMIN     | List all doctors |
| 24 | `PATCH` | `/api/admin/doctors/:id/approve`          | 🔒        | ADMIN     | Approve doctor |
| 25 | `PATCH` | `/api/admin/doctors/:id/reject`           | 🔒        | ADMIN     | Reject doctor |
| 26 | `PATCH` | `/api/admin/doctors/:id/activate`         | 🔒        | ADMIN     | Activate doctor |
| 27 | `PATCH` | `/api/admin/doctors/:id/deactivate`       | 🔒        | ADMIN     | Deactivate doctor |
| 28 | `GET`   | `/api/admin/patients`                     | 🔒        | ADMIN     | List all patients |
| 29 | `GET`   | `/api/admin/appointments`                 | 🔒        | ADMIN     | List all appointments |
| 30 | `PATCH` | `/api/admin/appointments/:id/cancel`      | 🔒        | ADMIN     | Cancel appointment |
