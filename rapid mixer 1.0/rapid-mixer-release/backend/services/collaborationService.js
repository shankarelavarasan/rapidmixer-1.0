const WebSocket = require('ws');
const User = require('../models/User');

class CollaborationService {
    constructor() {
        this.rooms = new Map(); // projectId -> Set of connections
        this.userConnections = new Map(); // userId -> connection
        this.userModel = new User();
    }

    initializeWebSocket(server) {
        this.wss = new WebSocket.Server({ server });
        
        this.wss.on('connection', (ws, req) => {
            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);
                    await this.handleMessage(ws, data);
                } catch (error) {
                    console.error('WebSocket message error:', error);
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
                }
            });

            ws.on('close', () => {
                this.handleDisconnection(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
            });
        });
    }

    async handleMessage(ws, data) {
        const { type, payload } = data;

        switch (type) {
            case 'authenticate':
                await this.authenticateConnection(ws, payload);
                break;
            case 'join_project':
                await this.joinProject(ws, payload);
                break;
            case 'leave_project':
                await this.leaveProject(ws, payload);
                break;
            case 'mixer_update':
                await this.handleMixerUpdate(ws, payload);
                break;
            case 'cursor_position':
                await this.handleCursorUpdate(ws, payload);
                break;
            case 'chat_message':
                await this.handleChatMessage(ws, payload);
                break;
            case 'project_update':
                await this.handleProjectUpdate(ws, payload);
                break;
            default:
                ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
    }

    async authenticateConnection(ws, payload) {
        try {
            const { token } = payload;
            const decoded = this.userModel.verifyJWT(token);
            
            if (!decoded) {
                ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid token' }));
                ws.close();
                return;
            }

            const user = await this.userModel.getUserById(decoded.id);
            if (!user) {
                ws.send(JSON.stringify({ type: 'auth_error', message: 'User not found' }));
                ws.close();
                return;
            }

            ws.userId = user.id;
            ws.user = user;
            this.userConnections.set(user.id, ws);

            ws.send(JSON.stringify({ 
                type: 'authenticated', 
                user: {
                    id: user.id,
                    username: user.username,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    avatarUrl: user.avatar_url
                }
            }));

        } catch (error) {
            console.error('Authentication error:', error);
            ws.send(JSON.stringify({ type: 'auth_error', message: 'Authentication failed' }));
            ws.close();
        }
    }

    async joinProject(ws, payload) {
        if (!ws.userId) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not authenticated' }));
            return;
        }

        try {
            const { projectId } = payload;
            
            // Check if user has access to project
            const hasAccess = await this.checkProjectAccess(ws.userId, projectId);
            if (!hasAccess) {
                ws.send(JSON.stringify({ type: 'error', message: 'Access denied' }));
                return;
            }

            // Leave previous project if any
            if (ws.currentProject) {
                await this.leaveProject(ws, { projectId: ws.currentProject });
            }

            // Join new project room
            if (!this.rooms.has(projectId)) {
                this.rooms.set(projectId, new Set());
            }

            const room = this.rooms.get(projectId);
            room.add(ws);
            ws.currentProject = projectId;

            // Notify other users in the room
            const joinMessage = {
                type: 'user_joined',
                user: {
                    id: ws.user.id,
                    username: ws.user.username,
                    firstName: ws.user.first_name,
                    lastName: ws.user.last_name,
                    avatarUrl: ws.user.avatar_url
                },
                timestamp: new Date().toISOString()
            };

            this.broadcastToRoom(projectId, joinMessage, ws);

            // Send current room users to the new user
            const roomUsers = Array.from(room)
                .filter(conn => conn !== ws && conn.user)
                .map(conn => ({
                    id: conn.user.id,
                    username: conn.user.username,
                    firstName: conn.user.first_name,
                    lastName: conn.user.last_name,
                    avatarUrl: conn.user.avatar_url
                }));

            ws.send(JSON.stringify({
                type: 'project_joined',
                projectId,
                users: roomUsers
            }));

        } catch (error) {
            console.error('Join project error:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Failed to join project' }));
        }
    }

    async leaveProject(ws, payload) {
        const { projectId } = payload;
        const currentProject = projectId || ws.currentProject;

        if (!currentProject) return;

        const room = this.rooms.get(currentProject);
        if (room) {
            room.delete(ws);
            
            if (room.size === 0) {
                this.rooms.delete(currentProject);
            } else {
                // Notify other users
                const leaveMessage = {
                    type: 'user_left',
                    userId: ws.userId,
                    timestamp: new Date().toISOString()
                };
                this.broadcastToRoom(currentProject, leaveMessage, ws);
            }
        }

        ws.currentProject = null;
    }

    async handleMixerUpdate(ws, payload) {
        if (!ws.currentProject) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not in a project' }));
            return;
        }

        const updateMessage = {
            type: 'mixer_update',
            userId: ws.userId,
            username: ws.user.username,
            update: payload,
            timestamp: new Date().toISOString()
        };

        this.broadcastToRoom(ws.currentProject, updateMessage, ws);

        // Save mixer state to database
        try {
            await this.saveMixerState(ws.currentProject, payload);
        } catch (error) {
            console.error('Save mixer state error:', error);
        }
    }

    async handleCursorUpdate(ws, payload) {
        if (!ws.currentProject) return;

        const cursorMessage = {
            type: 'cursor_position',
            userId: ws.userId,
            username: ws.user.username,
            position: payload.position,
            timestamp: new Date().toISOString()
        };

        this.broadcastToRoom(ws.currentProject, cursorMessage, ws);
    }

    async handleChatMessage(ws, payload) {
        if (!ws.currentProject) {
            ws.send(JSON.stringify({ type: 'error', message: 'Not in a project' }));
            return;
        }

        const chatMessage = {
            type: 'chat_message',
            id: Date.now().toString(),
            userId: ws.userId,
            username: ws.user.username,
            firstName: ws.user.first_name,
            lastName: ws.user.last_name,
            avatarUrl: ws.user.avatar_url,
            message: payload.message,
            timestamp: new Date().toISOString()
        };

        // Save chat message to database
        try {
            await this.saveChatMessage(ws.currentProject, chatMessage);
        } catch (error) {
            console.error('Save chat message error:', error);
        }

        this.broadcastToRoom(ws.currentProject, chatMessage);
    }

    async handleProjectUpdate(ws, payload) {
        if (!ws.currentProject) return;

        const updateMessage = {
            type: 'project_update',
            userId: ws.userId,
            username: ws.user.username,
            update: payload,
            timestamp: new Date().toISOString()
        };

        this.broadcastToRoom(ws.currentProject, updateMessage, ws);
    }

    broadcastToRoom(projectId, message, excludeConnection = null) {
        const room = this.rooms.get(projectId);
        if (!room) return;

        const messageStr = JSON.stringify(message);
        room.forEach(connection => {
            if (connection !== excludeConnection && connection.readyState === WebSocket.OPEN) {
                connection.send(messageStr);
            }
        });
    }

    handleDisconnection(ws) {
        if (ws.userId) {
            this.userConnections.delete(ws.userId);
        }

        if (ws.currentProject) {
            this.leaveProject(ws, { projectId: ws.currentProject });
        }
    }

    async checkProjectAccess(userId, projectId) {
        try {
            // Check if user owns the project
            const project = await this.userModel.getProjectById(projectId);
            if (project && project.user_id === userId) {
                return true;
            }

            // Check if user is a collaborator
            const collaboration = await this.userModel.getCollaboration(projectId, userId);
            return !!collaboration;
        } catch (error) {
            console.error('Check project access error:', error);
            return false;
        }
    }

    async saveMixerState(projectId, mixerState) {
        try {
            await this.userModel.updateProjectMixerState(projectId, mixerState);
        } catch (error) {
            console.error('Save mixer state error:', error);
        }
    }

    async saveChatMessage(projectId, message) {
        try {
            await this.userModel.saveChatMessage(projectId, message);
        } catch (error) {
            console.error('Save chat message error:', error);
        }
    }

    // Get active users in a project
    getProjectUsers(projectId) {
        const room = this.rooms.get(projectId);
        if (!room) return [];

        return Array.from(room)
            .filter(conn => conn.user)
            .map(conn => ({
                id: conn.user.id,
                username: conn.user.username,
                firstName: conn.user.first_name,
                lastName: conn.user.last_name,
                avatarUrl: conn.user.avatar_url,
                isOnline: true
            }));
    }

    // Send direct message to a user
    sendToUser(userId, message) {
        const connection = this.userConnections.get(userId);
        if (connection && connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify(message));
            return true;
        }
        return false;
    }

    // Get collaboration statistics
    getStats() {
        return {
            totalConnections: this.userConnections.size,
            activeRooms: this.rooms.size,
            roomDetails: Array.from(this.rooms.entries()).map(([projectId, connections]) => ({
                projectId,
                userCount: connections.size
            }))
        };
    }
}

module.exports = CollaborationService;