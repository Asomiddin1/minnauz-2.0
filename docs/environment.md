# MinnaUz 2.0 — Environment Configuration

This document catalogs all required and optional environment variables for the Backend API (`api/.env`) and Frontend Web (`web/.env`).

> [!WARNING]
> **Never commit real secrets or production credentials to documentation or source control.**

---

## 1. Backend API Environment Variables (`api/.env`)

```env
# ==============================================================================
# SERVER CONFIGURATION
# ==============================================================================
PORT=3001
NODE_ENV=development

# ==============================================================================
# DATABASE (PostgreSQL)
# ==============================================================================
DATABASE_URL="postgresql://postgres:password@localhost:5432/minnauz_db?schema=public"

# ==============================================================================
# JWT AUTHENTICATION
# ==============================================================================
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# ==============================================================================
# SMTP MAIL CONFIGURATION (Email OTP)
# ==============================================================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-specific-password"
SMTP_FROM="MinnaUz <no-reply@minna.uz>"

# ==============================================================================
# AI & SPEECH SERVICES (Optional / Production)
# ==============================================================================
OPENAI_API_KEY=""
GEMINI_API_KEY=""
AZURE_SPEECH_KEY=""
AZURE_SPEECH_REGION=""
```

---

## 2. Frontend Web Environment Variables (`web/.env`)

```env
# ==============================================================================
# API ENDPOINT
# ==============================================================================
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"

# ==============================================================================
# GOOGLE OAUTH
# ==============================================================================
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"

# ==============================================================================
# APPLICATION SETTINGS
# ==============================================================================
NEXT_PUBLIC_APP_NAME="MinnaUz"
NEXT_PUBLIC_DEFAULT_LOCALE="uz"
```
