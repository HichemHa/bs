const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = socketIo(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);

        const otherClients = io.sockets.adapter.rooms.get(room);
        if (otherClients && otherClients.size > 1) {
            otherClients.forEach((clientId) => {
                if (clientId !== socket.id) {
                    io.to(clientId).emit('new-peer', { peerId: socket.id });
                }
            });
        }
    });

    socket.on('signal', (data) => {
        const { to, signal } = data;
        io.to(to).emit('signal', { from: socket.id, signal });
    });

    socket.on('send-comment', (data) => {
        const { roomId, comment } = data;
        io.to(roomId).emit('receive-comment', { userId: socket.id, comment });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
