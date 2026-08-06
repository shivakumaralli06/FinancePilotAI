const express = require('express');
const { analyzeFinancials, chatWithAI, getReports } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { aiAnalyzeSchema, aiChatSchema } = require('../validators/schemas');

const router = express.Router();

router.use(authMiddleware);

router.post('/analyze', validate(aiAnalyzeSchema), analyzeFinancials);
router.post('/chat', validate(aiChatSchema), chatWithAI);
router.get('/reports', getReports);

module.exports = router;
