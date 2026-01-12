declare module 'popup-chat-react' {
  export interface Message {
    author: string;
    type: 'text' | 'emoji' | 'file';
    data: {
      text?: string;
      emoji?: string;
      file?: {
        name: string;
        url: string;
      };
    };
  }

  export interface AgentProfile {
    teamName: string;
    imageUrl?: string;
  }

  export interface LauncherProps {
    agentProfile: AgentProfile;
    messageList: Message[];
    onMessageWasSent: (text: string) => void;
    isOpen: boolean;
    handleClick: () => void;
    showEmoji?: boolean;
  }

  export const Launcher: React.FC<LauncherProps>;
}

