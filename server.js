const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server);

const users = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', (data) => {
    console.log(`User ${data.username} joined room ${data.room}`);

    // Join the specific room
    socket.join(data.room);

    // Store the user's information in the users object
    users[socket.id] = {
      username: data.username,
      room: data.room,
    };

    // Broadcast a system message about the user joining
    io.to(data.room).emit('message', `System: ${data.username} has joined the room`);
  });

  socket.on('message', (msg) => {
    const user = users[socket.id];

    if (user) {
      console.log(`Message from ${user.username} in room ${user.room}: ${msg}`);

      // Broadcast the message to all clients in the same room
      io.to(user.room).emit('message', `${user.username}: ${msg}`);
    }
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];

    if (user) {
      console.log(`User ${user.username} in room ${user.room} disconnected`);

      // Broadcast a system message about the user disconnecting
      io.to(user.room).emit('message', `System: ${user.username} has left the room`);

      // Remove the user's information from the users object
      delete users[socket.id];
    }
  });
});

const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
