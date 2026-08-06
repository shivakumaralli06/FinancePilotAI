const express = require('express');
const { getBudget, setBudget } = require('../controllers/budgetController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { budgetSchema } = require('../validators/schemas');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getBudget);
router.post('/', validate(budgetSchema), setBudget);
router.put('/', validate(budgetSchema), setBudget);

module.exports = router;
