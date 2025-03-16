document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    
    // DOM elements
    const loginContainer = document.getElementById('login-container');
    const chatContainer = document.getElementById('chat-container');
    const usernameInput = document.getElementById('username-input');
    const joinBtn = document.getElementById('join-btn');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const messageContainer = document.getElementById('message-container');
    const usersList = document.getElementById('users');
    const userCount = document.getElementById('user-count');
    
    let currentUser = '';
    
    // Join chat when button is clicked
    joinBtn.addEventListener('click', joinChat);
    usernameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') joinChat();
    });
    
    function joinChat() {
      const username = usernameInput.value.trim();
      if (username) {
        currentUser = username;
        socket.emit('user_join', username);
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        messageInput.focus();
      }
    }
    
    // Send message when button is clicked
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    
    function sendMessage() {
      const message = messageInput.value.trim();
      if (message) {
        socket.emit('chat_message', { message });
        messageInput.value = '';
        messageInput.focus();
      }
    }
    
    // Handle incoming socket events
    socket.on('user_joined', (data) => {
      updateUserList(data.users);
      addSystemMessage(data.message);
    });
    
    socket.on('user_left', (data) => {
      updateUserList(data.users);
      addSystemMessage(data.message);
    });
    
    socket.on('new_message', (data) => {
      addChatMessage(data);
    });
    
    // Helper functions
    function updateUserList(users) {
      usersList.innerHTML = '';
      users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user === currentUser ? `${user} (You)` : user;
        usersList.appendChild(li);
      });
      userCount.textContent = users.length;
    }
    
    function addSystemMessage(text) {
      const div = document.createElement('div');
      div.className = 'message system-message';
      div.textContent = text;
      messageContainer.appendChild(div);
      scrollToBottom();
    }
    
    function addChatMessage(data) {
      const div = document.createElement('div');
      div.className = `message ${data.user === currentUser ? 'my-message' : 'other-message'}`;
      
      const sender = document.createElement('div');
      sender.className = 'message-sender';
      sender.textContent = data.user === currentUser ? 'You' : data.user;
      
      const messageText = document.createElement('div');
      messageText.textContent = data.message;
      
      const time = document.createElement('div');
      time.className = 'message-time';
      time.textContent = data.time;
      
      div.appendChild(sender);
      div.appendChild(messageText);
      div.appendChild(time);
      
      messageContainer.appendChild(div);
      scrollToBottom();
    }
    
    function scrollToBottom() {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  });