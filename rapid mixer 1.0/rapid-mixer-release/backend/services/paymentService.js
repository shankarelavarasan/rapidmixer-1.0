const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

class PaymentService {
    constructor() {
        this.userModel = new User();
        this.plans = {
            premium_monthly: {
                id: 'premium_monthly',
                name: 'Premium Monthly',
                price: 999, // $9.99 in cents
                currency: 'usd',
                interval: 'month',
                features: [
                    'Unlimited projects',
                    'High-quality exports',
                    'Advanced effects',
                    'Collaboration features',
                    'Cloud storage',
                    'Priority support'
                ]
            },
            premium_yearly: {
                id: 'premium_yearly',
                name: 'Premium Yearly',
                price: 9999, // $99.99 in cents
                currency: 'usd',
                interval: 'year',
                features: [
                    'All Premium Monthly features',
                    '2 months free',
                    'Advanced analytics',
                    'Custom branding',
                    'API access'
                ]
            }
        };
    }

    async createCustomer(user) {
        try {
            const customer = await stripe.customers.create({
                email: user.email,
                name: `${user.first_name} ${user.last_name}`,
                metadata: {
                    userId: user.id.toString()
                }
            });

            await this.userModel.updateUser(user.id, {
                stripe_customer_id: customer.id
            });

            return customer;
        } catch (error) {
            console.error('Create customer error:', error);
            throw error;
        }
    }

    async createSubscription(userId, planId, paymentMethodId) {
        try {
            const user = await this.userModel.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const plan = this.plans[planId];
            if (!plan) {
                throw new Error('Invalid plan');
            }

            // Create customer if doesn't exist
            let customerId = user.stripe_customer_id;
            if (!customerId) {
                const customer = await this.createCustomer(user);
                customerId = customer.id;
            }

            // Attach payment method to customer
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });

            // Set as default payment method
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });

            // Create subscription
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{
                    price_data: {
                        currency: plan.currency,
                        product_data: {
                            name: plan.name,
                        },
                        unit_amount: plan.price,
                        recurring: {
                            interval: plan.interval,
                        },
                    },
                }],
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'],
                metadata: {
                    userId: userId.toString(),
                    planId: planId
                }
            });

            // Update user subscription in database
            const expiresAt = new Date();
            if (plan.interval === 'month') {
                expiresAt.setMonth(expiresAt.getMonth() + 1);
            } else {
                expiresAt.setFullYear(expiresAt.getFullYear() + 1);
            }

            await this.userModel.updateUser(userId, {
                subscription_type: 'premium',
                subscription_expires_at: expiresAt.toISOString(),
                stripe_subscription_id: subscription.id
            });

            return {
                subscriptionId: subscription.id,
                clientSecret: subscription.latest_invoice.payment_intent.client_secret,
                status: subscription.status
            };

        } catch (error) {
            console.error('Create subscription error:', error);
            throw error;
        }
    }

    async cancelSubscription(userId) {
        try {
            const user = await this.userModel.getUserById(userId);
            if (!user || !user.stripe_subscription_id) {
                throw new Error('No active subscription found');
            }

            // Cancel at period end
            const subscription = await stripe.subscriptions.update(
                user.stripe_subscription_id,
                { cancel_at_period_end: true }
            );

            return {
                subscriptionId: subscription.id,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000)
            };

        } catch (error) {
            console.error('Cancel subscription error:', error);
            throw error;
        }
    }

    async reactivateSubscription(userId) {
        try {
            const user = await this.userModel.getUserById(userId);
            if (!user || !user.stripe_subscription_id) {
                throw new Error('No subscription found');
            }

            const subscription = await stripe.subscriptions.update(
                user.stripe_subscription_id,
                { cancel_at_period_end: false }
            );

            return {
                subscriptionId: subscription.id,
                status: subscription.status,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000)
            };

        } catch (error) {
            console.error('Reactivate subscription error:', error);
            throw error;
        }
    }

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
                case 'invoice.payment_succeeded':
                    await this.handlePaymentSucceeded(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    await this.handlePaymentFailed(event.data.object);
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }
        } catch (error) {
            console.error('Webhook handling error:', error);
            throw error;
        }
    }

    async handleSubscriptionCreated(subscription) {
        const userId = parseInt(subscription.metadata.userId);
        const planId = subscription.metadata.planId;
        const plan = this.plans[planId];

        if (userId && plan) {
            const expiresAt = new Date(subscription.current_period_end * 1000);
            
            await this.userModel.updateUser(userId, {
                subscription_type: 'premium',
                subscription_expires_at: expiresAt.toISOString(),
                stripe_subscription_id: subscription.id
            });

            // Send welcome email
            await this.sendSubscriptionEmail(userId, 'welcome', { plan });
        }
    }

    async handleSubscriptionUpdated(subscription) {
        const userId = parseInt(subscription.metadata.userId);
        
        if (userId) {
            const expiresAt = new Date(subscription.current_period_end * 1000);
            const subscriptionType = subscription.status === 'active' ? 'premium' : 'free';
            
            await this.userModel.updateUser(userId, {
                subscription_type: subscriptionType,
                subscription_expires_at: expiresAt.toISOString()
            });
        }
    }

    async handleSubscriptionDeleted(subscription) {
        const userId = parseInt(subscription.metadata.userId);
        
        if (userId) {
            await this.userModel.updateUser(userId, {
                subscription_type: 'free',
                subscription_expires_at: null,
                stripe_subscription_id: null
            });

            // Send cancellation email
            await this.sendSubscriptionEmail(userId, 'cancelled');
        }
    }

    async handlePaymentSucceeded(invoice) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const userId = parseInt(subscription.metadata.userId);
        
        if (userId) {
            // Update subscription expiry
            const expiresAt = new Date(subscription.current_period_end * 1000);
            
            await this.userModel.updateUser(userId, {
                subscription_expires_at: expiresAt.toISOString()
            });

            // Send payment confirmation email
            await this.sendSubscriptionEmail(userId, 'payment_success', {
                amount: invoice.amount_paid / 100,
                currency: invoice.currency.toUpperCase()
            });
        }
    }

    async handlePaymentFailed(invoice) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const userId = parseInt(subscription.metadata.userId);
        
        if (userId) {
            // Send payment failed email
            await this.sendSubscriptionEmail(userId, 'payment_failed', {
                amount: invoice.amount_due / 100,
                currency: invoice.currency.toUpperCase(),
                nextAttempt: new Date(invoice.next_payment_attempt * 1000)
            });
        }
    }

    async sendSubscriptionEmail(userId, type, data = {}) {
        try {
            const user = await this.userModel.getUserById(userId);
            if (!user) return;

            // Email service integration would go here
            console.log(`Sending ${type} email to ${user.email}`, data);
        } catch (error) {
            console.error('Send subscription email error:', error);
        }
    }

    async getSubscriptionStatus(userId) {
        try {
            const user = await this.userModel.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            if (!user.stripe_subscription_id) {
                return {
                    status: 'none',
                    type: 'free',
                    expiresAt: null
                };
            }

            const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
            
            return {
                status: subscription.status,
                type: user.subscription_type,
                expiresAt: new Date(subscription.current_period_end * 1000),
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000)
            };

        } catch (error) {
            console.error('Get subscription status error:', error);
            throw error;
        }
    }

    async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency,
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };

        } catch (error) {
            console.error('Create payment intent error:', error);
            throw error;
        }
    }

    getPlans() {
        return Object.values(this.plans);
    }

    getPlan(planId) {
        return this.plans[planId] || null;
    }

    async getUsageStats(userId) {
        try {
            const user = await this.userModel.getUserById(userId);
            if (!user) return null;

            const usage = JSON.parse(user.usage_stats || '{}');
            const today = new Date().toISOString().split('T')[0];
            const todayUsage = usage[today] || {};

            const limits = user.subscription_type === 'premium' ? {
                projects: 100,
                exports: 100,
                storage: 10 * 1024 * 1024 * 1024 // 10GB
            } : {
                projects: 3,
                exports: 5,
                storage: 100 * 1024 * 1024 // 100MB
            };

            return {
                subscription: user.subscription_type,
                limits,
                usage: {
                    projects: await this.userModel.getUserProjectCount(userId),
                    exportsToday: todayUsage.export || 0,
                    storageUsed: await this.userModel.getUserStorageUsage(userId)
                }
            };

        } catch (error) {
            console.error('Get usage stats error:', error);
            return null;
        }
    }
}

module.exports = PaymentService;