const { v4: uuidv4 } = require('uuid');
const { supabase, isConfigured, inMemoryDb } = require('../config/db');

// GET /api/budget?month=YYYY-MM
const getBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .maybeSingle();

      if (error) throw error;
      return res.json({
        success: true,
        data: data || { monthly_budget: 0, month }
      });
    } else {
      const budget = inMemoryDb.budgets.find(b => b.user_id === userId && b.month === month);
      return res.json({
        success: true,
        data: budget || { monthly_budget: 0, month }
      });
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/budget or PUT /api/budget
const setBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { monthly_budget, month } = req.body;
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    if (isConfigured && supabase) {
      // Upsert budget record
      const { data, error } = await supabase
        .from('budgets')
        .upsert(
          { user_id: userId, monthly_budget: parseFloat(monthly_budget), month: targetMonth },
          { onConflict: 'user_id, month' }
        )
        .select('*')
        .single();

      if (error) throw error;
      return res.json({ success: true, message: 'Monthly budget saved successfully', data });
    } else {
      const index = inMemoryDb.budgets.findIndex(b => b.user_id === userId && b.month === targetMonth);
      
      if (index !== -1) {
        inMemoryDb.budgets[index].monthly_budget = parseFloat(monthly_budget);
        return res.json({ success: true, message: 'Monthly budget updated successfully', data: inMemoryDb.budgets[index] });
      } else {
        const newBudget = {
          id: uuidv4(),
          user_id: userId,
          monthly_budget: parseFloat(monthly_budget),
          month: targetMonth,
          created_at: new Date().toISOString()
        };
        inMemoryDb.budgets.push(newBudget);
        return res.json({ success: true, message: 'Monthly budget created successfully', data: newBudget });
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudget,
  setBudget
};
