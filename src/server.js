const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// basic check for critical env variables
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'SMTP_EMAIL', 'SMTP_PASSWORD'];
requiredEnv.forEach(env => {
    if (!process.env[env]) {
        console.warn(`WARNING: Environment variable ${env} is missing!`);
    }
});
const http = require('http');
const socketio = require('socket.io');
const connectDB = require('./config/db');
const app = require('./app');
const logger = require('./utils/logger');

// Connect to database
connectDB();

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Set Socket.io globally on the express app object
app.set('socketio', io);

// In-memory Moderation State
// Note: In production, consider moving this to Redis or MongoDB if you have multiple servers
const roomStates = {};

const initRoomState = (roomId) => {
    if (!roomStates[roomId]) {
        roomStates[roomId] = {
            isLocked: false,
            blockedUsers: new Set(),
            messages: []
        };
    }
};

// Socket Auth Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }

    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (err) {
        next(new Error('Authentication error: Invalid token'));
    }
});

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    socket.on('joinRoom', ({ roomId }) => {
        socket.join(roomId);
        initRoomState(roomId);
        console.log(`User joined room: ${roomId}`);

        // Immediately inform the user if the room is currently locked
        socket.emit('roomState', {
            isLocked: roomStates[roomId].isLocked
        });

        // SEND CHAT HISTORY TO THE JOINING USER
        if (roomStates[roomId].messages.length > 0) {
            socket.emit('chatHistory', {
                messages: roomStates[roomId].messages
            });
        }
    });

    socket.on('chatMessage', (data) => {
        // data: { roomId, user, userId, message }
        const roomId = data.roomId;
        initRoomState(roomId);
        
        const state = roomStates[roomId];
        
        // Admin messages always bypass all filters!
        const isAdmin = data.user === 'Admin' || data.user === 'Moderator';
        
        if (!isAdmin) {
            // 1. Check Global Chat Lock
            if (state.isLocked) {
                socket.emit('chatError', { message: 'Chat is currently locked by the Admin.' });
                return;
            }
            // 2. Check Individual User Ban
            if (data.userId && state.blockedUsers.has(data.userId)) {
                socket.emit('chatError', { message: 'You have been blocked from sending messages by a Moderator.' });
                return;
            }
        }

        const newMessage = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            user: data.user,
            userId: data.userId,
            message: data.message,
            createdAt: new Date()
        };

        // Persist message in server memory
        roomStates[roomId].messages.push(newMessage);

        io.to(roomId).emit('message', newMessage);
    });

    // --- Admin Moderation Socket Endpoints ---

    socket.on('lockRoom', ({ roomId, isLocked }) => {
        initRoomState(roomId);
        roomStates[roomId].isLocked = isLocked;
        // Broadcast the lock state to hide/show the input boxes for everyone
        io.to(roomId).emit('roomState', { isLocked });
    });

    socket.on('blockUser', ({ roomId, userId }) => {
        if (!userId) return;
        initRoomState(roomId);
        roomStates[roomId].blockedUsers.add(userId);
        io.to(roomId).emit('userBlocked', { userId });
        console.log(`[Moderation] User ${userId} blocked in room ${roomId}`);
    });

    socket.on('unblockUser', ({ roomId, userId }) => {
        if (!userId) return;
        initRoomState(roomId);
        roomStates[roomId].blockedUsers.delete(userId);
        io.to(roomId).emit('userUnblocked', { userId });
        console.log(`[Moderation] User ${userId} unblocked in room ${roomId}`);
    });

    socket.on('clearChat', ({ roomId }) => {
        initRoomState(roomId);
        // Wipe server memory for this room
        roomStates[roomId].messages = [];
        // Broadcasts to all students to instantly empty their arrays
        io.to(roomId).emit('chatCleared');
        console.log(`[Moderation] Chat cleared for room ${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info({ 
        port: PORT, 
        env: process.env.NODE_ENV || 'production' 
    }, 'Server started successfully');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    logger.fatal({ err }, 'Unhandled Promise Rejection! Shutting down.');
    // Close server & exit process
    server.close(() => process.exit(1));
});
