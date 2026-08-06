const { v4: uuidv4 } = require('uuid');
const { aiClient } = require('../config/gemini');
const { supabase, isConfigured, inMemoryDb } = require('../config/db');

// Helper to fetch user data for analysis
async function getUserFinancialContext(userId) {
  let incomes = [];
  let expenses = [];
  let budgetAmount = 0;

  const currentMonth = new Date().toISOString().slice(0, 7);

  if (isConfigured && supabase) {
    const [incRes, expRes, budRes] = await Promise.all([
      supabase.from('income').select('*').eq('user_id', userId),
      supabase.from('expenses').select('*').eq('user_id', userId),
      supabase.from('budgets').select('*').eq('user_id', userId).eq('month', currentMonth).maybeSingle()
    ]);

    incomes = incRes.data || [];
    expenses = expRes.data || [];
    budgetAmount = budRes.data ? parseFloat(budRes.data.monthly_budget) : 0;
  } else {
    incomes = inMemoryDb.income.filter(i => i.user_id === userId);
    expenses = inMemoryDb.expenses.filter(e => e.user_id === userId);
    const budgetObj = inMemoryDb.budgets.find(b => b.user_id === userId && b.month === currentMonth);
    budgetAmount = budgetObj ? parseFloat(budgetObj.monthly_budget) : 0;
  }

  const totalIncome = incomes.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const savings = totalIncome - totalExpense;

  // Category breakdown
  const categoryTotals = {};
  expenses.forEach(exp => {
    const cat = exp.category || 'Others';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(exp.amount);
  });

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const highestExpenseCategory = sortedCategories.length > 0 ? sortedCategories[0][0] : 'None';
  const lowestExpenseCategory = sortedCategories.length > 0 ? sortedCategories[sortedCategories.length - 1][0] : 'None';

  return {
    incomes,
    expenses,
    budgetAmount,
    totalIncome,
    totalExpense,
    savings,
    categoryTotals,
    highestExpenseCategory,
    lowestExpenseCategory,
    sortedCategories
  };
}

// Internal fallback rule engine for structured advisory
function generateSmartFallbackReport(finData) {
  const { totalIncome, totalExpense, savings, budgetAmount, highestExpenseCategory, categoryTotals } = finData;

  let score = 70;
  if (totalIncome > 0) {
    const savingsRatio = (savings / totalIncome);
    if (savingsRatio >= 0.3) score += 20;
    else if (savingsRatio >= 0.15) score += 10;
    else if (savingsRatio < 0) score -= 25;
  }

  if (budgetAmount > 0) {
    const usage = (totalExpense / budgetAmount) * 100;
    if (usage > 100) score -= 15;
    else if (usage <= 80) score += 5;
  }

  score = Math.min(100, Math.max(10, Math.round(score)));

  const savingTips = [];
  if (highestExpenseCategory !== 'None') {
    savingTips.push(`Cut back 10-15% on ${highestExpenseCategory} to boost monthly net savings.`);
  }
  if (categoryTotals['Food'] && categoryTotals['Food'] > 300) {
    savingTips.push('Plan meal prep on weekends to reduce frequent food delivery and dining out costs.');
  }
  if (categoryTotals['Entertainment'] && categoryTotals['Entertainment'] > 100) {
    savingTips.push('Audit active digital streaming services and pause unused subscriptions.');
  }
  if (savingTips.length === 0) {
    savingTips.push('Automate 20% of income directly into a high-yield savings or emergency buffer fund.');
    savingTips.push('Build a 3 to 6-month liquid emergency fund before aggressively expanding investments.');
  }

  const isOverbudget = budgetAmount > 0 && totalExpense > budgetAmount;
  const budgetAdvice = budgetAmount > 0 
    ? (isOverbudget 
        ? `Alert: You are currently exceeding your monthly target budget of $${budgetAmount.toFixed(2)} by $${(totalExpense - budgetAmount).toFixed(2)}.`
        : `Great work! You have utilized ${((totalExpense / budgetAmount) * 100).toFixed(1)}% of your $${budgetAmount.toFixed(2)} monthly budget.`)
    : 'Set a defined monthly budget target in the Budget tab to track spending velocity effectively.';

  const monthlyInsights = [
    `Total Income: $${totalIncome.toFixed(2)} across ${finData.incomes.length} records.`,
    `Total Expenses: $${totalExpense.toFixed(2)} across ${finData.expenses.length} records.`,
    `Net Savings: $${savings.toFixed(2)} (${totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0}% savings rate).`,
    `Primary Spending Driver: ${highestExpenseCategory} at $${(categoryTotals[highestExpenseCategory] || 0).toFixed(2)}.`
  ];

  return {
    summary: `Based on your live financial telemetry, your net monthly position stands at $${savings.toFixed(2)} with a financial health rating of ${score}/100.`,
    financialHealthScore: score,
    highestExpenseCategory: highestExpenseCategory,
    savingTips: savingTips,
    budgetAdvice: budgetAdvice,
    monthlyInsights: monthlyInsights,
    motivation: score >= 75 
      ? 'Outstanding financial discipline! Maintain this strong momentum towards your wealth-building goals.' 
      : 'Small consistent daily choices create massive long-term financial freedom. Keep optimizing!'
  };
}

// POST /api/ai/analyze
const analyzeFinancials = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const finData = await getUserFinancialContext(userId);

    let reportData = null;

    // Try Google Gemini SDK (@google/genai)
    if (aiClient) {
      try {
        const prompt = `
System Persona: You are FinancePilot AI, a premier personal financial advisor.
Analyze the user's REAL financial dataset below and generate a personalized JSON financial analysis report.

User Telemetry Data:
- Total Income: $${finData.totalIncome}
- Total Expenses: $${finData.totalExpense}
- Net Savings: $${finData.savings}
- Monthly Budget Target: $${finData.budgetAmount}
- Expense Categories Breakdown: ${JSON.stringify(finData.categoryTotals)}
- Highest Expense Category: ${finData.highestExpenseCategory}
- Lowest Expense Category: ${finData.lowestExpenseCategory}

MANDATORY RULES:
1. You MUST return ONLY valid JSON matching this exact structure:
{
 "summary": "Detailed summary paragraph referencing user's numbers",
 "financialHealthScore": 85,
 "highestExpenseCategory": "${finData.highestExpenseCategory}",
 "savingTips": ["Tip 1 tailored to user data", "Tip 2", "Tip 3"],
 "budgetAdvice": "Advice on user's current budget usage",
 "monthlyInsights": ["Key insight 1 with exact numbers", "Key insight 2", "Key insight 3"],
 "motivation": "Encouraging closing advice"
}
2. Never return markdown code blocks, backticks, or any non-JSON conversational text.
3. Keep financialHealthScore an integer between 0 and 100 based strictly on data analysis.
`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt
        });

        let responseText = response.text || (response.candidates && response.candidates[0]?.content?.parts[0]?.text);
        if (responseText) {
          // Clean possible JSON backticks
          responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          reportData = JSON.parse(responseText);
        }
      } catch (geminiError) {
        console.warn('⚠️ Gemini AI SDK analysis call fallback trigger:', geminiError.message);
      }
    }

    if (!reportData) {
      reportData = generateSmartFallbackReport(finData);
    }

    // Save generated report into database
    let savedReport = null;
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('ai_reports')
        .insert([{ user_id: userId, report: reportData }])
        .select('*')
        .single();
      
      if (!error) savedReport = data;
    } else {
      savedReport = {
        id: uuidv4(),
        user_id: userId,
        report: reportData,
        created_at: new Date().toISOString()
      };
      inMemoryDb.ai_reports.push(savedReport);
    }

    return res.json({
      success: true,
      message: 'AI Financial Analysis generated successfully',
      data: reportData,
      reportId: savedReport ? savedReport.id : null
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/chat
const chatWithAI = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;
    const finData = await getUserFinancialContext(userId);

    let reply = '';

    if (aiClient) {
      try {
        const prompt = `
You are FinancePilot AI, an intelligent personal financial co-pilot.
The user is asking you a question: "${message}"

User's Real Financial Context:
- Total Income: $${finData.totalIncome}
- Total Expenses: $${finData.totalExpense}
- Net Savings: $${finData.savings}
- Monthly Budget: $${finData.budgetAmount}
- Top Expense Category: ${finData.highestExpenseCategory}
- Expense Categories: ${JSON.stringify(finData.categoryTotals)}

Instructions:
1. Provide a direct, professional, friendly, and actionable answer.
2. Refer explicitly to their real numbers when relevant (e.g. income, expenses, top spending category).
3. Do not output raw JSON for chat - respond in natural, formatted Markdown text with bullet points if helpful.
`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt
        });

        reply = response.text || (response.candidates && response.candidates[0]?.content?.parts[0]?.text);
      } catch (err) {
        console.warn('⚠️ Gemini Chat fallback trigger:', err.message);
      }
    }

    if (!reply) {
      // Intelligent Contextual Fallback Reply
      const query = message.toLowerCase();
      if (query.includes('save') || query.includes('saving')) {
        reply = `To boost your net savings from $${finData.savings.toFixed(2)}, focus on your highest spending area, **${finData.highestExpenseCategory}** ($${(finData.categoryTotals[finData.highestExpenseCategory] || 0).toFixed(2)}). Setting a monthly spending cap on this category can free up significant liquidity each month!`;
      } else if (query.includes('budget')) {
        reply = finData.budgetAmount > 0
          ? `Your target monthly budget is **$${finData.budgetAmount.toFixed(2)}**. You've spent **$${finData.totalExpense.toFixed(2)}**, leaving **$${Math.max(0, finData.budgetAmount - finData.totalExpense).toFixed(2)}** remaining.`
          : `You currently haven't set a budget. Go to the Budget tab to set a monthly spending cap and stay on top of your goals!`;
      } else if (query.includes('income')) {
        reply = `You have recorded a total income of **$${finData.totalIncome.toFixed(2)}** across **${finData.incomes.length}** sources. Maintaining diverse income streams is a great step toward long-term financial security!`;
      } else {
        reply = `As your FinancePilot AI, I see your current net balance is **$${finData.savings.toFixed(2)}** with total expenses of **$${finData.totalExpense.toFixed(2)}**. Your largest expense category is **${finData.highestExpenseCategory}**. How can I help you optimize your portfolio or daily spending today?`;
      }
    }

    return res.json({
      success: true,
      reply,
      userContext: {
        totalIncome: finData.totalIncome,
        totalExpense: finData.totalExpense,
        savings: finData.savings,
        highestExpenseCategory: finData.highestExpenseCategory
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reports
const getReports = async (req, res, next) => {
  try {
    const userId = req.user.id;

    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json({ success: true, count: data.length, data });
    } else {
      const userReports = inMemoryDb.ai_reports
        .filter(r => r.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.json({ success: true, count: userReports.length, data: userReports });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeFinancials,
  chatWithAI,
  getReports
};
