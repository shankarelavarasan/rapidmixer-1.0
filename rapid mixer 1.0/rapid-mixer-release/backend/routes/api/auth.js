const express = require('express');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const User = require('../../models/User');
const { authenticateToken } = require('../../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../../services/emailService');

const router = express.Router();
const userModel = new User();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { error: 'Too many authentication attempts, please try again later' }
});

// Register new user
router.post('/register', authLimiter, async (req, res) => {
    try {
        const { email, username, password, firstName, lastName } = req.body;

        // Validation
        if (!email || !username || !password) {
            return res.status(400).json({ error: 'Email, username, and password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Check if user already exists
        const existingUser = await userModel.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        // Create user
        const newUser = await userModel.createUser({
            email,
            username,
            password,
            firstName,
            lastName
        });

        // Send verification email
        await sendVerificationEmail(email, newUser.verificationToken);

        res.status(201).json({
            message: 'User created successfully. Please check your email to verify your account.',
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                firstName: newUser.firstName,
                lastName: newUser.lastName
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'Email or username already exists' });
        }
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login user
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Authenticate user
        const user = await userModel.authenticateUser(email, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.email_verified) {
            return res.status(401).json({ 
                error: 'Please verify your email before logging in',
                resendVerificationUrl: '/api/auth/resend-verification'
            });
        }

        // Generate JWT token
        const token = userModel.generateJWT(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                avatarUrl: user.avatar_url,
                subscriptionType: user.subscription_type,
                subscriptionExpiresAt: user.subscription_expires_at
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        const decoded = userModel.verifyJWT(token);
        if (!decoded) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        const success = await userModel.verifyEmail(decoded.email);
        if (!success) {
            return res.status(400).json({ error: 'Email verification failed' });
        }

        res.json({ message: 'Email verified successfully' });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Email verification failed' });
    }
});

// Resend verification email
router.post('/resend-verification', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.email_verified) {
            return res.status(400).json({ error: 'Email is already verified' });
        }

        // Generate new verification token
        const verificationToken = userModel.generateJWT({ email });
        await userModel.updateVerificationToken(user.id, verificationToken);

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        res.json({ message: 'Verification email sent' });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Failed to resend verification email' });
    }
});

// Request password reset
router.post('/forgot-password', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await userModel.getUserByEmail(email);
        if (!user) {
            // Don't reveal if email exists
            return res.json({ message: 'If the email exists, a password reset link has been sent' });
        }

        // Generate reset token
        const resetToken = userModel.generateJWT({ email, type: 'reset' });
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await userModel.setPasswordResetToken(user.id, resetToken, expiresAt);

        // Send reset email
        await sendPasswordResetEmail(email, resetToken);

        res.json({ message: 'If the email exists, a password reset link has been sent' });

    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
});

// Reset password
router.post('/reset-password', authLimiter, async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        const decoded = userModel.verifyJWT(token);
        if (!decoded || decoded.type !== 'reset') {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const success = await userModel.resetPassword(decoded.email, newPassword, token);
        if (!success) {
            return res.status(400).json({ error: 'Password reset failed' });
        }

        res.json({ message: 'Password reset successfully' });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Password reset failed' });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await userModel.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                avatarUrl: user.avatar_url,
                subscriptionType: user.subscription_type,
                subscriptionExpiresAt: user.subscription_expires_at,
                createdAt: user.created_at,
                preferences: JSON.parse(user.preferences || '{}'),
                usageStats: JSON.parse(user.usage_stats || '{}')
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get user profile' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, preferences } = req.body;
        
        const updates = {};
        if (firstName !== undefined) updates.first_name = firstName;
        if (lastName !== undefined) updates.last_name = lastName;
        if (preferences !== undefined) updates.preferences = JSON.stringify(preferences);

        const success = await userModel.updateUser(req.user.id, updates);
        if (!success) {
            return res.status(400).json({ error: 'Failed to update profile' });
        }

        res.json({ message: 'Profile updated successfully' });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long' });
        }

        // Verify current password
        const user = await userModel.authenticateUser(req.user.email, currentPassword);
        if (!user) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        const success = await userModel.changePassword(req.user.id, newPassword);
        if (!success) {
            return res.status(400).json({ error: 'Failed to change password' });
        }

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Logout (client-side token invalidation)
router.post('/logout', authenticateToken, (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;