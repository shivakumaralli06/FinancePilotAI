const express = require('express');
const { getIncome, createIncome, updateIncome, deleteIncome } = require('../controllers/incomeController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { incomeSchema } = require('../validators/schemas');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getIncome);
router.post('/', validate(incomeSchema), createIncome);
router.put('/:id', validate(incomeSchema), updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;
