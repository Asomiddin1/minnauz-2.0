# MinnaUz 2.0 — Security Architecture & Guidelines

This document outlines the security architecture, data protection practices, authentication defenses, and input validation policies implemented across MinnaUz.

---

## 1. Authentication & Session Security

- **Short-Lived Access Tokens**: JWT tokens carry a strictly bounded expiration lifetime.
- **Hashed Refresh Tokens**: Refresh tokens in `DeviceSession` are hashed via cryptographic algorithms (e.g. bcrypt) prior to storage, preventing session replay even in the event of a database leak.
- **Strict Device Limits**: Maximum 3 concurrent active devices per user. Unused or surplus devices are automatically evicted.
- **Transient OTP Codes**: Email OTP codes are 6-digit numeric, expire within 300 seconds, and are permanently invalidated (`used = true`) immediately upon submission.

---

## 2. API & Network Security

- **CORS Policies**: Explicit origin and credential handling configured in NestJS `app.enableCors()`.
- **Global Validation Pipes**: `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` strips unexpected payload properties and rejects malformed requests.
- **SQL Injection Defense**: Prisma ORM utilizes parameterized SQL queries by default, neutralizing standard injection vectors.
- **Rate Limiting**: Throttling guards on public endpoints (specifically `POST /api/auth/otp/send`) prevent brute-force attacks and email spamming.

---

## 3. Media & Upload Security

- **MIME & Extension Whitelisting**: The `/api/upload/video` endpoint verifies both file extension and MIME types against permitted video media formats (`video/mp4`, `video/webm`, `video/quicktime`).
- **File Renaming**: Uploaded files receive sanitized, cryptographically random timestamped filenames (`video-{timestamp}-{random}.ext`) to prevent path traversal and arbitrary file execution.
- **Filesize Boundaries**: File uploads enforce strict ceiling limits (500 MB max for videos) at the Multer layer and reverse proxy.

---

## 4. Role-Based Access Protection (RBAC)

- Admin endpoints (`/api/admin/*`, `/api/banners/admin/*`, `/api/notifications/admin/*`) require explicit `@Roles(Role.ADMIN, Role.SUPER_ADMIN)` combined with `RolesGuard`.
- Frontend navigation automatically enforces role checks and redirects unauthorized users away from admin views.

---

## 5. Secret & Key Isolation

- No API keys, database credentials, or private cryptographic keys are embedded in source code or client bundles.
- Frontend `.env` variables use the explicit `NEXT_PUBLIC_` namespace strictly for public identifiers (such as Google Client ID).
