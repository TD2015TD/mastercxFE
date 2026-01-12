import { useState } from 'react';
import { Launcher } from 'popup-chat-react';

interface Message {
  author: string;
  type: 'text';
  data: {
    text: string;
  };
}

export const ChatWidget = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleNewMessage = (text: string) => {
    const newMessage: Message = {
      author: 'me',
      type: 'text',
      data: {
        text
      }
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulated bot response
    setTimeout(() => {
      const botMessage: Message = {
        author: 'them',
        type: 'text',
        data: {
          text: 'Thank you for your message. Our team will get back to you shortly.'
        }
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
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
