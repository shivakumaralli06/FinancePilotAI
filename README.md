# 🚀 FinancePilot AI - AI-Powered Personalized Finance Assistant

"FinancePilot AI" is an enterprise-grade, full-stack SaaS financial co-pilot powered by **Google Gemini 2.5 AI SDK (`@google/genai`)**, **Supabase PostgreSQL**, **Node.js Express**, and **React + Vite + Tailwind CSS**.

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

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
```

---

## 📡 Backend API Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | No |
| `GET` | `/api/profile` | Retrieve user profile | Yes |
| `PUT` | `/api/profile` | Update user profile details | Yes |
| `GET` | `/api/income` | Fetch all user income records | Yes |
| `POST` | `/api/income` | Create new income entry | Yes |
| `PUT` | `/api/income/:id` | Update existing income entry | Yes |
| `DELETE` | `/api/income/:id` | Delete income entry | Yes |
| `GET` | `/api/expenses` | Fetch all user expense records | Yes |
| `POST` | `/api/expenses` | Create new expense record | Yes |
| `PUT` | `/api/expenses/:id` | Update expense record | Yes |
| `DELETE` | `/api/expenses/:id` | Delete expense record | Yes |
| `GET` | `/api/budget` | Get monthly budget for specified month | Yes |
| `POST` | `/api/budget` | Set or update monthly budget | Yes |
| `POST` | `/api/ai/analyze` | Run Gemini AI analysis on user data | Yes |
| `POST` | `/api/ai/chat` | Send message to AI Financial Co-Pilot | Yes |
| `GET` | `/api/reports` | Fetch historical saved AI reports | Yes |

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=financepilot_super_secret_jwt_key_2026
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GOOGLE_API_KEY=your-google-gemini-api-key
```

### Frontend (`client/.env`)
```env
VITE_API_URL=/api
```

---

## 🚀 Quick Start Guide (Local Execution)

### 1. Clone & Setup Backend
```bash
cd server
npm install
```
Configure your environment variables in `server/.env` (including `DATABASE_URL` or `SUPABASE_URL` + `SUPABASE_DB_PASSWORD`). Then run the PostgreSQL migration script:
```bash
npm run db:migrate
```
Start the development server:
```bash
npm run dev
```
Backend server will start at `http://localhost:5000`.

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev
```
Frontend React app will launch at `http://localhost:3000`.

---

## 🌐 Deployment Instructions

### Deploy Frontend to Vercel
1. Push workspace to GitHub.
2. Connect GitHub repository to Vercel.
3. Set Build Settings:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Configure Environment Variable `VITE_API_URL` pointing to your deployed backend URL.

### Deploy Backend to Render
1. Create a New Web Service on Render.
2. Select repository and set Root Directory: `server`.
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. Configure environment variables (`JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_KEY`, `GOOGLE_API_KEY`).

---

## 🏆 Hackathon Demo Account
- **Demo Email**: `demo@financepilot.ai`
- **Demo Password**: `password123`
