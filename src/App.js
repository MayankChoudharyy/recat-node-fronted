import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

// 🔥 Load existing user ID from localStorage
const savedUserId = localStorage.getItem("userId");

const socket = io("https://react-node-backend-production.up.railway.app", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  query: {
      deviceId: localStorage.getItem("deviceId") || (() => {
          const newDeviceId = Math.random().toString(36).substring(2, 15);
          localStorage.setItem("deviceId", newDeviceId);
          return newDeviceId;
      })(),
  }
});


function App() {
  const [userId, setUserId] = useState(savedUserId || null);
  const [friendId, setFriendId] = useState("");
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [connectedFriend, setConnectedFriend] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingText, setTypingText] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    socket.on("userId", (id) => {
      if (!localStorage.getItem("userId")) {
          localStorage.setItem("userId", id); // 🔥 Store user ID permanently
          setUserId(id);
      } else {
          setUserId(localStorage.getItem("userId")); // ✅ Ensure it remains same
      }
  });
  

    socket.on("friendRequest", (id) => setIncomingRequest(id));
    socket.on("chatStarted", (id) => {
      setConnectedFriend(id);
      setIncomingRequest(null);
    });

    socket.on("displayTyping", (text) => setTypingText(text));
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("chatEnded", () => {
      alert("Friend disconnected. Restarting chat...");
      setConnectedFriend(null);
      setMessages([]);
    });

    return () => {
      socket.off("userId");
      socket.off("friendRequest");
      socket.off("chatStarted");
      socket.off("displayTyping");
      socket.off("receiveMessage");
      socket.off("chatEnded");
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendRequest = () => {
    if (friendId.trim()) {
        console.log("Sending friend request to:", friendId);
        socket.emit("sendRequest", friendId);
    }
  };

  const acceptRequest = () => {
    if (incomingRequest) {
      socket.emit("acceptRequest", incomingRequest);
      setIncomingRequest(null);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", e.target.value);
  };

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("sendMessage", message);
      setMessages((prev) => [...prev, { sender: userId, text: message }]);
      setMessage("");
      setTypingText(""); // Clear typing for both users after sending
      socket.emit("typing", ""); // Clear typing from other side too
    }
  };

  const handleDisconnect = () => {
    socket.emit("user_disconnect");
    setConnectedFriend(null);
    setMessages([]);
    setTypingText("");
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Miki Chat</h1>
        <p className="user-id">Your ID: {userId}</p>
      </header>

      {!userId ? (
        <h3>Connecting...</h3>
      ) : (
        <div>
          {connectedFriend ? (
            <div className="chat-box">
              <div className="chat-header">
                <h4>Chatting with {connectedFriend}</h4>
                <button className="disconnect-btn" onClick={handleDisconnect}>
                  Disconnect
                </button>
              </div>

              {/* Chat Messages Area - Scrollable */}
              <div className="messages" ref={chatRef}>
                {messages.map((msg, index) => (
                  <p key={index} className={msg.sender === userId ? "sent" : "received"}>
                    {msg.text}
                  </p>
                ))}
                {typingText && <p className="live-message">{typingText}</p>}
              </div>

              {/* Message Input Box */}
              <div className="input-box">
                <textarea
                  placeholder="Type here..."
                  value={message}
                  onChange={handleTyping}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          ) : incomingRequest ? (
            <div className="friend-request">
              <p>Friend Request from {incomingRequest}</p>
              <button onClick={acceptRequest}>Accept</button>
            </div>
          ) : (
            <div className="start-chat">
              <h3>Start Chatting</h3>
              <input
                type="text"
                placeholder="Enter friend ID"
                value={friendId}
                onChange={(e) => setFriendId(e.target.value)}
              />
              <button onClick={sendRequest}>Send Request</button>
              <p>Share your ID with a friend to chat!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
