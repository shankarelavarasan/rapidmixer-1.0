const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

class User {
    constructor() {
        this.db = new sqlite3.Database(path.join(__dirname, '../database.db'));
        this.initializeTable();
    }

    initializeTable() {
        const createUserTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT,
                last_name TEXT,
                avatar_url TEXT,
                subscription_type TEXT DEFAULT 'free',
                subscription_expires_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login_at DATETIME,
                is_active BOOLEAN DEFAULT 1,
                email_verified BOOLEAN DEFAULT 0,
                verification_token TEXT,
                reset_token TEXT,
                reset_token_expires DATETIME,
                usage_stats TEXT DEFAULT '{}',
                preferences TEXT DEFAULT '{}'
            )
        `;

        const createProjectsTable = `
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                audio_file_path TEXT,
                stems_data TEXT,
                mix_settings TEXT DEFAULT '{}',
                is_public BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `;

        const createCollaborationsTable = `
            CREATE TABLE IF NOT EXISTS collaborations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                role TEXT DEFAULT 'viewer',
                invited_by INTEGER NOT NULL,
                invited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                accepted_at DATETIME,
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (invited_by) REFERENCES users (id)
            )
        `;

        this.db.run(createUserTable);
        this.db.run(createProjectsTable);
        this.db.run(createCollaborationsTable);
    }

    async createUser(userData) {
        const { email, username, password, firstName, lastName } = userData;
        
        try {
            const passwordHash = await bcrypt.hash(password, 12);
            const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });
            
            return new Promise((resolve, reject) => {
                const stmt = this.db.prepare(`
                    INSERT INTO users (email, username, password_hash, first_name, last_name, verification_token)
                    VALUES (?, ?, ?, ?, ?, ?)
                `);
                
                stmt.run([email, username, passwordHash, firstName, lastName, verificationToken], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: this.lastID,
                            email,
                            username,
                            firstName,
                            lastName,
                            verificationToken
                        });
                    }
                });
                stmt.finalize();
            });
        } catch (error) {
            throw error;
        }
    }

    async authenticateUser(email, password) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT * FROM users WHERE email = ? AND is_active = 1',
                [email],
                async (err, user) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    if (!user) {
                        resolve(null);
                        return;
                    }
                    
                    try {
                        const isValidPassword = await bcrypt.compare(password, user.password_hash);
                        if (isValidPassword) {
                            // Update last login
                            this.db.run(
                                'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
                                [user.id]
                            );
                            
                            const { password_hash, verification_token, reset_token, ...userWithoutSensitiveData } = user;
                            resolve(userWithoutSensitiveData);
                        } else {
                            resolve(null);
                        }
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    }

    async getUserById(id) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT id, email, username, first_name, last_name, avatar_url, subscription_type, subscription_expires_at, created_at, email_verified, usage_stats, preferences FROM users WHERE id = ? AND is_active = 1',
                [id],
                (err, user) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(user);
                    }
                }
            );
        });
    }

    async updateUser(id, updates) {
        const allowedFields = ['first_name', 'last_name', 'avatar_url', 'preferences'];
        const updateFields = [];
        const values = [];
        
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        });
        
        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }
        
        values.push(id);
        
        return new Promise((resolve, reject) => {
            this.db.run(
                `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values,
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }

    async updateSubscription(userId, subscriptionType, expiresAt) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET subscription_type = ?, subscription_expires_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [subscriptionType, expiresAt, userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }

    async getUserProjects(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC',
                [userId],
                (err, projects) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(projects);
                    }
                }
            );
        });
    }

    async createProject(userId, projectData) {
        const { name, description, audioFilePath, stemsData, mixSettings } = projectData;
        
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO projects (user_id, name, description, audio_file_path, stems_data, mix_settings)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run([
                userId, 
                name, 
                description, 
                audioFilePath, 
                JSON.stringify(stemsData), 
                JSON.stringify(mixSettings)
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        userId,
                        name,
                        description,
                        audioFilePath,
                        stemsData,
                        mixSettings
                    });
                }
            });
            stmt.finalize();
        });
    }

    generateJWT(user) {
        return jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                subscription: user.subscription_type 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
    }

    verifyJWT(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return null;
        }
    }
}

module.exports = User;