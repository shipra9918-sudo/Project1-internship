const Subscription = require('../models/Subscription');
const Workspace = require('../models/Workspace');
const Invoice = require('../models/Invoice');

// Pricing Plans Configuration
const PRICING_PLANS = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: {
      maxRestaurants: 1,
      maxOrders: 100,
      maxCouriers: 2,
      analyticsEnabled: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      whiteLabel: false,
      customDomain: false
    }
  },
  starter: {
    name: 'Starter',
    monthlyPrice: 49,
    yearlyPrice: 470,
    features: {
      maxRestaurants: 3,
      maxOrders: 1000,
      maxCouriers: 10,
      analyticsEnabled: true,
      customBranding: true,
      apiAccess: false,
      prioritySupport: false,
      whiteLabel: false,
      customDomain: false
    }
  },
  professional: {
    name: 'Professional',
    monthlyPrice: 149,
    yearlyPrice: 1430,
    features: {
      maxRestaurants: 10,
      maxOrders: 10000,
      maxCouriers: 50,
      analyticsEnabled: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      whiteLabel: false,
      customDomain: true
    }
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 499,
    yearlyPrice: 4790,
    features: {
      maxRestaurants: -1, // Unlimited
      maxOrders: -1,
      maxCouriers: -1,
      analyticsEnabled: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      whiteLabel: true,
      customDomain: true
    }
  }
};

// @desc    Get pricing plans
// @route   GET /api/subscriptions/pricing
// @access  Public
exports.getPricingPlans = async (req, res) => {
  try {
    res.json({
      success: true,
      plans: PRICING_PLANS
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing plans',
      error: error.message
    });
  }
};

// @desc    Get current subscription
// @route   GET /api/subscriptions/current
// @access  Private
exports.getCurrentSubscription = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ owner: req.user._id });
    
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    const subscription = await Subscription.findOne({ workspace: workspace._id });

    res.json({
      success: true,
      subscription,
      workspace: {
        name: workspace.name,
        slug: workspace.slug
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message
    });
  }
};

// @desc    Create or upgrade subscription
// @route   POST /api/subscriptions/subscribe
// @access  Private
exports.subscribe = async (req, res) => {
  try {
    const { plan, billingCycle, workspaceId } = req.body;

    if (!PRICING_PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected'
      });
    }

    const workspace = await Workspace.findById(workspaceId);
    
    if (!workspace || workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage this workspace'
      });
    }

    const planConfig = PRICING_PLANS[plan];
    const price = billingCycle === 'yearly' ? planConfig.yearlyPrice : planConfig.monthlyPrice;

    // Check if subscription exists
    let subscription = await Subscription.findOne({ workspace: workspace._id });

    if (subscription) {
      // Upgrade/downgrade existing subscription
      subscription.plan = plan;
      subscription.pricing.billingCycle = billingCycle;
      subscription.pricing.monthlyPrice = planConfig.monthlyPrice;
      subscription.pricing.yearlyPrice = planConfig.yearlyPrice;
      subscription.features = planConfig.features;
      subscription.status = plan === 'free' ? 'active' : 'trialing';
      
      if (plan !== 'free' && !subscription.trial.trialEndsAt) {
        subscription.trial.isTrialing = true;
        subscription.trial.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      }
    } else {
      // Create new subscription
      subscription = new Subscription({
        workspace: workspace._id,
        plan,
        pricing: {
          monthlyPrice: planConfig.monthlyPrice,
          yearlyPrice: planConfig.yearlyPrice,
          billingCycle
        },
        features: planConfig.features,
        status: plan === 'free' ? 'active' : 'trialing',
        trial: {
          isTrialing: plan !== 'free',
          trialEndsAt: plan !== 'free' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null,
          trialDays: 14
        },
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    await subscription.save();

    // Update workspace subscription reference
    workspace.subscription = subscription._id;
    await workspace.save();

    res.json({
      success: true,
      message: `Successfully subscribed to ${planConfig.name} plan`,
      subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
// @access  Private
exports.cancelSubscription = async (req, res) => {
  try {
    const { workspaceId } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    
    if (!workspace || workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const subscription = await Subscription.findOne({ workspace: workspace._id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    subscription.cancelAt = subscription.currentPeriodEnd;

    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of billing period',
      subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error canceling subscription',
      error: error.message
    });
  }
};

// @desc    Get usage statistics
// @route   GET /api/subscriptions/usage
// @access  Private
exports.getUsageStats = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ owner: req.user._id });
    
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    const subscription = await Subscription.findOne({ workspace: workspace._id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const usage = {
      restaurants: {
        current: subscription.usage.restaurants,
        limit: subscription.features.maxRestaurants,
        percentage: subscription.features.maxRestaurants > 0 
          ? (subscription.usage.restaurants / subscription.features.maxRestaurants) * 100 
          : 0
      },
      orders: {
        current: subscription.usage.ordersThisMonth,
        limit: subscription.features.maxOrders,
        percentage: subscription.features.maxOrders > 0
          ? (subscription.usage.ordersThisMonth / subscription.features.maxOrders) * 100
          : 0
      },
      couriers: {
        current: subscription.usage.couriers,
        limit: subscription.features.maxCouriers,
        percentage: subscription.features.maxCouriers > 0
          ? (subscription.usage.couriers / subscription.features.maxCouriers) * 100
          : 0
      }
    };

    res.json({
      success: true,
      usage,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        trialDaysRemaining: subscription.trialDaysRemaining
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching usage stats',
      error: error.message
    });
  }
};

// @desc    Get invoices
// @route   GET /api/subscriptions/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ owner: req.user._id });
    
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found'
      });
    }

    const invoices = await Invoice.find({ workspace: workspace._id })
      .sort({ createdAt: -1 })
      .limit(12);

    res.json({
      success: true,
      invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    });
  }
};

module.exports = exports;
