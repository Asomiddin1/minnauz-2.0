# MinnaUz 2.0 — REST API Specification

This document describes the complete REST API contract for the MinnaUz 2.0 backend (`api/`).

Base URL: `http://localhost:3001/api` (Production: `https://api.minna.uz/api`)  
Interactive Swagger Docs: `http://localhost:3001/api/docs`

---

## 1. Authentication & Device Management (`/api/auth`)

### 1.1 Send Email OTP
- **Endpoint**: `POST /api/auth/otp/send`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Tasdiqlash kodi emailingizga yuborildi",
    "expiresInSeconds": 300
  }
  ```

### 1.2 Verify Email OTP & Login
- **Endpoint**: `POST /api/auth/otp/verify`
- **Auth**: Public
- **Headers**: Optional `x-device-id`, `x-device-name`, `x-device-os`, `x-device-browser`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "code": "123456",
    "deviceId": "uuid-v4-string",
    "deviceName": "Chrome on Windows",
    "os": "Windows 11",
    "browser": "Chrome 122"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "fullName": null,
      "role": "USER",
      "isVerified": true
    },
    "deviceId": "uuid-v4-string"
  }
  ```

### 1.3 Google OAuth Login
- **Endpoint**: `POST /api/auth/google`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "token": "google-id-token",
    "email": "user@gmail.com",
    "fullName": "John Doe",
    "avatarUrl": "https://lh3.googleusercontent.com/...",
    "deviceId": "uuid-v4-string",
    "deviceName": "Safari on iPhone"
  }
  ```
- **Response `200 OK`**: Same structure as OTP verify response.

### 1.4 Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Auth**: Bearer JWT
- **Response `200 OK`**: User profile object with role and status.

### 1.5 List Active Devices (Max 3)
- **Endpoint**: `GET /api/auth/devices`
- **Auth**: Bearer JWT
- **Response `200 OK`**: Array of user's active device sessions with `isCurrentDevice` indicator.

### 1.6 Revoke Device Session
- **Endpoint**: `DELETE /api/auth/devices/:deviceId`
- **Auth**: Bearer JWT
- **Response `200 OK`**: Success status.

### 1.7 Logout Current Device
- **Endpoint**: `POST /api/auth/logout`
- **Auth**: Bearer JWT
- **Response `200 OK`**: `{ "success": true }`.

### 1.8 Admin Role Check
- **Endpoint**: `GET /api/auth/admin-check`
- **Auth**: Bearer JWT (`ADMIN`, `SUPER_ADMIN`)
- **Response `200 OK`**: `{ "hasAccess": true, "role": "ADMIN" }`.

---

## 2. Courses & Progress API (`/api/courses`)

### 2.1 Get All Courses
- **Endpoint**: `GET /api/courses`
- **Auth**: Optional Bearer JWT (enriches with user completion percentages)
- **Response `200 OK`**: List of published courses with lesson counts, completed count, and progress percent.

### 2.2 Get Course Details & Roadmap
- **Endpoint**: `GET /api/courses/:idOrSlug`
- **Auth**: Optional Bearer JWT
- **Response `200 OK`**: Course object containing sorted `modules` and their nested `lessons` with completion status.

### 2.3 Get Lesson with 5 Study Sections
- **Endpoint**: `GET /api/courses/:courseId/lessons/:lessonId`
- **Auth**: Optional Bearer JWT
- **Response `200 OK`**: Full lesson object including:
  - `kotobaItems`: Array of vocabulary entries with audio & furigana.
  - `bunpouItems`: Array of grammar patterns with examples.
  - `kanjiItems`: Array of kanji characters with on/kun readings.
  - `renshuuItems`: Array of quiz and practice drills.
  - `kaiwaScenario`: AI dialogue roleplay configuration JSON.
  - `userProgress`: User's current completion state and quiz score.

### 2.4 Update Lesson Progress
- **Endpoint**: `POST /api/courses/:courseId/lessons/:lessonId/progress`
- **Auth**: Bearer JWT
- **Request Body**:
  ```json
  {
    "section": "kotoba",
    "quizScore": 90,
    "isCompleted": false
  }
  ```
- **Response `200 OK`**: Updated progress object.

### 2.5 Get User Study Statistics & Streak
- **Endpoint**: `GET /api/courses/user/stats`
- **Auth**: Optional / Bearer JWT
- **Response `200 OK`**:
  ```json
  {
    "currentStreak": 5,
    "longestStreak": 14,
    "wordsLearned": 120,
    "grammarLearned": 24,
    "kanjiLearned": 16,
    "lessonsCompleted": 8,
    "studyTimeMinutesThisWeek": 145
  }
  ```

### 2.6 Log Study Time
- **Endpoint**: `POST /api/courses/user/study-time`
- **Auth**: Bearer JWT
- **Request Body**: `{ "minutes": 2 }`
- **Response `200 OK`**: `{ "success": true }`.

### 2.7 Get / Update Study Plan
- **Endpoint**: `GET /api/courses/user/study-plan` & `POST /api/courses/user/study-plan`
- **Auth**: Bearer JWT
- **Request Body**:
  ```json
  {
    "targetLevel": "N4",
    "weeklyGoalHours": 5,
    "dailyMinutes": 45,
    "targetMonths": 6
  }
  ```

---

## 3. Admin Users API (`/api/admin/users`)

- **Auth Requirement**: Bearer JWT with `ADMIN` or `SUPER_ADMIN` role.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users/stats` | Total users, active today, verified count, new this week |
| `GET` | `/api/admin/users?page=1&limit=20&search=john&role=USER` | Filtered and paginated user list |
| `GET` | `/api/admin/users/:id` | Full user profile with active device sessions |
| `POST` | `/api/admin/users` | Manually register a user |
| `PATCH`| `/api/admin/users/:id` | Update user role, name, or verification status |
| `DELETE`| `/api/admin/users/:id` | Delete user and cascade dependent data |
| `DELETE`| `/api/admin/users/:id/devices/:deviceId` | Terminate specific user session |

---

## 4. Admin Courses CMS API (`/api/admin/courses`)

- **Auth Requirement**: Bearer JWT with `ADMIN`, `SUPER_ADMIN`, or `TEACHER` role.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/courses/teachers` | Get teachers and admins for author assignment |
| `GET` | `/api/admin/courses` | List all courses for administration |
| `GET` | `/api/admin/courses/:id` | Get course details and modules |
| `POST` | `/api/admin/courses` | Create new course |
| `PATCH`| `/api/admin/courses/:id` | Update course metadata, level, cover, author |
| `DELETE`| `/api/admin/courses/:id` | Delete course and all modules/lessons |
| `POST` | `/api/admin/courses/:courseId/modules` | Add module to course |
| `PATCH`| `/api/admin/courses/:courseId/modules/:moduleId` | Update module |
| `DELETE`| `/api/admin/courses/:courseId/modules/:moduleId` | Delete module |
| `POST` | `/api/admin/courses/:courseId/modules/:moduleId/lessons` | Add lesson to module |
| `PATCH`| `/api/admin/courses/:courseId/lessons/:lessonId` | Update lesson title, video, scenario |
| `DELETE`| `/api/admin/courses/:courseId/lessons/:lessonId` | Delete lesson |
| `GET` | `/api/admin/courses/:courseId/lessons/:lessonId/content` | Get all 4 content sections |
| `POST` | `/api/admin/courses/:courseId/lessons/:lessonId/kotoba` | Create / update Kotoba vocabulary item |
| `DELETE`| `/api/admin/courses/:courseId/lessons/:lessonId/kotoba/:id` | Delete Kotoba item |
| `POST` | `/api/admin/courses/:courseId/lessons/:lessonId/bunpou` | Create / update Bunpou grammar item |
| `DELETE`| `/api/admin/courses/:courseId/lessons/:lessonId/bunpou/:id` | Delete Bunpou item |
| `POST` | `/api/admin/courses/:courseId/lessons/:lessonId/kanji` | Create / update Kanji item |
| `DELETE`| `/api/admin/courses/:courseId/lessons/:lessonId/kanji/:id` | Delete Kanji item |
| `POST` | `/api/admin/courses/:courseId/lessons/:lessonId/renshuu` | Create / update Renshuu exercise drill |
| `DELETE`| `/api/admin/courses/:courseId/lessons/:lessonId/renshuu/:id` | Delete Renshuu exercise drill |

---

## 5. Notifications & Banners API

### Notifications (`/api/notifications`)
- `GET /api/notifications` — Get notifications for current user with read indicators.
- `GET /api/notifications/unread-count` — Quick count of unread notifications.
- `POST /api/notifications/:id/read` — Mark notification as read.
- `POST /api/notifications/read-all` — Mark all as read.
- `GET /api/notifications/admin` — (Admin) List all broadcasted notifications.
- `POST /api/notifications/admin` — (Admin) Broadcast new notification.
- `DELETE /api/notifications/admin/:id` — (Admin) Delete notification.

### Banners (`/api/banners`)
- `GET /api/banners` — Public active banners targeted to current role.
- `GET /api/banners/admin` — (Admin) All banners.
- `POST /api/banners/admin` — (Admin) Create banner.
- `PUT /api/banners/admin/reorder` — (Admin) Reorder banner sequence.
- `PUT /api/banners/admin/:id` — (Admin) Update banner content and actions.
- `PATCH /api/banners/admin/:id/toggle` — (Admin) Toggle active state.
- `DELETE /api/banners/admin/:id` — (Admin) Delete banner.

---

## 6. Upload API (`/api/upload`)

### Upload Lesson Video
- **Endpoint**: `POST /api/upload/video`
- **Auth**: Bearer JWT (`ADMIN`, `SUPER_ADMIN`, `TEACHER`)
- **Content-Type**: `multipart/form-data` (Field name: `file`)
- **Allowed Formats**: MP4, WebM, MOV, MKV (Max 500 MB)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "url": "/uploads/videos/video-1740722100000-123456789.mp4",
    "originalName": "Lesson1_Grammar.mp4",
    "size": 45120340,
    "filename": "video-1740722100000-123456789.mp4"
  }
  ```
