const { v4: uuidv4 } = require('uuid');
const { supabase, isConfigured, inMemoryDb } = require('../config/db');

// GET /api/expenses
const getExpenses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, count: data.length, data });
    } else {
      const userExpenses = inMemoryDb.expenses
        .filter(e => e.user_id === userId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      return res.json({ success: true, count: userExpenses.length, data: userExpenses });
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/expenses
const createExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, category, amount, notes, date } = req.body;
    const expenseDate = date || new Date().toISOString().split('T')[0];

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{
          user_id: userId,
          title,
          category,
          amount: parseFloat(amount),
          notes: notes || '',
          date: expenseDate
        }])
        .select('*')
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Expense record created successfully', data });
    } else {
      const newExpense = {
        id: uuidv4(),
        user_id: userId,
        title,
        category,
        amount: parseFloat(amount),
        notes: notes || '',
        date: expenseDate,
        created_at: new Date().toISOString()
      };
      inMemoryDb.expenses.push(newExpense);
      return res.status(201).json({ success: true, message: 'Expense record created successfully', data: newExpense });
    }
  } catch (error) {
    next(error);
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, category, amount, notes, date } = req.body;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          title,
          category,
          amount: parseFloat(amount),
          notes: notes || '',
          date
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Expense record not found' });
      }

      return res.json({ success: true, message: 'Expense record updated successfully', data });
    } else {
      const index = inMemoryDb.expenses.findIndex(e => e.id === id && e.user_id === userId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Expense record not found' });
      }

      inMemoryDb.expenses[index] = {
        ...inMemoryDb.expenses[index],
        title: title || inMemoryDb.expenses[index].title,
        category: category || inMemoryDb.expenses[index].category,
        amount: amount !== undefined ? parseFloat(amount) : inMemoryDb.expenses[index].amount,
        notes: notes !== undefined ? notes : inMemoryDb.expenses[index].notes,
        date: date || inMemoryDb.expenses[index].date
      };

      return res.json({ success: true, message: 'Expense record updated successfully', data: inMemoryDb.expenses[index] });
    }
  } catch (error) {
    next(error);
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isConfigured && supabase) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return res.json({ success: true, message: 'Expense record deleted successfully' });
    } else {
      const initialLength = inMemoryDb.expenses.length;
      inMemoryDb.expenses = inMemoryDb.expenses.filter(e => !(e.id === id && e.user_id === userId));

      if (inMemoryDb.expenses.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Expense record not found' });
      }

      return res.json({ success: true, message: 'Expense record deleted successfully' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
};
