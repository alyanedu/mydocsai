// types.d.ts or src/types.d.ts

// Declare the main module (client-side)
declare module 'mydocsai' {
  import { ReactNode } from 'react';

  interface Theme {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    gradientStart?: string;
    gradientEnd?: string;
    shadowColor?: string;
    accentColor?: string;
  }

  interface Size {
    desktop?: { width: string; height: string };
    mobile?: { width: string; height: string };
  }

  interface Messages {
    welcomeMessage?: string;
    placeholder?: string;
    errorMessage?: string;
    sendButton?: string;
    closeButton?: string;
    minimizeButton?: string;
    retryButton?: string;
    clearChatButton?: string;
  }

  interface Animation {
    enabled?: boolean;
    duration?: number;
    easing?: string;
    slideDirection?: 'up' | 'down' | 'left' | 'right';
    fadeIn?: boolean;
    bounceEffect?: boolean;
  }

  interface Behavior {
    startMinimized?: boolean;
    showWelcomeMessage?: boolean;
    enableMarkdown?: boolean;
    enableStreaming?: boolean;
    closeOnOutsideClick?: boolean;
    autoFocus?: boolean;
    persistMessages?: boolean;
    showTimestamps?: boolean;
    enableRetry?: boolean;
    enableClearChat?: boolean;
    showTypingIndicator?: boolean;
    enableSoundEffects?: boolean;
  }

  interface Responsive {
    breakpoint?: number;
    mobileFullScreen?: boolean;
    adaptiveHeight?: boolean;
    minHeight?: string;
    maxHeight?: string;
  }

  interface Table {
    enableHorizontalScroll?: boolean;
    maxColumnsBeforeScroll?: number;
    cellMaxWidth?: string;
    headerBackground?: string;
    rowStriping?: boolean;
    hoverEffect?: boolean;
  }

  interface Accessibility {
    announceMessages?: boolean;
    keyboardNavigation?: boolean;
    highContrast?: boolean;
    reduceMotion?: boolean;
    fontSize?: 'small' | 'medium' | 'large';
  }

  interface ChatBotConfig {
    apiEndpoint?: string;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    theme?: Theme;
    size?: Size;
    messages?: Messages;
    animation?: Animation;
    behavior?: Behavior;
    responsive?: Responsive;
    table?: Table;
    accessibility?: Accessibility;
    userKey?: string | boolean;
    chatId?: string | boolean;
    limit?: number;
    customCSS?: string;
    avatar?: {
      bot?: string;
      user?: string;
    };
  }

  interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    status: 'complete' | 'thinking' | 'streaming' | 'error';
  }

  interface DocsAIChatBotProps {
    config: ChatBotConfig;
    onError?: (error: Error, context: string) => void;
    onMessageSent?: (message: Message) => void;
    onMessageReceived?: (message: Message) => void;
    onChatOpened?: () => void;
    onChatClosed?: () => void;
    onChatCleared?: () => void;
  }

  const DocsAIChatBot: React.FC<DocsAIChatBotProps>;
  export default DocsAIChatBot;
  export { DocsAIChatBot };
}

// Declare the backend module
declare module 'mydocsai/backend' {
  import { IncomingMessage, ServerResponse } from 'http';
  import { NextRequest, NextResponse } from 'next/server';

  interface DocsAiProxyOptions {
    docsAiApiKey: string | undefined;
    docsAiApiBaseUrl?: string;
  }

  export function createDocsAiProxy(options: DocsAiProxyOptions): (req: IncomingMessage, res: ServerResponse) => Promise<void>;
  export function createNextDocsAiProxy(options: DocsAiProxyOptions): (req: NextRequest) => Promise<NextResponse>;
}