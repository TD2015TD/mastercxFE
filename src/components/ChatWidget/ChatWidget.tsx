import { useState } from 'react';
import { Chat } from 'popup-chat-react';

interface Message {
  text: string;
  user: {
    name: string;
    avatar?: string;
  };
}

interface ChatWidgetProps {
  apiUrl?: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
}

export const ChatWidget = ({
  apiUrl = import.meta.env.VITE_API_URL,
  userId,
  userName = 'User',
  userAvatar
}: ChatWidgetProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Hello! How can I help you today?',
      user: {
        name: 'Support Agent',
        avatar: undefined
      }
    }
  ]);

  const handleNewMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      text,
      user: {
        name: userName,
        avatar: userAvatar
      }
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // TODO: Replace with your actual chat API endpoint
      // const response = await fetch(`${apiUrl}/api/chat/messages`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     message: text,
      //     userId
      //   })
      // });
      // const data = await response.json();

      // Simulated bot response
      setTimeout(() => {
        const botMessage: Message = {
          text: 'Thank you for your message. Our team will get back to you shortly.',
          user: {
            name: 'Support Agent',
            avatar: undefined
          }
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Chat
      messages={messages}
      onNewMessage={handleNewMessage}
      showAvatar
      showUsername
      placeholder="Type your message..."
    />
  );
};

export default ChatWidget;
