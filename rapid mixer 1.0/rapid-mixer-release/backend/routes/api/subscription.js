const express = require('express');
const PaymentService = require('../../services/paymentService');
const { authenticateToken, requirePremium } = require('../../middleware/auth');
const AnalyticsService = require('../../services/analyticsService');

const router = express.Router();
const paymentService = new PaymentService();
const analyticsService = new AnalyticsService();

// Get available subscription plans
router.get('/plans', (req, res) => {
    try {
        const plans = paymentService.getPlans();
        res.json({ plans });
    } catch (error) {
        console.error('Get plans error:', error);
        res.status(500).json({ error: 'Failed to get subscription plans' });
    }
});

// Get current subscription status
router.get('/status', authenticateToken, async (req, res) => {
    try {
        const status = await paymentService.getSubscriptionStatus(req.user.id);
        const usage = await paymentService.getUsageStats(req.user.id);
        
        res.json({
            subscription: status,
            usage
        });
    } catch (error) {
        console.error('Get subscription status error:', error);
        res.status(500).json({ error: 'Failed to get subscription status' });
    }
});

// Create subscription
router.post('/create', authenticateToken, async (req, res) => {
    try {
        const { planId, paymentMethodId } = req.body;

        if (!planId || !paymentMethodId) {
            return res.status(400).json({ 
                error: 'Plan ID and payment method are required' 
            });
        }

        const subscription = await paymentService.createSubscription(
            req.user.id,
            planId,
            paymentMethodId
        );

        // Track subscription creation
        analyticsService.trackSubscription(req.user.id, {
            action: 'created',
            plan: planId,
            amount: paymentService.getPlan(planId)?.price / 100
        });

        res.json({
            message: 'Subscription created successfully',
            subscription
        });

    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// Cancel subscription
router.post('/cancel', authenticateToken, requirePremium, async (req, res) => {
    try {
        const result = await paymentService.cancelSubscription(req.user.id);

        // Track subscription cancellation
        analyticsService.trackSubscription(req.user.id, {
            action: 'cancelled'
        });

        res.json({
            message: 'Subscription cancelled successfully',
            ...result
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

// Reactivate subscription
router.post('/reactivate', authenticateToken, async (req, res) => {
    try {
        const result = await paymentService.reactivateSubscription(req.user.id);

        // Track subscription reactivation
        analyticsService.trackSubscription(req.user.id, {
            action: 'reactivated'
        });

        res.json({
            message: 'Subscription reactivated successfully',
            ...result
        });

    } catch (error) {
        console.error('Reactivate subscription error:', error);
        res.status(500).json({ error: 'Failed to reactivate subscription' });
    }
});

// Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        await paymentService.handleWebhook(event);
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook handling error:', error);
        res.status(500).json({ error: 'Webhook handling failed' });
    }
});

// Create payment intent for one-time purchases
router.post('/payment-intent', authenticateToken, async (req, res) => {
    try {
        const { amount, currency = 'usd', metadata = {} } = req.body;

        if (!amount || amount < 50) { // Minimum $0.50
            return res.status(400).json({ 
                error: 'Invalid amount' 
            });
        }

        const paymentIntent = await paymentService.createPaymentIntent(
            amount,
            currency,
            {
                userId: req.user.id.toString(),
                ...metadata
            }
        );

        res.json(paymentIntent);

    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({ error: 'Failed to create payment intent' });
    }
});

// Get subscription analytics (admin only)
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        // Check if user is admin (you'd implement this check)
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { days = 30 } = req.query;
        const analytics = await analyticsService.generateBusinessReport(parseInt(days));

        res.json({ analytics });

    } catch (error) {
        console.error('Get subscription analytics error:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

module.exports = router;