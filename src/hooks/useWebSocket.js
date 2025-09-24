import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const useWebSocket = (room = null) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [activeUsers, setActiveUsers] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const { user, token } = useAuth();
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Join room if specified
      if (room) {
        newSocket.emit('join:component', room);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    // Message events
    newSocket.on('chat:receive', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Typing indicators
    newSocket.on('typing:user', ({ userId, username, isTyping }) => {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        if (isTyping) {
          updated.add(username);
        } else {
          updated.delete(username);
        }
        return updated;
      });
    });

    // Active users
    newSocket.on('component:users', ({ count }) => {
      setActiveUsers(count);
    });

    // Notifications
    newSocket.on('notification:receive', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification if permitted
      if (Notification.permission === 'granted') {
        new Notification('New Notification', {
          body: notification.message,
          icon: '/icon-192x192.png'
        });
      }
    });

    // User status
    newSocket.on('user:offline', (userId) => {
      console.log(`User ${userId} went offline`);
    });

    // Cleanup
    return () => {
      if (room) {
        newSocket.emit('leave:component', room);
      }
      newSocket.close();
    };
  }, [token, room]);

  // Send message
  const sendMessage = useCallback((text) => {
    if (!socketRef.current || !connected) return;
    
    socketRef.current.emit('chat:message', {
      text,
      room: room || 'general'
    });
  }, [connected, room]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!socketRef.current || !connected) return;
    
    socketRef.current.emit('typing:start', room || 'general');
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [connected, room]);

  const stopTyping = useCallback(() => {
    if (!socketRef.current || !connected) return;
    
    socketRef.current.emit('typing:stop', room || 'general');
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [connected, room]);

  // Send notification to user
  const sendNotification = useCallback((targetUserId, type, message, data = {}) => {
    if (!socketRef.current || !connected) return;
    
    socketRef.current.emit('notification:send', {
      targetUserId,
      type,
      message,
      data
    });
  }, [connected]);

  // Collaboration
  const updateCollaboration = useCallback((componentId, data) => {
    if (!socketRef.current || !connected) return;
    
    socketRef.current.emit('collaboration:update', {
      componentId,
      ...data
    });
  }, [connected]);

  // Code sharing
  const shareCode = useCallback((componentId, code, cursor) => {
    if (!socketRef.current || !connected) return;
    
    socketRef.current.emit('code:change', {
      componentId,
      code,
      cursor
    });
  }, [connected]);

  // Training updates
  const sendTrainingUpdate = useCallback((modelId, data) => {
    if (!socketRef.current || !connected) return;
    
    socketRef.current.emit('training:progress', {
      modelId,
      ...data
    });
  }, [connected]);

  // Voice/Video calls
  const initiateCall = useCallback((targetUserId, offer) => {
    if (!socketRef.current || !connected) return;
    
    socketRef.current.emit('call:initiate', {
      targetUserId,
      offer
    });
  }, [connected]);

  const answerCall = useCallback((targetUserId, answer) => {
    if (!socketRef.current || !connected) return;
    
    socketRef.current.emit('call:answer', {
      targetUserId,
      answer
    });
  }, [connected]);

  const sendIceCandidate = useCallback((targetUserId, candidate) => {
    if (!socketRef.current || !connected) return;
    
    socketRef.current.emit('call:ice', {
      targetUserId,
      candidate
    });
  }, [connected]);

  // Screen sharing
  const startScreenShare = useCallback((room, stream) => {
    if (!socketRef.current || !connected) return;
    
    socketRef.current.emit('screen:share', {
      room,
      stream
    });
  }, [connected]);

  const stopScreenShare = useCallback((room) => {
    if (!socketRef.current || !connected) return;
    
    socketRef.current.emit('screen:stop', room);
  }, [connected]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  }, []);

  return {
    socket,
    connected,
    messages,
    typingUsers: Array.from(typingUsers),
    activeUsers,
    notifications,
    sendMessage,
    startTyping,
    stopTyping,
    sendNotification,
    updateCollaboration,
    shareCode,
    sendTrainingUpdate,
    initiateCall,
    answerCall,
    sendIceCandidate,
    startScreenShare,
    stopScreenShare,
    clearNotifications,
    markNotificationAsRead
  };
};

export default useWebSocket;