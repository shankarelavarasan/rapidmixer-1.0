const { GoogleAnalytics } = require('@google-analytics/data');
const mixpanel = require('mixpanel');

class AnalyticsService {
    constructor() {
        this.ga = process.env.GA_PROPERTY_ID ? new GoogleAnalytics({
            credentials: JSON.parse(process.env.GA_CREDENTIALS || '{}')
        }) : null;
        
        this.mixpanel = process.env.MIXPANEL_TOKEN ? 
            mixpanel.init(process.env.MIXPANEL_TOKEN) : null;
        
        this.events = new Map(); // In-memory event storage for local analytics
        this.userSessions = new Map();
        this.performanceMetrics = new Map();
    }

    // Track user events
    trackEvent(userId, event, properties = {}) {
        const eventData = {
            userId,
            event,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId(userId)
            }
        };

        // Store locally
        this.storeEvent(eventData);

        // Send to external services
        if (this.mixpanel) {
            this.mixpanel.track(event, {
                distinct_id: userId,
                ...properties
            });
        }

        // Custom event handlers
        this.handleCustomEvent(eventData);
    }

    // Track user properties
    trackUser(userId, properties = {}) {
        const userData = {
            userId,
            properties: {
                ...properties,
                lastSeen: new Date().toISOString()
            }
        };

        if (this.mixpanel) {
            this.mixpanel.people.set(userId, properties);
        }

        this.storeUserData(userData);
    }

    // Track performance metrics
    trackPerformance(metric, value, tags = {}) {
        const performanceData = {
            metric,
            value,
            tags,
            timestamp: new Date().toISOString()
        };

        this.storePerformanceMetric(performanceData);
    }

    // Audio processing analytics
    trackAudioProcessing(userId, data) {
        this.trackEvent(userId, 'audio_processing_started', {
            fileSize: data.fileSize,
            format: data.format,
            duration: data.duration,
            processingType: data.processingType
        });

        // Track processing time
        const startTime = Date.now();
        return {
            complete: (success, stems = null) => {
                const processingTime = Date.now() - startTime;
                
                this.trackEvent(userId, 'audio_processing_completed', {
                    success,
                    processingTime,
                    stemsGenerated: stems ? Object.keys(stems).length : 0,
                    fileSize: data.fileSize,
                    format: data.format
                });

                this.trackPerformance('audio_processing_time', processingTime, {
                    success: success.toString(),
                    format: data.format
                });
            }
        };
    }

    // User engagement analytics
    trackUserEngagement(userId, action, context = {}) {
        const engagementEvents = {
            'session_start': () => this.startUserSession(userId),
            'session_end': () => this.endUserSession(userId),
            'feature_used': () => this.trackFeatureUsage(userId, context.feature),
            'export_completed': () => this.trackExport(userId, context),
            'collaboration_joined': () => this.trackCollaboration(userId, context),
            'subscription_upgraded': () => this.trackSubscription(userId, context)
        };

        if (engagementEvents[action]) {
            engagementEvents[action]();
        }

        this.trackEvent(userId, action, context);
    }

    // Business metrics
    trackBusinessMetric(metric, value, userId = null) {
        const businessData = {
            metric,
            value,
            userId,
            timestamp: new Date().toISOString()
        };

        this.storeBusinessMetric(businessData);

        // Track revenue metrics
        if (metric === 'subscription_revenue') {
            this.trackEvent(userId, 'revenue_generated', {
                amount: value,
                type: 'subscription'
            });
        }
    }

    // Error tracking
    trackError(error, context = {}) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString()
        };

        this.storeError(errorData);

        if (this.mixpanel) {
            this.mixpanel.track('error_occurred', {
                error_message: error.message,
                error_type: error.constructor.name,
                ...context
            });
        }
    }

    // Session management
    startUserSession(userId) {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            userId,
            startTime: new Date(),
            events: [],
            isActive: true
        };

        this.userSessions.set(userId, session);
        return sessionId;
    }

    endUserSession(userId) {
        const session = this.userSessions.get(userId);
        if (session) {
            session.endTime = new Date();
            session.duration = session.endTime - session.startTime;
            session.isActive = false;

            this.trackEvent(userId, 'session_completed', {
                sessionId: session.id,
                duration: session.duration,
                eventsCount: session.events.length
            });
        }
    }

    getSessionId(userId) {
        const session = this.userSessions.get(userId);
        return session ? session.id : this.startUserSession(userId);
    }

    // Feature usage tracking
    trackFeatureUsage(userId, feature) {
        this.trackEvent(userId, 'feature_used', { feature });
        
        // Update feature usage stats
        const today = new Date().toISOString().split('T')[0];
        const key = `feature_usage_${today}`;
        
        if (!this.performanceMetrics.has(key)) {
            this.performanceMetrics.set(key, new Map());
        }
        
        const dailyStats = this.performanceMetrics.get(key);
        dailyStats.set(feature, (dailyStats.get(feature) || 0) + 1);
    }

    // Export tracking
    trackExport(userId, context) {
        this.trackEvent(userId, 'export_completed', {
            format: context.format,
            quality: context.quality,
            fileSize: context.fileSize,
            duration: context.duration
        });

        this.trackBusinessMetric('exports_completed', 1, userId);
    }

    // Collaboration tracking
    trackCollaboration(userId, context) {
        this.trackEvent(userId, 'collaboration_activity', {
            projectId: context.projectId,
            action: context.action,
            collaborators: context.collaborators
        });
    }

    // Subscription tracking
    trackSubscription(userId, context) {
        this.trackEvent(userId, 'subscription_event', {
            action: context.action,
            plan: context.plan,
            amount: context.amount
        });

        if (context.action === 'upgraded') {
            this.trackBusinessMetric('subscription_revenue', context.amount, userId);
        }
    }

    // Analytics reports
    async generateUserReport(userId, days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const userEvents = this.getUserEvents(userId, startDate, endDate);
        
        return {
            userId,
            period: { start: startDate, end: endDate },
            totalEvents: userEvents.length,
            uniqueDays: this.getUniqueDays(userEvents),
            topFeatures: this.getTopFeatures(userEvents),
            sessionStats: this.getSessionStats(userId, startDate, endDate),
            engagementScore: this.calculateEngagementScore(userEvents)
        };
    }

    async generateBusinessReport(days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return {
            period: { start: startDate, end: endDate },
            activeUsers: this.getActiveUsers(startDate, endDate),
            newUsers: this.getNewUsers(startDate, endDate),
            revenue: this.getRevenue(startDate, endDate),
            topFeatures: this.getGlobalTopFeatures(startDate, endDate),
            conversionRate: this.getConversionRate(startDate, endDate),
            churnRate: this.getChurnRate(startDate, endDate)
        };
    }

    // Performance monitoring
    getPerformanceMetrics(metric = null, hours = 24) {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - hours);

        const metrics = Array.from(this.performanceMetrics.entries())
            .filter(([key, data]) => {
                if (metric && !key.includes(metric)) return false;
                return new Date(data.timestamp || 0) > cutoff;
            });

        return metrics.map(([key, data]) => ({
            metric: key,
            ...data
        }));
    }

    // Real-time analytics
    getRealTimeStats() {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        return {
            activeUsers: this.getActiveUsers(oneHourAgo, now),
            currentSessions: Array.from(this.userSessions.values())
                .filter(session => session.isActive).length,
            eventsLastHour: this.getEventsCount(oneHourAgo, now),
            topFeatures: this.getTopFeatures(this.getRecentEvents(oneHourAgo)),
            errorRate: this.getErrorRate(oneHourAgo, now)
        };
    }

    // Helper methods
    storeEvent(eventData) {
        const key = `event_${Date.now()}_${Math.random()}`;
        this.events.set(key, eventData);
        
        // Clean old events (keep last 10000)
        if (this.events.size > 10000) {
            const oldestKey = this.events.keys().next().value;
            this.events.delete(oldestKey);
        }
    }

    storeUserData(userData) {
        // Implementation for storing user data
    }

    storePerformanceMetric(performanceData) {
        const key = `${performanceData.metric}_${Date.now()}`;
        this.performanceMetrics.set(key, performanceData);
    }

    storeBusinessMetric(businessData) {
        const key = `business_${businessData.metric}_${Date.now()}`;
        this.performanceMetrics.set(key, businessData);
    }

    storeError(errorData) {
        const key = `error_${Date.now()}`;
        this.events.set(key, { ...errorData, type: 'error' });
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getUserEvents(userId, startDate, endDate) {
        return Array.from(this.events.values())
            .filter(event => 
                event.userId === userId &&
                new Date(event.properties.timestamp) >= startDate &&
                new Date(event.properties.timestamp) <= endDate
            );
    }

    getUniqueDays(events) {
        const days = new Set();
        events.forEach(event => {
            const day = new Date(event.properties.timestamp).toISOString().split('T')[0];
            days.add(day);
        });
        return days.size;
    }

    getTopFeatures(events) {
        const features = {};
        events.forEach(event => {
            if (event.event === 'feature_used' && event.properties.feature) {
                features[event.properties.feature] = (features[event.properties.feature] || 0) + 1;
            }
        });
        
        return Object.entries(features)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([feature, count]) => ({ feature, count }));
    }

    calculateEngagementScore(events) {
        // Simple engagement score based on event frequency and variety
        const uniqueEvents = new Set(events.map(e => e.event)).size;
        const eventCount = events.length;
        return Math.min(100, (uniqueEvents * 10) + (eventCount * 0.1));
    }

    handleCustomEvent(eventData) {
        // Custom event handling logic
        switch (eventData.event) {
            case 'audio_processing_started':
                this.trackPerformance('audio_processing_requests', 1);
                break;
            case 'user_registered':
                this.trackBusinessMetric('new_registrations', 1);
                break;
            case 'subscription_upgraded':
                this.trackBusinessMetric('conversions', 1);
                break;
        }
    }

    // Additional helper methods would be implemented here...
    getActiveUsers(startDate, endDate) { return 0; }
    getNewUsers(startDate, endDate) { return 0; }
    getRevenue(startDate, endDate) { return 0; }
    getGlobalTopFeatures(startDate, endDate) { return []; }
    getConversionRate(startDate, endDate) { return 0; }
    getChurnRate(startDate, endDate) { return 0; }
    getSessionStats(userId, startDate, endDate) { return {}; }
    getEventsCount(startDate, endDate) { return 0; }
    getRecentEvents(since) { return []; }
    getErrorRate(startDate, endDate) { return 0; }
}

module.exports = AnalyticsService;