# Minnauz 2.0

Minnauz loyihasining yangi versiyasi. Ushbu loyiha asosan ikkita qismdan tashkil topgan: frontend uchun Web (Next.js) va backend uchun API (NestJS).

## Loyiha Tuzilmasi

- **/web** - Frontend ilovasi (Next.js). Odatiy holatda **3000** portda ishlaydi.
- **/api** - Backend API (NestJS). Odatiy holatda **3001** portda ishlaydi.

## Qanday Ishga Tushirish Kerak

### Frontend (Web)
```bash
cd web
npm install
npm run dev
```
Web ilova [http://localhost:3000](http://localhost:3000) manzilida ishga tushadi.

### Backend (API)
```bash
cd api
npm install
npm run start:dev
```
API ilova [http://localhost:3001](http://localhost:3001) manzilida ishga tushadi.

## Texnologiyalar
- **Web**: Next.js, React, Tailwind CSS
- **API**: NestJS, TypeScript, Prisma (yoki mavjud ORM)
