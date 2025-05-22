# 🚀 Express TypeScript Starter

A robust **Express.js** backend template built with **TypeScript**, **Prisma ORM**, and comprehensive **authentication**. This production-ready starter includes everything you need to build secure, scalable APIs—without the boilerplate.

---

## ✨ Features

- 🔐 **Authentication** — JWT-based access and refresh tokens  
- 👤 **User Management** — CRUD operations with role-based authorization  
- 📁 **File Uploads** — Upload and validate profile photos  
- 🛠️ **TypeScript** — Type-safe development experience  
- 🗄️ **Prisma ORM** — Modern database toolkit (MySQL)  
- 📏 **Zod Validation** — Schema-based request validation  
- 📊 **Pagination** — Easy paginated API responses  
- 📝 **Logging** — Structured logs with Winston + Morgan  
- 🚀 **Production Ready** — Secure, scalable, and cleanly structured  

---

## ⚡ Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/ahitabisma/express-ts-starter.git
cd express-ts-starter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the .env file with your configuration

### 4. Set up the database

Run migrations:

```bash
npx prisma migrate dev
```

Seed the database:

```bash
npx prisma db seed
```

### 5. Start Server

```bash
npm run dev
```
