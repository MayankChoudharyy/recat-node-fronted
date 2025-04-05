import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  Button,
  Badge,
  Paper,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Menu as MenuIcon,
  Send as SendIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Code as CodeIcon,
  EmojiEmotions as EmojiIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import io from 'socket.io-client';
import './Chat.css';

const Chat = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [typing, setTyping] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      socketRef.current.emit('user_connected', user.userId);
    });

    socketRef.current.on('typing', (data) => {
      if (data.userId === selectedFriend?.userId) {
        setTyping(data.isTyping);
      }
    });

    socketRef.current.on('receive_message', (data) => {
      if (data.senderId === selectedFriend?.userId) {
        setMessages(prev => [...prev, data]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user.userId, selectedFriend]);

  useEffect(() => {
    // Fetch friend requests and friends list
    const fetchData = async () => {
      try {
        const [requestsRes, friendsRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/friend-requests`),
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/friends`)
        ]);

        const requests = await requestsRes.json();
        const friendsList = await friendsRes.json();

        setFriendRequests(requests);
        setFriends(friendsList);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedFriend) return;

    const messageData = {
      recipientId: selectedFriend.userId,
      senderId: user.userId,
      message: newMessage,
      timestamp: new Date()
    };

    socketRef.current.emit('send_message', messageData);
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
  };

  const handleSendCode = () => {
    if (!codeSnippet.trim() || !selectedFriend) return;

    const messageData = {
      recipientId: selectedFriend.userId,
      senderId: user.userId,
      message: codeSnippet,
      type: 'code',
      language: codeLanguage,
      timestamp: new Date()
    };

    socketRef.current.emit('send_message', messageData);
    setMessages(prev => [...prev, messageData]);
    setCodeSnippet('');
    setShowCodeDialog(false);
  };

  const handleTyping = () => {
    if (!selectedFriend) return;

    socketRef.current.emit('typing', {
      recipientId: selectedFriend.userId,
      userId: user.userId,
      isTyping: true
    });

    // Clear typing indicator after 2 seconds
    setTimeout(() => {
      socketRef.current.emit('typing', {
        recipientId: selectedFriend.userId,
        userId: user.userId,
        isTyping: false
      });
    }, 2000);
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/friend-request/accept/${requestId}`, {
        method: 'POST'
      });

      // Refresh friends list
      const friendsRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/friends`);
      const friendsList = await friendsRes.json();
      setFriends(friendsList);

      // Remove accepted request
      setFriendRequests(prev => prev.filter(request => request._id !== requestId));
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectFriendRequest = async (requestId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/friend-request/reject/${requestId}`, {
        method: 'POST'
      });

      // Remove rejected request
      setFriendRequests(prev => prev.filter(request => request._id !== requestId));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/friend-request/${userId}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEmojiClick = (event, emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <Box className="chat-container">
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Miki Chat
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            {user.name} (ID: {user.userId})
          </Typography>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <PersonIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        className="chat-menu"
      >
        <MenuItem onClick={handleLogout} className="chat-menu-item chat-logout-button">
          <LogoutIcon className="chat-menu-icon" />
          Logout
        </MenuItem>
      </Menu>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box className="chat-sidebar">
          <Box className="chat-friend-requests">
            <Typography variant="h6" sx={{ mb: 2 }}>
              Friend Requests
            </Typography>
            {friendRequests.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No pending friend requests
              </Typography>
            ) : (
              friendRequests.map((request) => (
                <Paper key={request._id} className="chat-friend-request-item">
                  <Typography variant="subtitle1">
                    {request.from.name} (ID: {request.from.userId})
                  </Typography>
                  <Box className="chat-friend-request-actions">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleAcceptFriendRequest(request._id)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleRejectFriendRequest(request._id)}
                    >
                      Reject
                    </Button>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
          <Divider />
          <Box className="chat-friends-list">
            <Typography variant="h6" sx={{ p: 2 }}>
              Friends
            </Typography>
            {friends.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No friends yet
              </Typography>
            ) : (
              friends.map((friend) => (
                <ListItem
                  key={friend._id}
                  className={`chat-friend-item ${selectedFriend?._id === friend._id ? 'active' : ''}`}
                  onClick={() => setSelectedFriend(friend)}
                >
                  <Avatar className="chat-friend-avatar">
                    {friend.name.charAt(0)}
                  </Avatar>
                  <Box className="chat-friend-info">
                    <Typography className="chat-friend-name">
                      {friend.name}
                    </Typography>
                    <Typography className="chat-friend-id">
                      ID: {friend.userId}
                    </Typography>
                  </Box>
                </ListItem>
              ))
            )}
          </Box>
        </Box>
      </Drawer>

      <Box className="chat-main">
        {selectedFriend ? (
          <>
            <Box className="chat-header">
              <Typography className="chat-header-title">
                {selectedFriend.name} (ID: {selectedFriend.userId})
              </Typography>
            </Box>

            <Box className="chat-messages">
              {messages.map((message, index) => (
                <Box
                  key={index}
                  className={`chat-message ${
                    message.senderId === user.userId ? 'chat-message-sent' : 'chat-message-received'
                  }`}
                >
                  {message.type === 'code' ? (
                    <Box className="chat-code-snippet">
                      <SyntaxHighlighter
                        language={message.language}
                        style={vscDarkPlus}
                        customStyle={{ margin: 0 }}
                      >
                        {message.message}
                      </SyntaxHighlighter>
                    </Box>
                  ) : (
                    <Typography>{message.message}</Typography>
                  )}
                  <Typography className="chat-message-time">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              ))}
              {typing && (
                <Typography className="chat-typing">
                  {selectedFriend.name} is typing...
                </Typography>
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Box className="chat-input">
              <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                <EmojiIcon />
              </IconButton>
              <IconButton onClick={() => setShowCodeDialog(true)}>
                <CodeIcon />
              </IconButton>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                className="chat-input-field"
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <SendIcon />
              </IconButton>
            </Box>

            {showEmojiPicker && (
              <Box className="chat-emoji-picker">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </Box>
            )}
          </>
        ) : (
          <Box className="chat-empty-state">
            <ChatIcon className="chat-empty-state-icon" />
            <Typography className="chat-empty-state-text">
              Select a friend to start chatting
            </Typography>
          </Box>
        )}
      </Box>

      <Dialog
        open={showCodeDialog}
        onClose={() => setShowCodeDialog(false)}
        maxWidth="md"
        fullWidth
        className="chat-code-dialog"
      >
        <DialogTitle>Send Code Snippet</DialogTitle>
        <DialogContent className="chat-code-dialog-content">
          <FormControl fullWidth className="chat-code-language-select">
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={codeLanguage}
              label="Language"
              onChange={(e) => setCodeLanguage(e.target.value)}
            >
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="java">Java</MenuItem>
              <MenuItem value="cpp">C++</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={10}
            label="Code"
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
            className="chat-code-textarea"
          />
        </DialogContent>
        <DialogActions className="chat-code-dialog-actions">
          <Button onClick={() => setShowCodeDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSendCode}
            variant="contained"
            disabled={!codeSnippet.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chat; 