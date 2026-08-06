-- Migration: 001_initial_schema.sql
-- Description: Create initial tables, enable RLS with policies, and insert seed data.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. INCOME TABLE
CREATE TABLE IF NOT EXISTS income (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
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
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monthly_budget NUMERIC(12, 2) NOT NULL CHECK (monthly_budget >= 0),
  month VARCHAR(7) NOT NULL, -- Format YYYY-MM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_month UNIQUE (user_id, month)
);

-- 5. AI REPORTS TABLE
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR OPTIMAL QUERY SPEED
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_budgets_user_month ON budgets(user_id, month);
CREATE INDEX IF NOT EXISTS idx_ai_reports_user ON ai_reports(user_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

-- DROP EXISTING POLICIES TO AVOID CONFLICTS
DROP POLICY IF EXISTS "Users can read own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Users can read own income" ON income;
DROP POLICY IF EXISTS "Users can insert own income" ON income;
DROP POLICY IF EXISTS "Users can update own income" ON income;
DROP POLICY IF EXISTS "Users can delete own income" ON income;
DROP POLICY IF EXISTS "Users can read own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can read own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can read own ai_reports" ON ai_reports;
DROP POLICY IF EXISTS "Users can insert own ai_reports" ON ai_reports;

-- CREATE RLS POLICIES
-- Supporting both standard auth.uid() (if using Supabase Auth) and transaction session parameters (if using custom Express JWT)
-- We check: user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid

-- users Policies
CREATE POLICY "Users can read own record" ON users FOR SELECT 
  USING (id = auth.uid() OR id = nullif(current_setting('app.current_user_id', true), '')::uuid);
CREATE POLICY "Users can update own record" ON users FOR UPDATE 
  USING (id = auth.uid() OR id = nullif(current_setting('app.current_user_id', true), '')::uuid);

-- income Policies
CREATE POLICY "Users can read own income" ON income FOR SELECT 
  USING (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);
CREATE POLICY "Users can insert own income" ON income FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);
CREATE POLICY "Users can update own income" ON income FOR UPDATE 
  USING (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);
CREATE POLICY "Users can delete own income" ON income FOR DELETE 
  USING (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

-- expenses Policies
CREATE POLICY "Users can read own expenses" ON expenses FOR SELECT 
  USING (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);
CREATE POLICY "Users can insert own expenses" ON expenses FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);
CREATE POLICY "Users can update own expenses" ON expenses FOR UPDATE 
  USING (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);
CREATE POLICY "Users can delete own expenses" ON expenses FOR DELETE 
  USING (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

-- budgets Policies
CREATE POLICY "Users can read own budgets" ON budgets FOR SELECT 
  USING (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE 
  USING (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE 
  USING (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);

-- ai_reports Policies
CREATE POLICY "Users can read own ai_reports" ON ai_reports FOR SELECT 
  USING (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);
CREATE POLICY "Users can insert own ai_reports" ON ai_reports FOR INSERT 
  WITH CHECK (user_id = auth.uid() OR user_id = nullif(current_setting('app.current_user_id', true), '')::uuid);


-- ====================================================================
-- SEED DATA (Creates primary default pilot account)
-- ====================================================================

-- 1. Insert seed user: Alex Morgan (demo@financepilot.ai / password123)
-- Password hash generated using bcrypt with salt strength 10
INSERT INTO users (id, name, email, password_hash, created_at)
VALUES (
  'a8b792e4-938d-4a11-8be2-72c114f6e1f0',
  'Alex Morgan',
  'demo@financepilot.ai',
  '$2a$10$wKxN/9Q16zI7nU71Y2Q6eO7F5B/Yp3tZp0uYI2c2.r5.i9p8e2z6G', -- bcrypt hash for 'password123'
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert seed income entries
INSERT INTO income (id, user_id, source, amount, date)
VALUES 
  ('11f7c870-07bf-4f51-b0db-6e6a14be20c1', 'a8b792e4-938d-4a11-8be2-72c114f6e1f0', 'Salary', 5200.00, CURRENT_DATE),
  ('22f7c870-07bf-4f51-b0db-6e6a14be20c2', 'a8b792e4-938d-4a11-8be2-72c114f6e1f0', 'Freelancing', 850.00, CURRENT_DATE),
  ('33f7c870-07bf-4f51-b0db-6e6a14be20c3', 'a8b792e4-938d-4a11-8be2-72c114f6e1f0', 'Investment', 320.00, CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert seed expense entries
INSERT INTO expenses (id, user_id, title, category, amount, notes, date)
VALUES 
  ('55f7c870-07bf-4f51-b0db-6e6a14be20c5', 'a8b792e4-938d-4a11-8be2-72c114f6e1f0', 'Apartment Rent', 'Rent', 1500.00, 'Monthly apartment rent', CURRENT_DATE),
  ('66f7c870-07bf-4f51-b0db-6e6a14be20c6', 'a8b792e4-938d-4a11-8be2-72c114f6e1f0', 'Groceries Shopping', 'Food', 420.50, 'Weekly organic groceries', CURRENT_DATE),
  ('77f7c870-07bf-4f51-b0db-6e6a14be20c7', 'a8b792e4-938d-4a11-8be2-72c114f6e1f0', 'Electricity & Water', 'Utilities', 180.00, 'Electric & water bills', CURRENT_DATE),
  ('88f7c870-07bf-4f51-b0db-6e6a14be2088', 'a8b792e4-938d-4a11-8be2-72c114f6e1f0', 'Ergonomic Keyboard', 'Shopping', 299.99, 'Mechanical keyboard purchase', CURRENT_DATE),
  ('99f7c870-07bf-4f51-b0db-6e6a14be20c9', 'a8b792e4-938d-4a11-8be2-72c114f6e1f0', 'Streaming Services', 'Entertainment', 45.00, 'Netflix, Spotify & Disney+', CURRENT_DATE)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert seed budget entry
INSERT INTO budgets (id, user_id, monthly_budget, month)
VALUES (
  'eef7c870-07bf-4f51-b0db-6e6a14be20cc',
  'a8b792e4-938d-4a11-8be2-72c114f6e1f0',
  3500.00,
  TO_CHAR(CURRENT_DATE, 'YYYY-MM')
)
ON CONFLICT (user_id, month) DO NOTHING;
