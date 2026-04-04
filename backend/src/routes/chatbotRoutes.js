const express = require('express');
const { body } = require('express-validator');
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/history', protect, chatbotController.getHistory);
router.delete('/history', protect, chatbotController.clearHistory);
router.post(
  '/ask',
  protect,
  body('question')
    .isString()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Question must be between 1 and 1000 characters'),
  validate,
  chatbotController.askQuestion
);

module.exports = router;
