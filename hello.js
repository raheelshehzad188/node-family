const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*"
  }
});

let currentHeading = "Welcome Heading";

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send current heading to new user
  socket.emit('update_heading', currentHeading);

  // When user sends new heading
  socket.on('change_heading', (newHeading) => {
    currentHeading = newHeading;
    console.log(currentHeading); // Ye line terminal me nayi heading print karti hai
    io.emit('update_heading', currentHeading); // Sab clients ko update bhejta hai
    
    // Write the new heading to heading.txt
    const fs = require('fs');
    fs.appendFile('heading.txt', currentHeading + '\n', (err) => {
      if (err) {
        console.error('File likhne me error:', err);
      } else {
        console.log('Heading file me append kar diya:', currentHeading);
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Socket.IO server running on port 3000');
});
