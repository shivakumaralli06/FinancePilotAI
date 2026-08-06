const { v4: uuidv4 } = require('uuid');
const { supabase, isConfigured, inMemoryDb } = require('../config/db');

// GET /api/income
const getIncome = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, count: data.length, data });
    } else {
      const userIncomes = inMemoryDb.income
        .filter(i => i.user_id === userId)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      return res.json({ success: true, count: userIncomes.length, data: userIncomes });
    }
  } catch (error) {
    next(error);
  }
};

// POST /api/income
const createIncome = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { source, amount, date } = req.body;
    const incomeDate = date || new Date().toISOString().split('T')[0];

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('income')
        .insert([{ user_id: userId, source, amount: parseFloat(amount), date: incomeDate }])
        .select('*')
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Income record added successfully', data });
    } else {
      const newIncome = {
        id: uuidv4(),
        user_id: userId,
        source,
        amount: parseFloat(amount),
        date: incomeDate,
        created_at: new Date().toISOString()
      };
      inMemoryDb.income.push(newIncome);
      return res.status(201).json({ success: true, message: 'Income record added successfully', data: newIncome });
    }
  } catch (error) {
    next(error);
  }
};

// PUT /api/income/:id
const updateIncome = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { source, amount, date } = req.body;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('income')
        .update({ source, amount: parseFloat(amount), date })
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'Income record not found' });
      }

      return res.json({ success: true, message: 'Income record updated successfully', data });
    } else {
      const index = inMemoryDb.income.findIndex(i => i.id === id && i.user_id === userId);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Income record not found' });
      }

      inMemoryDb.income[index] = {
        ...inMemoryDb.income[index],
        source: source || inMemoryDb.income[index].source,
        amount: amount !== undefined ? parseFloat(amount) : inMemoryDb.income[index].amount,
        date: date || inMemoryDb.income[index].date
      };

      return res.json({ success: true, message: 'Income record updated successfully', data: inMemoryDb.income[index] });
    }
  } catch (error) {
    next(error);
  }
};

// DELETE /api/income/:id
const deleteIncome = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isConfigured && supabase) {
      const { error, count } = await supabase
        .from('income')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      return res.json({ success: true, message: 'Income record deleted successfully' });
    } else {
      const initialLength = inMemoryDb.income.length;
      inMemoryDb.income = inMemoryDb.income.filter(i => !(i.id === id && i.user_id === userId));

      if (inMemoryDb.income.length === initialLength) {
        return res.status(404).json({ success: false, message: 'Income record not found' });
      }

      return res.json({ success: true, message: 'Income record deleted successfully' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome
};
