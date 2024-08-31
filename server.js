const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express(); // Create an Express app
const server = http.createServer(app); // Create an HTTP server using the Express app

// Example route
app.use(cors());

const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"],
        credentials: true
    }
});


// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    // Your signaling and room handling logic here
    socket.on('signal', (data) => {
        const { to, signal } = data;
        io.to(to).emit('signal', { from: socket.id, signal });
    });

    socket.on('join', (room) => {
        socket.join(room);
        const otherClients = io.sockets.adapter.rooms.get(room);
        if (otherClients && otherClients.size > 1) {
            otherClients.forEach((clientId) => {
                if (clientId !== socket.id) {
                    io.to(clientId).emit('new-peer', { peerId: socket.id });
                }
            });
        }
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
