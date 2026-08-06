const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;
let isConfigured = false;

if (
  supabaseUrl && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' && 
  supabaseKey && 
  supabaseKey !== 'your-supabase-service-role-key'
) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    isConfigured = true;
    console.log('✅ Supabase Client initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Could not initialize Supabase Client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase not configured with live credentials. Operating with in-memory storage fallback.');
}

// In-Memory Storage Fallback for immediate zero-config out-of-the-box execution
const inMemoryDb = {
  users: [],
  income: [],
  expenses: [],
  budgets: [],
  ai_reports: []
};

module.exports = {
  supabase,
  isConfigured,
  inMemoryDb
};
