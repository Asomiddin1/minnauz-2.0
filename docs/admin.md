# MinnaUz 2.0 — Admin Backoffice & CMS

This document describes the administrative interface, content authoring tools, user management, and broadcast systems.

---

## 1. Admin System Architecture

The MinnaUz Admin system is integrated directly into the Next.js web application under the `/[locale]/admin` route group, supported by dedicated NestJS `AdminModule` endpoints.

```text
Browser -> /app/[locale]/admin/* -> Next.js Protected Layout -> Role Check (ADMIN/SUPER_ADMIN/TEACHER)
                                           ↓
                               Backend /api/admin/* (Guarded by JwtAuthGuard & RolesGuard)
```

---

## 2. Core Administrative Subsystems

### 2.1 User Management (`/admin/users`)
- **Search & Pagination**: Live query filtering by name, email, or role.
- **Role Assignment**: Promote or demote users between `USER`, `TEACHER`, `ADMIN`, and `SUPER_ADMIN`.
- **Session Control**: View active device sessions per user and selectively revoke unauthorized sessions.
- **Account Actions**: Manual account creation, verification toggle, or deletion.

### 2.2 Course & Lesson CMS (`/admin/courses`)
- **Course Studio**: Create, edit, publish/unpublish courses, configure JLPT level, order, and assign authors.
- **Module Manager**: Reorder and organize course chapters.
- **Lesson Editor**: Add lessons, upload MP4/WebM video lectures, configure summary markdown, and design AI Kaiwa scenarios.
- **Content Tab Editors**:
  - **Kotoba Editor**: Add words, furigana readings, meanings in Uzbek/Russian, audio links, and example sentences.
  - **Bunpou Editor**: Define grammar patterns, explanations, and example matrices.
  - **Kanji Editor**: Configure kanji, onyomi/kunyomi, radicals, and stroke order visuals.
  - **Renshuu Editor**: Build multiple-choice quizzes, listening comprehension drills, and blank-fill exercises.

### 2.3 Promotional Banner Manager (`/admin/banners`)
- Create dynamic banners displayed on the student dashboard.
- Customize tag badges, icons, color gradients, and CTA buttons.
- Configure action triggers: external links (`LINK`), upgrade modal (`PLAN_MODAL`), or targeted notification views (`NOTIFICATION_DETAIL`).
- Drag-and-drop order prioritization.
- Target specific audiences (`ALL`, `USER`, `TEACHER`).

### 2.4 Notification Broadcasting Center (`/admin/notifications`)
- Send global announcements, maintenance notices, course release alerts, or promotional messages.
- Target audiences: All users, specific roles, or individual user IDs.
- Attach action links, thumbnail images, and detailed message bodies.
