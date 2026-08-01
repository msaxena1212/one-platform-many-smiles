# Property Management System (PMS)
### Enterprise-grade, Multi-owner Hospitality & Booking Management Platform (Airbnb-like)

This production-grade, highly-extensible **SaaS Property Management System (PMS)** is built with Next.js 15+, NestJS, and PostgreSQL Prisma, organized as a cohesive monorepo using npm workspaces.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 15+, React 19, Tailwind CSS, Framer Motion, Recharts, Lucide Icons
* **Backend**: NestJS, Node.js, REST APIs, Prisma ORM, PostgreSQL, Redis cache layers
* **Packages**: Shared TypeScript Types, area/pricing utilities, centralized TSConfig configs
* **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD pipeline template

---

## 📂 Project Architecture

```text
/apps
    /pms-portal         # Next.js 15+ consolidated client hub (Guest, Owner, Admin, Staff Portals)
    /mobile-api         # Gateway NestJS API orchestrating modular services

/packages
    /database           # PostgreSQL schema models & seed scripts
    /types              # Shared TS interfaces
    /config             # Unified compiler settings
    /utils              # Area converters & pricing engines
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
* **Node.js** (v20+ recommended)
* **Docker** & **Docker Compose**

---

### Step 1: Install Dependencies
Run the install command at the root of the workspace. This automatically allocates dependencies across all workspaces:
```bash
npm install
```

---

### Step 2: Database Initialization & Seeding
Prepare your PostgreSQL instance connection variables inside a `.env` file or directly inside `packages/database`, then execute generation and seeding commands:

1. **Generate Prisma Client Types**:
   ```bash
   npm run db:generate
   ```
2. **Execute Database Seed script**:
   ```bash
   npm run db:seed
   ```

---

### Step 3: Local Dev Server Startup
You can launch both the frontend and backend applications simultaneously under developer runtime mode:
```bash
npm run dev
```

* **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
* **Backend NestJS Gateway**: [http://localhost:3001](http://localhost:3001)

---

### Step 4: Launch via Docker Compose
To build and spin up the complete isolated microservices ecosystem (Postgres, Redis, Gateway, Next.js):
```bash
docker-compose up --build
```

---

## 🌟 Premium System Features

1. **Multi-Role RBAC System**: Dynamically switches layouts between **Guest, Owner, Admin, and Operations Staff** profiles.
2. **Automatic UOM Converter**: Room area dimensions can be toggled on-the-fly between **Sq Ft, Sq Meters, Sq Yards, and Marlas** with exact mathematical precision.
3. **Overbooking Prevention**: Real-time validation checks for existing dates blocks, instantly denying conflicting requests.
4. **Operations checklists**: Cleaning crews can check off individual steps (sanitize bath, change sheet) updating clean logs live.
5. **Weighted review index**: Multi-factor ratings computation (Cleanliness, Staff, Value) producing overall scores.
6. **Recharts metrics widgets**: Renders business KPI graphs plotting revenue gross value (GBV), occupancy rates, and settlements splits.
