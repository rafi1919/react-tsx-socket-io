import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; isCurrentUser: boolean }[]>([]);
  const [message, setMessage] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<string>('');
  const [joining, setJoining] = useState<boolean>(true);

  useEffect(() => {
    if (joining) {
      return; // Wait for user to input username and room
    }

    if (!currentUser || !currentRoom) {
      return; // Don't connect until user and room are provided
    }

    // Connect to the Socket.io server
    const newSocket = io('http://localhost:3002');
    setSocket(newSocket);

    // Emit the 'join' event to the server
    newSocket.emit('join', { username: currentUser, room: currentRoom });

    // Listen for incoming messages
    newSocket.on('message', (msg: string) => {
      const isCurrentUser = msg.startsWith(currentUser); // Check if the message is from the current user
      setMessages((prevMessages) => [...prevMessages, { text: msg, isCurrentUser }]);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.disconnect();
    };
  }, [currentUser, currentRoom, joining]);

  const handleSendMessage = () => {
    if (socket && currentUser && currentRoom) {
      const messageWithUser = `${currentUser}: ${message}`;
      // Emit a 'message' event to the server
      socket.emit('message', messageWithUser);
      setMessage('');
    }
  };

  const handleJoinChat = () => {
    setJoining(false);
  };

  return (
    <div>
      {joining ? (
        <div>
          <label>
            Enter your username:
            <input
              type="text"
              value={currentUser}
              onChange={(e) => setCurrentUser(e.target.value)}
            />
          </label>
          <label>
            Enter the room name:
            <input
              type="text"
              value={currentRoom}
              onChange={(e) => setCurrentRoom(e.target.value)}
            />
          </label>
          <button onClick={handleJoinChat}>Join Chat</button>
        </div>
      ) : (
        <div>
          <div>
            <h2>Chat Room: {currentRoom}</h2>
            <div>
              {messages.map((msg, index) => (
                <div key={index} style={{ fontWeight: msg.isCurrentUser ? 'bold' : 'normal' }}>
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
          <div>
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatApp;
