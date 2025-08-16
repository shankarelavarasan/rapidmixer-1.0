const User = require('../models/User');

const userModel = new User();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = userModel.verifyJWT(token);
        if (!decoded) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        // Get fresh user data
        const user = await userModel.getUserById(decoded.id);
        if (!user) {
            return res.status(403).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Premium subscription middleware
const requirePremium = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const { subscription_type, subscription_expires_at } = req.user;
    
    if (subscription_type === 'free') {
        return res.status(403).json({ 
            error: 'Premium subscription required',
            upgradeUrl: '/api/subscription/upgrade'
        });
    }

    // Check if subscription is expired
    if (subscription_expires_at && new Date(subscription_expires_at) < new Date()) {
        return res.status(403).json({ 
            error: 'Subscription expired',
            renewUrl: '/api/subscription/renew'
        });
    }

    next();
};

// Rate limiting middleware
const createRateLimiter = (maxRequests, windowMs, premiumMultiplier = 2) => {
    const requests = new Map();

    return (req, res, next) => {
        const userId = req.user?.id || req.ip;
        const isPremium = req.user?.subscription_type !== 'free';
        const limit = isPremium ? maxRequests * premiumMultiplier : maxRequests;
        
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean old requests
        if (requests.has(userId)) {
            const userRequests = requests.get(userId).filter(time => time > windowStart);
            requests.set(userId, userRequests);
        } else {
            requests.set(userId, []);
        }
        
        const userRequests = requests.get(userId);
        
        if (userRequests.length >= limit) {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000),
                limit,
                remaining: 0
            });
        }
        
        userRequests.push(now);
        
        res.set({
            'X-RateLimit-Limit': limit,
            'X-RateLimit-Remaining': limit - userRequests.length,
            'X-RateLimit-Reset': Math.ceil((now + windowMs) / 1000)
        });
        
        next();
    };
};

// Usage tracking middleware
const trackUsage = (action) => {
    return async (req, res, next) => {
        if (req.user) {
            try {
                const usage = JSON.parse(req.user.usage_stats || '{}');
                const today = new Date().toISOString().split('T')[0];
                
                if (!usage[today]) {
                    usage[today] = {};
                }
                
                usage[today][action] = (usage[today][action] || 0) + 1;
                
                // Keep only last 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                
                Object.keys(usage).forEach(date => {
                    if (new Date(date) < thirtyDaysAgo) {
                        delete usage[date];
                    }
                });
                
                await userModel.updateUser(req.user.id, {
                    usage_stats: JSON.stringify(usage)
                });
                
                req.usage = usage;
            } catch (error) {
                console.error('Usage tracking error:', error);
            }
        }
        next();
    };
};

// Check usage limits
const checkUsageLimit = (action, freeLimit, premiumLimit) => {
    return (req, res, next) => {
        if (!req.user) {
            return next();
        }

        const isPremium = req.user.subscription_type !== 'free';
        const limit = isPremium ? premiumLimit : freeLimit;
        
        if (req.usage) {
            const today = new Date().toISOString().split('T')[0];
            const todayUsage = req.usage[today] || {};
            const currentUsage = todayUsage[action] || 0;
            
            if (currentUsage >= limit) {
                return res.status(429).json({
                    error: `Daily ${action} limit exceeded`,
                    limit,
                    used: currentUsage,
                    upgradeUrl: isPremium ? null : '/api/subscription/upgrade'
                });
            }
        }
        
        next();
    };
};

module.exports = {
    authenticateToken,
    requirePremium,
    createRateLimiter,
    trackUsage,
    checkUsageLimit
};