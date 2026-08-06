const { z } = require('zod');

// Expense and Income Categories from Requirements
const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Education',
  'Entertainment',
  'Medical',
  'Investment',
  'Utilities',
  'Rent',
  'Others'
];

const INCOME_CATEGORIES = [
  'Salary',
  'Pocket Money',
  'Scholarship',
  'Freelancing',
  'Business',
  'Gift',
  'Other'
];

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

const incomeSchema = z.object({
  source: z.string().min(1, 'Income source is required').max(100),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  date: z.string().optional()
});

const expenseSchema = z.object({
  title: z.string().min(1, 'Expense title is required').max(200),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  date: z.string().optional()
});

const budgetSchema = z.object({
  monthly_budget: z.coerce.number().min(0, 'Budget must be zero or a positive number'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
});

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Please enter a valid email address')
});

const aiAnalyzeSchema = z.object({
  timeframe: z.string().optional()
});

const aiChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty')
});

module.exports = {
  registerSchema,
  loginSchema,
  incomeSchema,
  expenseSchema,
  budgetSchema,
  profileSchema,
  aiAnalyzeSchema,
  aiChatSchema,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES
};
