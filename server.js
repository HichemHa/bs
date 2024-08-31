const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Permettre toutes les origines
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors());

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('createRoom', (roomId) => {
        socket.join(roomId);
        console.log(`Room ${roomId} created by ${socket.id}`);
    });

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`${socket.id} joined room ${roomId}`);

        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        const broadcaster = clients.find(clientId => clientId !== socket.id);

        if (broadcaster) {
            io.to(broadcaster).emit('newViewer', { peerId: socket.id });
        }
    });

    socket.on('sendStream', ({ to, stream }) => {
        io.to(to).emit('receiveStream', { peerId: socket.id, stream });
    });

    socket.on('comment', ({ roomId, message }) => {
        io.to(roomId).emit('receiveComment', { from: socket.id, message });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
