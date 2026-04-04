const ChatSession = require('../models/ChatSession');

const knowledgeBase = [
  {
    topic: 'order tracking',
    patterns: ['track', 'where is my order', 'delivery status', 'order status'],
    answer: 'Open your Orders page and select Track. Status updates in real-time from restaurant acceptance to delivery.'
  },
  {
    topic: 'refund',
    patterns: ['refund', 'cancel order', 'money back'],
    answer: 'For eligible orders, refunds can be requested from your order details. Payment status updates will appear in your billing history.'
  },
  {
    topic: 'courier availability',
    patterns: ['courier', 'available', 'go online', 'delivery partner'],
    answer: 'Couriers can toggle availability in Courier Dashboard and share live location to receive nearby deliveries.'
  },
  {
    topic: 'restaurant onboarding',
    patterns: ['restaurant', 'merchant', 'onboarding', 'menu setup'],
    answer: 'Merchants should complete onboarding, then manage menu and orders from Merchant Dashboard.'
  },
  {
    topic: 'pricing',
    patterns: ['pricing', 'subscription', 'plan', 'billing'],
    answer: 'Pricing and subscription details are available in Pricing and Billing Settings pages.'
  }
];

const buildAssistantResponse = (question) => {
  const normalized = String(question || '').toLowerCase();
  const match = knowledgeBase.find(item =>
    item.patterns.some(pattern => normalized.includes(pattern))
  );

  if (match) return match.answer;

  return 'I can help with orders, deliveries, merchant onboarding, refunds, and billing. Ask a specific question and I will guide you.';
};

exports.askQuestion = async (req, res, next) => {
  try {
    const question = String(req.body.question || '').trim();
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Question is required'
      });
    }

    let session = await ChatSession.findOne({ user: req.user.id });
    if (!session) {
      session = await ChatSession.create({ user: req.user.id, messages: [] });
    }

    const answer = buildAssistantResponse(question);
    session.messages.push(
      { role: 'user', content: question },
      { role: 'assistant', content: answer }
    );
    await session.save();

    res.status(200).json({
      success: true,
      data: {
        answer,
        totalMessages: session.messages.length
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ user: req.user.id });
    res.status(200).json({
      success: true,
      data: {
        messages: session?.messages || []
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.clearHistory = async (req, res, next) => {
  try {
    await ChatSession.findOneAndUpdate(
      { user: req.user.id },
      { $set: { messages: [] } },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Chat history cleared'
    });
  } catch (error) {
    next(error);
  }
};
