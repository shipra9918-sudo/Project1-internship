const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const Workspace = require('../models/Workspace');

class PaymentService {
  // Create Stripe customer
  async createCustomer(workspace, user) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: workspace.name,
        metadata: {
          workspaceId: workspace._id.toString(),
          userId: user._id.toString()
        }
      });

      return customer;
    } catch (error) {
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  // Create subscription in Stripe
  async createStripeSubscription(customerId, priceId, trialDays = 14) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialDays,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });

      return subscription;
    } catch (error) {
      throw new Error(`Failed to create Stripe subscription: ${error.message}`);
    }
  }

  // Update subscription
  async updateStripeSubscription(subscriptionId, newPriceId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId
        }],
        proration_behavior: 'create_prorations'
      });

      return updatedSubscription;
    } catch (error) {
      throw new Error(`Failed to update Stripe subscription: ${error.message}`);
    }
  }

  // Cancel subscription
  async cancelStripeSubscription(subscriptionId, immediately = false) {
    try {
      if (immediately) {
        return await stripe.subscriptions.cancel(subscriptionId);
      } else {
        return await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      }
    } catch (error) {
      throw new Error(`Failed to cancel Stripe subscription: ${error.message}`);
    }
  }

  // Create payment intent
  async createPaymentIntent(amount, currency = 'usd', customerId) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        customer: customerId,
        automatic_payment_methods: {
          enabled: true
        }
      });

      return paymentIntent;
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  // Create invoice
  async createInvoice(workspace, subscription, amount) {
    try {
      const invoice = new Invoice({
        workspace: workspace._id,
        subscription: subscription._id,
        amount: {
          subtotal: amount,
          tax: 0,
          discount: 0,
          total: amount
        },
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        billingPeriod: {
          start: subscription.currentPeriodStart,
          end: subscription.currentPeriodEnd
        },
        items: [{
          description: `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan - ${subscription.pricing.billingCycle}`,
          quantity: 1,
          unitPrice: amount,
          amount: amount
        }],
        status: 'pending'
      });

      await invoice.save();
      return invoice;
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  // Handle webhook events
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  async handleSubscriptionCreated(stripeSubscription) {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id
    });

    if (subscription) {
      subscription.status = stripeSubscription.status;
      subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
      subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      await subscription.save();
    }
  }

  async handleSubscriptionUpdated(stripeSubscription) {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id
    });

    if (subscription) {
      subscription.status = stripeSubscription.status;
      subscription.currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
      subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
      
      if (stripeSubscription.cancel_at_period_end) {
        subscription.cancelAt = new Date(stripeSubscription.current_period_end * 1000);
      }
      
      await subscription.save();
    }
  }

  async handleSubscriptionDeleted(stripeSubscription) {
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeSubscription.id
    });

    if (subscription) {
      subscription.status = 'canceled';
      subscription.canceledAt = new Date();
      await subscription.save();
    }
  }

  async handleInvoicePaid(stripeInvoice) {
    const invoice = await Invoice.findOne({
      stripeInvoiceId: stripeInvoice.id
    });

    if (invoice) {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
      invoice.transactionId = stripeInvoice.payment_intent;
      await invoice.save();
    }
  }

  async handleInvoicePaymentFailed(stripeInvoice) {
    const invoice = await Invoice.findOne({
      stripeInvoiceId: stripeInvoice.id
    });

    if (invoice) {
      invoice.status = 'failed';
      await invoice.save();
    }

    // Update subscription status
    const subscription = await Subscription.findOne({
      stripeSubscriptionId: stripeInvoice.subscription
    });

    if (subscription) {
      subscription.status = 'past_due';
      await subscription.save();
    }
  }

  // Get Stripe prices (these should be created in Stripe Dashboard)
  getStripePriceIds() {
    return {
      starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
      starter_yearly: process.env.STRIPE_PRICE_STARTER_YEARLY,
      professional_monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY,
      professional_yearly: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY,
      enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
      enterprise_yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY
    };
  }
}

module.exports = new PaymentService();
