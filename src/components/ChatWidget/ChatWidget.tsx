import { useState, useEffect, useRef } from 'react';
import { Launcher } from 'popup-chat-react';
import { authService } from '../../services/authService';

interface Message {
  author: string;
  type: 'text';
  data: { text: string };
}

interface ChatWidgetProps {
  mitelInteractionId?: string;
}

const AI_CHAT_SERVICE_URL = import.meta.env.VITE_AI_CHAT_SERVICE_URL || 'wss://chat.telediant.com.my';

export const ChatWidget = ({ mitelInteractionId }: ChatWidgetProps) => {
  const user = authService.getCurrentUser();
  const agentUserId = user?.agent?.agent_code || user?.id?.toString() || 'agent_unknown';

  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isConnectedRef = useRef<boolean>(false);

  // Use Mitel interaction ID as session; fall back to a random one for standalone use.
  const sessionIdRef = useRef<string>(
    mitelInteractionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Re-connect when a new Mitel interaction is assigned to this agent.
  useEffect(() => {
    if (mitelInteractionId) {
      sessionIdRef.current = mitelInteractionId;
      // Tear down any existing socket so connectWebSocket opens a fresh one.
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      setMessages([]);
      isConnectedRef.current = false;
    }
  }, [mitelInteractionId]);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(`${AI_CHAT_SERVICE_URL}/ws/agent-customer-chat`);

        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: 'connect',
            sender: 'agent',
            session_id: sessionIdRef.current,
            user_id: agentUserId,
          }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.type === 'error') {
            console.error('ChatWidget WS error:', data.error);
            return;
          }

          if (data.type === 'connected') {
            isConnectedRef.current = true;
          }

          if (data.type === 'message') {
            setMessages(prev => [...prev, {
              author: 'them',
              type: 'text',
              data: { text: data.content }
            }]);
          }

          if (data.type === 'disconnected') {
            setMessages(prev => [...prev, {
              author: 'them',
              type: 'text',
              data: { text: '(Customer has left the chat)' }
            }]);
          }
        };

        ws.onerror = (err) => console.error('ChatWidget WS error:', err);

        ws.onclose = () => {
          isConnectedRef.current = false;
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };

        wsRef.current = ws;
      } catch (err) {
        console.error('ChatWidget: failed to connect', err);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        if (isConnectedRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'disconnect',
            sender: 'agent',
            session_id: sessionIdRef.current,
          }));
        }
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [agentUserId]);

  const handleNewMessage = (text: string) => {
    setMessages(prev => [...prev, { author: 'me', type: 'text', data: { text } }]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        sender: 'agent',
        content: text,
        session_id: sessionIdRef.current,
        user_id: agentUserId,
      }));
    } else {
      setMessages(prev => [...prev, {
        author: 'them',
        type: 'text',
        data: { text: 'Unable to connect to chat service. Please try again.' }
      }]);
    }
  };

  return (
    <Launcher
      agentProfile={{ teamName: 'Customer Support' }}
      messageList={messages}
      onMessageWasSent={handleNewMessage}
      isOpen={isOpen}
      handleClick={() => setIsOpen(!isOpen)}
      showEmoji={false}
    />
  );
};
