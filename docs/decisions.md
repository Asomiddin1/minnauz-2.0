# MinnaUz 2.0 — Architectural Decision Records (ADRs)

This document records the foundational technical and architectural decisions made for the MinnaUz platform.

---

## ADR-001: NestJS for Backend API
- **Date**: 2026-08-28
- **Status**: Accepted
- **Context**: Needed an enterprise-grade, strongly typed, modular Node.js framework with built-in dependency injection, validation pipes, and automated Swagger OpenAPI documentation.
- **Decision**: Adopt NestJS with TypeScript as the primary backend framework.
- **Alternatives Considered**: Express (lacks structured DI architecture), Fastify raw (more boilerplate needed for enterprise modularity).

---

## ADR-002: Next.js 15 App Router for Frontend & Admin
- **Date**: 2026-08-28
- **Status**: Accepted
- **Context**: Required a high-performance React framework supporting modern SSR/SSG, internationalized routing (`/[locale]`), nested layouts, and unified administration dashboards.
- **Decision**: Use Next.js 15 with React 19 and Tailwind CSS.
- **Alternatives Considered**: Vite SPA (weaker SEO and dynamic OpenGraph capabilities for courses), separate Admin React app (redundant build pipelines and authentication duplication).

---

## ADR-003: Prisma ORM with PostgreSQL
- **Date**: 2026-08-28
- **Status**: Accepted
- **Context**: Needed an intuitive, type-safe data access layer with robust migration capabilities and relational modeling.
- **Decision**: Adopt Prisma ORM backed by PostgreSQL.
- **Alternatives Considered**: TypeORM (more verbose entity decorators, less deterministic typing), raw SQL (lacks automatic TypeScript type generation).

---

## ADR-004: Passwordless Email OTP & 3-Device Session Limit
- **Date**: 2026-08-28
- **Status**: Accepted
- **Context**: Users frequently forget passwords. Simultaneously, Japanese course materials require protection against unauthorized shared account access.
- **Decision**: Implement passwordless email OTP (6 digits, 5-minute validity) alongside Google OAuth, enforcing a maximum of 3 concurrent active devices per account.
- **Alternatives Considered**: Password-based login with email verification (higher onboarding friction, password reset overhead).

---

## ADR-005: 5-Part Lesson Pedagogy (Kotoba, Bunpou, Kanji, Renshuu, Kaiwa)
- **Date**: 2026-08-28
- **Status**: Accepted
- **Context**: Japanese language acquisition requires a multi-dimensional approach combining vocabulary, grammar, kanji characters, practice tests, and conversational application.
- **Decision**: Standardize all lessons across MinnaUz into 5 distinct, sequential interactive tabs.
- **Alternatives Considered**: Linear article-style text pages (poor engagement and fragmented retention).

---

## ADR-006: Unified Admin Portal within Next.js
- **Date**: 2026-08-28
- **Status**: Accepted
- **Context**: Managing courses, lessons, users, banners, and notifications should be immediate without deploying a separate micro-frontend.
- **Decision**: House the admin portal inside `web/app/[locale]/admin` guarded by layout-level role verification and protected backend endpoints.
- **Alternatives Considered**: Standalone admin panel on a separate domain (unnecessary operational complexity).
