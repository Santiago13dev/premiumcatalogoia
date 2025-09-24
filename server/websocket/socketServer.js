import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';

class SocketServer {
  constructor() {
    this.io = null;
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    });
    this.rooms = new Map();
    this.userSockets = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.setupRedisSubscriptions();

    console.log('WebSocket server initialized');
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.user = decoded;
        
        // Track user socket
        this.userSockets.set(decoded.id, socket.id);
        
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Join user's personal room
      socket.join(`user:${socket.userId}`);
      
      // Handle joining component rooms
      socket.on('join:component', async (componentId) => {
        socket.join(`component:${componentId}`);
        
        // Track active users in component
        await this.trackComponentUser(componentId, socket.userId, 'join');
        
        // Emit active users count
        const activeUsers = await this.getComponentActiveUsers(componentId);
        this.io.to(`component:${componentId}`).emit('component:users', {
          componentId,
          count: activeUsers
        });
      });
      
      // Handle leaving component rooms
      socket.on('leave:component', async (componentId) => {
        socket.leave(`component:${componentId}`);
        
        await this.trackComponentUser(componentId, socket.userId, 'leave');
        
        const activeUsers = await this.getComponentActiveUsers(componentId);
        this.io.to(`component:${componentId}`).emit('component:users', {
          componentId,
          count: activeUsers
        });
      });
      
      // Handle real-time collaboration
      socket.on('collaboration:update', (data) => {
        socket.to(`component:${data.componentId}`).emit('collaboration:sync', {
          userId: socket.userId,
          ...data
        });
      });
      
      // Handle live coding sessions
      socket.on('code:change', (data) => {
        socket.to(`component:${data.componentId}`).emit('code:update', {
          userId: socket.userId,
          code: data.code,
          cursor: data.cursor,
          timestamp: Date.now()
        });
      });
      
      // Handle chat messages
      socket.on('chat:message', async (data) => {
        const message = {
          id: Date.now().toString(),
          userId: socket.userId,
          username: socket.user.username,
          text: data.text,
          timestamp: new Date(),
          room: data.room || 'general'
        };
        
        // Save to Redis for history
        await this.saveMessage(data.room, message);
        
        // Broadcast to room
        this.io.to(data.room).emit('chat:receive', message);
      });
      
      // Handle typing indicators
      socket.on('typing:start', (room) => {
        socket.to(room).emit('typing:user', {
          userId: socket.userId,
          username: socket.user.username,
          isTyping: true
        });
      });
      
      socket.on('typing:stop', (room) => {
        socket.to(room).emit('typing:user', {
          userId: socket.userId,
          username: socket.user.username,
          isTyping: false
        });
      });
      
      // Handle notifications
      socket.on('notification:send', async (data) => {
        const targetSocketId = this.userSockets.get(data.targetUserId);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('notification:receive', {
            id: Date.now().toString(),
            type: data.type,
            message: data.message,
            data: data.data,
            timestamp: new Date()
          });
        } else {
          // Store offline notification
          await this.storeOfflineNotification(data.targetUserId, data);
        }
      });
      
      // Handle AI model training updates
      socket.on('training:start', (data) => {
        socket.join(`training:${data.modelId}`);
        this.io.to(`training:${data.modelId}`).emit('training:status', {
          status: 'started',
          modelId: data.modelId,
          timestamp: Date.now()
        });
      });
      
      socket.on('training:progress', (data) => {
        this.io.to(`training:${data.modelId}`).emit('training:update', {
          modelId: data.modelId,
          epoch: data.epoch,
          loss: data.loss,
          accuracy: data.accuracy,
          progress: data.progress
        });
      });
      
      // Handle screen sharing
      socket.on('screen:share', (data) => {
        socket.to(data.room).emit('screen:stream', {
          userId: socket.userId,
          stream: data.stream
        });
      });
      
      socket.on('screen:stop', (room) => {
        socket.to(room).emit('screen:ended', {
          userId: socket.userId
        });
      });
      
      // Handle voice calls
      socket.on('call:initiate', (data) => {
        const targetSocketId = this.userSockets.get(data.targetUserId);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('call:incoming', {
            callerId: socket.userId,
            callerName: socket.user.username,
            offer: data.offer
          });
        }
      });
      
      socket.on('call:answer', (data) => {
        const targetSocketId = this.userSockets.get(data.targetUserId);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('call:answered', {
            answer: data.answer
          });
        }
      });
      
      socket.on('call:ice', (data) => {
        const targetSocketId = this.userSockets.get(data.targetUserId);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('call:ice', {
            candidate: data.candidate
          });
        }
      });
      
      // Handle disconnection
      socket.on('disconnect', async () => {
        console.log(`User ${socket.userId} disconnected`);
        
        // Remove from tracked users
        this.userSockets.delete(socket.userId);
        
        // Update component active users
        const rooms = Array.from(socket.rooms);
        for (const room of rooms) {
          if (room.startsWith('component:')) {
            const componentId = room.replace('component:', '');
            await this.trackComponentUser(componentId, socket.userId, 'leave');
          }
        }
        
        // Notify others about user going offline
        this.io.emit('user:offline', socket.userId);
      });
    });
  }
  
  setupRedisSubscriptions() {
    const subscriber = new Redis();
    
    subscriber.subscribe('global:notifications');
    subscriber.subscribe('model:updates');
    subscriber.subscribe('system:alerts');
    
    subscriber.on('message', (channel, message) => {
      const data = JSON.parse(message);
      
      switch (channel) {
        case 'global:notifications':
          this.io.emit('notification:global', data);
          break;
        case 'model:updates':
          this.io.to(`model:${data.modelId}`).emit('model:update', data);
          break;
        case 'system:alerts':
          this.io.emit('system:alert', data);
          break;
      }
    });
  }
  
  async trackComponentUser(componentId, userId, action) {
    const key = `component:${componentId}:users`;
    
    if (action === 'join') {
      await this.redis.sadd(key, userId);
    } else {
      await this.redis.srem(key, userId);
    }
    
    // Set expiry to clean up inactive rooms
    await this.redis.expire(key, 3600); // 1 hour
  }
  
  async getComponentActiveUsers(componentId) {
    const key = `component:${componentId}:users`;
    const users = await this.redis.smembers(key);
    return users.length;
  }
  
  async saveMessage(room, message) {
    const key = `chat:${room}:messages`;
    await this.redis.lpush(key, JSON.stringify(message));
    await this.redis.ltrim(key, 0, 99); // Keep last 100 messages
    await this.redis.expire(key, 86400); // 24 hours
  }
  
  async getMessageHistory(room, limit = 50) {
    const key = `chat:${room}:messages`;
    const messages = await this.redis.lrange(key, 0, limit - 1);
    return messages.map(msg => JSON.parse(msg)).reverse();
  }
  
  async storeOfflineNotification(userId, notification) {
    const key = `user:${userId}:notifications`;
    await this.redis.lpush(key, JSON.stringify(notification));
    await this.redis.expire(key, 604800); // 7 days
  }
  
  // Broadcast to all connected users
  broadcast(event, data) {
    this.io.emit(event, data);
  }
  
  // Send to specific user
  sendToUser(userId, event, data) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }
  
  // Send to room
  sendToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }
  
  // Get online users count
  getOnlineUsersCount() {
    return this.userSockets.size;
  }
  
  // Get room members
  async getRoomMembers(room) {
    const sockets = await this.io.in(room).fetchSockets();
    return sockets.map(socket => ({
      userId: socket.userId,
      username: socket.user.username
    }));
  }
}

export default new SocketServer();