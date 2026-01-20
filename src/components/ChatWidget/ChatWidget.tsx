import { useState, useEffect, useRef } from 'react';
import { Launcher } from 'popup-chat-react';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  author: string;
  type: 'text';
  data: {
    text: string;
  };
}

const AI_CHAT_SERVICE_URL = import.meta.env.VITE_AI_CHAT_SERVICE_URL || 'ws://localhost:8000';

export const ChatWidget = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const isConnectedRef = useRef<boolean>(false);

  // WebSocket connection for agent-customer chat
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(`${AI_CHAT_SERVICE_URL}/ws/agent-customer-chat`);
        
        ws.onopen = () => {
          console.log('Agent connected to ai-chat-service');
          
          // Send connection message
          ws.send(JSON.stringify({
            type: 'connect',
            sender: 'agent',
            session_id: sessionIdRef.current,
            user_id: user?.id || 'agent_unknown',
          }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          console.log('Received message:', data);
          
          if (data.type === 'error') {
            console.error('WebSocket error:', data.error);
            return;
          }

          if (data.type === 'connected') {
            isConnectedRef.current = true;
            console.log('Agent connected successfully:', data);
          }

          if (data.type === 'message') {
            // Received message from customer (already translated if needed)
            const customerMessage: Message = {
              author: 'them',
              type: 'text',
              data: {
                text: data.content
              }
            };
            
            setMessages(prev => [...prev, customerMessage]);
          }

          if (data.type === 'message_sent') {
            console.log('Message sent confirmation:', data);
          }

          if (data.type === 'disconnected') {
            console.log('Other party disconnected:', data.sender);
            const systemMessage: Message = {
              author: 'them',
              type: 'text',
              data: {
                text: '(Customer has left the chat)'
              }
            };
            setMessages(prev => [...prev, systemMessage]);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected, attempting to reconnect...');
          isConnectedRef.current = false;
          // Attempt to reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
      }
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        // Send disconnect message
        if (isConnectedRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'disconnect',
            sender: 'agent',
            session_id: sessionIdRef.current,
          }));
        }
        wsRef.current.close();
      }
    };
  }, [user]);

  const handleNewMessage = (text: string) => {
    const newMessage: Message = {
      author: 'me',
      type: 'text',
      data: {
        text
      }
    };

    setMessages(prev => [...prev, newMessage]);

    // Send message through WebSocket to ai-chat-service
    // Agent writes in English, will be translated to Malay for customer
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        sender: 'agent',
        content: text,
        session_id: sessionIdRef.current,
        user_id: user?.id || 'agent_unknown',
      }));
    } else {
      // Fallback if WebSocket is not connected
      const errorMessage: Message = {
        author: 'them',
        type: 'text',
        data: {
          text: 'Unable to connect to chat service. Please try again.'
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <Launcher
      agentProfile={{
        teamName: 'Customer Support'
      }}
      messageList={messages}
      onMessageWasSent={handleNewMessage}
      isOpen={isOpen}
      handleClick={() => setIsOpen(!isOpen)}
      showEmoji={false}
    />
  );
};
