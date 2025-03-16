const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Keep track of connected users
let users = {};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = username;
    io.emit('user_joined', { 
      user: username, 
      users: Object.values(users),
      message: `${username} has joined the chat` 
    });
  });
  
  // Handle chat messages
  socket.on('chat_message', (data) => {
    io.emit('new_message', {
      user: users[socket.id],
      message: data.message,
      time: new Date().toLocaleTimeString()
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id];
    
    if (username) {
      io.emit('user_left', { 
        user: username, 
        users: Object.values(users),
        message: `${username} has left the chat` 
      });
    }
    
    console.log('Client disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
