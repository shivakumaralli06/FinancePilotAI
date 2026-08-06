# 🚀 FinancePilot AI - Production-Ready Financial Assistant

FinancePilot AI is an enterprise-grade, full-stack SaaS financial co-pilot powered by **Google Gemini AI SDK (`@google/genai`)**, **Supabase PostgreSQL**, **Node.js Express**, and **React + Vite + Tailwind CSS**.

It empowers users to track income streams, categorize expenses, plan monthly budgets, visualize real-time Recharts analytics, calculate a dynamic Financial Health Score, receive personalized AI recommendations, and chat interactively with an AI Financial Advisor using their actual financial data.

---

## 🌟 Key Features Matrix

- 🔐 **JWT Authentication & Security**: Register, Login, Password Hashing (`bcrypt`), Helmet, CORS, and Express Rate Limiting.
- 📊 **Executive Dashboard**: Telemetry overview, 4 core metric cards (Total Income, Total Expenses, Net Savings, Budget Progress), recent activity log, and AI Health Score snippet.
- 💵 **Income Manager**: Full CRUD operations for income streams (Salary, Freelancing, Business, Investments) with sorting, searching, and modal forms.
- 💳 **Expense Tracker**: Categorized expense manager (Food, Travel, Rent, Bills, Education, Entertainment, etc.) with color badges, custom notes, date ranges, and search.
- 🎯 **Budget Planner**: Monthly budget allocation, percentage consumption progress meter, remaining balance calculation, and overbudget alerts.
- 📈 **Recharts Financial Analytics**: Interactive visual graphs including Category Pie Charts, Income vs Expense Bar Charts, and Monthly Trend Area Charts.
- 🤖 **Gemini AI Advisor Hub**: Real-time structured financial analysis powered by Google's `@google/genai` SDK generating Financial Health Score (0-100), Saving Tips, Budget Advice, and Historical Archive.
- 💬 **Interactive AI Chat**: Natural language financial co-pilot conversing using real user telemetry.
- 🌙 **Dark / Light Mode**: Dynamic theme switcher with persistent user preference storage.
- 📱 **Fully Responsive**: Sleek glassmorphism UI optimized for desktop, tablet, and mobile devices.

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Vite, React Router v6, Tailwind CSS v3, Recharts, Lucide Icons, Axios, Context API |
| **Backend** | Node.js, Express.js, JWT, bcryptjs, Zod, Helmet, Morgan, CORS, Express Rate Limit |
| **Database** | Supabase PostgreSQL, Row Level Security (RLS) |
| **AI Engine** | Google Gemini AI (`@google/genai` Official SDK) |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend), Supabase (Database) |

---

## 📂 Project Folder Structure

```
.
├── client/                     # React + Vite Frontend Application
│   ├── public/                 # Static assets & favicons
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Sidebar, Modals, Cards)
│   │   ├── context/            # React Context API state management (AuthContext)
│   │   ├── pages/              # View pages (Dashboard, Income, Expense, Analytics, AI Hub, Chat)
│   │   ├── services/           # Axios HTTP service wrappers & API endpoints
│   │   ├── App.jsx             # Root App Component with React Router routes
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Tailwind CSS directives & global glassmorphism styles
│   ├── .env.example            # Environment template for frontend
│   ├── .gitignore              # Git ignore rules for frontend
│   ├── package.json            # Frontend dependencies & build scripts
│   ├── tailwind.config.js      # Tailwind CSS theme configuration
│   └── vite.config.js          # Vite build & proxy settings
│
├── server/                     # Node.js + Express Backend API
│   ├── config/                 # Supabase & Google Gemini AI SDK initializers
│   ├── controllers/            # Controller business logic (Auth, Income, Expense, Budget, AI)
│   ├── middleware/             # Express Middlewares (Auth JWT, Validation, Error Handler)
│   ├── routes/                 # Express API router declarations
│   ├── supabase/               # Database migration scripts & PostgreSQL migration runner
│   ├── validators/             # Zod schema input validation
│   ├── .env.example            # Environment template for backend
│   ├── .gitignore              # Git ignore rules for backend
│   ├── index.js                # Express Server entry point
│   └── package.json            # Backend dependencies & npm scripts
│
├── supabase/                   # Supabase SQL Migrations
│   └── migrations/
│       └── 001_initial_schema.sql # PostgreSQL DDL Schema, RLS Policies, Seed Data
│
├── .gitignore                  # Global repository gitignore
├── CONTRIBUTING.md             # Open source contribution guide
├── LICENSE                     # MIT Open Source License
└── README.md                   # Project Documentation
```

---

## 🗄️ Database Schema & RLS Policies (PostgreSQL)

```sql
-- 1. USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. INCOME TABLE
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. EXPENSES TABLE
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BUDGETS TABLE
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monthly_budget NUMERIC(12, 2) NOT NULL CHECK (monthly_budget >= 0),
  month VARCHAR(7) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_month UNIQUE (user_id, month)
);

-- 5. AI REPORTS TABLE
CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_PASSWORD=your-database-password
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?sslmode=require
GOOGLE_API_KEY=your-google-gemini-api-key
```

### Frontend (`client/.env`)
Create `client/.env` based on `client/.env.example`:
```env
VITE_API_URL=/api
```

---

## 🚀 Quick Start Guide (Local Execution)

### 1. Clone Repository & Setup Backend
```bash
git clone https://github.com/your-username/financepilot-ai.git
cd financepilot-ai/server
npm install
```

Configure `server/.env` with your Supabase & Gemini credentials, then run the database migration runner:
```bash
npm run db:migrate
```

Start the backend Express server:
```bash
npm run dev
```
Backend API will start at `http://localhost:5000`.

### 2. Setup & Run Frontend
In a new terminal window:
```bash
cd financepilot-ai/client
npm install
npm run dev
```
Frontend React app will launch at `http://localhost:3000`.

---

## 📸 Screenshots & Visual Preview

| Dashboard Overview | AI Financial Advisor |
| :---: | :---: |
| *(Dashboard analytics, income vs expense graphs, and recent activity log)* | *(Gemini AI Health Score, tailored saving recommendations, and chat co-pilot)* |

---

## 🌐 Deployment Instructions

### Deploy Frontend to Vercel
1. Connect your GitHub repository to Vercel.
2. Select Root Directory: `client`.
3. Set Build Command: `npm run build`, Output Directory: `dist`.
4. Add Environment Variable `VITE_API_URL` pointing to your production backend API domain.

### Deploy Backend to Render / Railway
1. Create a New Web Service pointing to your repository.
2. Root Directory: `server`.
3. Build Command: `npm install`, Start Command: `node index.js`.
4. Configure environment variables (`JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `GOOGLE_API_KEY`).

---

## 🤝 Open Source Contribution

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on submitting pull requests and reporting issues.

---

## 📜 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for full details.
