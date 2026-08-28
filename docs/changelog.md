# MinnaUz 2.0 — Changelog

All notable changes, architectural updates, database migrations, and major feature additions are recorded in this document.

---

## [2.0.0] — 2026-08-28

### Added
- **Official Documentation Suite (`docs/`)**:
  - Established `docs/` as the single Source of Truth for architecture, database schema, API contracts, auth, plans, AI, and deployment.
- **Backend API Modular Monolith (`api/`)**:
  - NestJS application with Swagger documentation at `/api/docs`.
  - Prisma PostgreSQL database schema with models for Users, DeviceSessions, OTP Codes, Courses, Modules, Lessons, Kotoba, Bunpou, Kanji, Renshuu, UserProgress, StudyPlans, Activities, Banners, and Notifications.
  - Passwordless Email OTP authentication flow with Nodemailer.
  - Google OAuth integration and 3-device session limit enforcement.
  - Complete 5-tab Course & Lesson engine with quiz scoring and progress calculation.
  - Comprehensive Admin API for user management, course CMS, promotional banners, and targeted notifications.
  - Video upload handler supporting local static storage and YouTube embeddings.
- **Next.js 15 Web Application (`web/`)**:
  - Internationalized App Router supporting Uzbek (`/uz`) and Russian (`/ru`).
  - Modular Student Dashboard with global `DashboardTabContext` and dedicated tab components: `MainDashboard` (Asosiy / Home), `VocabTab` (Lugʻat), `GamesTab` (Oʻyinlar), `DokkayTab` (Dokkay), `KanjiTab` (Kanji), `StoreTab` (Doʻkon), `TranslateTab` (Tarjimon), `AiTab` (AI Ustoz), and `PremiumTab` (Premium Pro).
  - Interactive Course Roadmap and 5-section Lesson Studio (Kotoba, Bunpou, Kanji, Renshuu, Kaiwa).
  - Notification inbox with read-receipt tracking and deep-link routing.
  - Full-featured Admin backoffice portal under `/[locale]/admin`.
