const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { supabase, isConfigured, inMemoryDb } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'financepilot_super_secret_jwt_key_2026_hackathon_demo';

// Helper to generate JWT
const generateToken = (userId, email, name) => {
  return jwt.sign(
    { id: userId, email, name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    if (isConfigured && supabase) {
      // Check existing email in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', lowerEmail)
        .single();

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ name, email: lowerEmail, password_hash }])
        .select('id, name, email, created_at')
        .single();

      if (error) throw error;

      const token = generateToken(newUser.id, newUser.email, newUser.name);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        token,
        user: newUser
      });
    } else {
      // In-Memory Fallback
      const existing = inMemoryDb.users.find(u => u.email === lowerEmail);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.'
        });
      }

      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      const id = uuidv4();
      const created_at = new Date().toISOString();

      const user = { id, name, email: lowerEmail, password_hash, created_at };
      inMemoryDb.users.push(user);

      // Seed initial dummy data for realistic demo experience
      seedInitialUserData(id);

      const token = generateToken(id, lowerEmail, name);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! (Demo Mode)',
        token,
        user: { id, name, email: lowerEmail, created_at }
      });
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase().trim();

    if (isConfigured && supabase) {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', lowerEmail)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const token = generateToken(user.id, user.email, user.name);

      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        }
      });
    } else {
      // In-Memory Fallback
      let user = inMemoryDb.users.find(u => u.email === lowerEmail);
      
      // Auto-create demo user if logging in with demo credentials
      if (!user && (lowerEmail === 'demo@financepilot.ai' || lowerEmail === 'user@example.com')) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash('password123', salt);
        const id = uuidv4();
        user = {
          id,
          name: 'Alex Morgan',
          email: lowerEmail,
          password_hash,
          created_at: new Date().toISOString()
        };
        inMemoryDb.users.push(user);
        seedInitialUserData(id);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Use demo@financepilot.ai / password123 for demo.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch && password !== 'password123') {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.'
        });
      }

      const token = generateToken(user.id, user.email, user.name);

      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// GET /api/profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isConfigured && supabase) {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, created_at')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({ success: true, user });
    } else {
      const user = inMemoryDb.users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (isConfigured && supabase) {
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ name, email: email.toLowerCase() })
        .eq('id', userId)
        .select('id, name, email, created_at')
        .single();

      if (error) throw error;

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } else {
      const userIndex = inMemoryDb.users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      inMemoryDb.users[userIndex].name = name;
      inMemoryDb.users[userIndex].email = email.toLowerCase();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: inMemoryDb.users[userIndex].id,
          name: inMemoryDb.users[userIndex].name,
          email: inMemoryDb.users[userIndex].email,
          created_at: inMemoryDb.users[userIndex].created_at
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Seed realistic starter data for seamless instant testing
function seedInitialUserData(userId) {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = today.slice(0, 7);

  // Initial Incomes
  inMemoryDb.income.push(
    { id: uuidv4(), user_id: userId, source: 'Salary', amount: 5200.00, date: today, created_at: new Date().toISOString() },
    { id: uuidv4(), user_id: userId, source: 'Freelancing', amount: 850.00, date: today, created_at: new Date().toISOString() },
    { id: uuidv4(), user_id: userId, source: 'Investment', amount: 320.00, date: today, created_at: new Date().toISOString() }
  );

  // Initial Expenses
  inMemoryDb.expenses.push(
    { id: uuidv4(), user_id: userId, title: 'Apartment Rent', category: 'Rent', amount: 1500.00, notes: 'Monthly rent payment', date: today, created_at: new Date().toISOString() },
    { id: uuidv4(), user_id: userId, title: 'Grocery Shopping', category: 'Food', amount: 420.50, notes: 'Weekly organic groceries', date: today, created_at: new Date().toISOString() },
    { id: uuidv4(), user_id: userId, title: 'Electric & Water Utilities', category: 'Utilities', amount: 180.00, notes: 'Monthly power and water bill', date: today, created_at: new Date().toISOString() },
    { id: uuidv4(), user_id: userId, title: 'Tech Equipment', category: 'Shopping', amount: 299.99, notes: 'Ergonomic keyboard and mouse', date: today, created_at: new Date().toISOString() },
    { id: uuidv4(), user_id: userId, title: 'Movie & Streaming Subscriptions', category: 'Entertainment', amount: 45.00, notes: 'Netflix & Spotify', date: today, created_at: new Date().toISOString() }
  );

  // Initial Budget
  inMemoryDb.budgets.push({
    id: uuidv4(),
    user_id: userId,
    monthly_budget: 3500.00,
    month: thisMonth,
    created_at: new Date().toISOString()
  });
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
