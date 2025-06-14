// D:/npm/mydocsai/src/DocsAIChatBot.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles.css';

import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Enhanced Icons with better visual appeal
const MessageCircle = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const Send = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const X = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Bot = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Minimize2 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h6m0 0v6m0-6l-7 7m17-11h-6m0 0V4m0 6l7-7" />
  </svg>
);

const Trash2 = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const RotateCcw = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 4v6h6m16 10v-6h-6M7.536 7.464C9.07 5.93 11.123 5 13.5 5c4.694 0 8.5 3.806 8.5 8.5S18.194 22 13.5 22c-4.694 0-8.5-3.806-8.5-8.5" />
  </svg>
);

// Enhanced Markdown renderer with improved table handling and smooth streaming
const MarkdownRenderer = ({ content, tableConfig, isStreaming = false }) => {
  const tableRef = useRef(null);
  const [isTableScrollable, setIsTableScrollable] = useState(false);

  useEffect(() => {
    if (tableRef.current) {
      const checkScrollable = () => {
        const table = tableRef.current.querySelector('table');
        if (table) {
          const containerWidth = tableRef.current.offsetWidth;
          const tableWidth = table.scrollWidth;
          setIsTableScrollable(tableWidth > containerWidth);
        }
      };

      // Check scrollability after content updates
      setTimeout(checkScrollable, 50);
      window.addEventListener('resize', checkScrollable);
      return () => window.removeEventListener('resize', checkScrollable);
    }
  }, [content]);

  return (
    <div className={`docs-ai-markdown ${isStreaming ? 'docs-ai-streaming' : ''}`} ref={tableRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <pre className="docs-ai-code-block">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="docs-ai-code" {...props}>
                {children}
              </code>
            )
          },
          table: ({ node, ...props }) => {
            return (
              <div className={`docs-ai-table-wrapper ${isTableScrollable ? 'docs-ai-scrollable' : ''}`}>
                <div className="docs-ai-table-scroll-indicator">
                  {isTableScrollable && (
                    <div className="docs-ai-scroll-hint">
                      <span>← Scroll horizontally to see more →</span>
                    </div>
                  )}
                </div>
                <div className="docs-ai-table-container">
                  <table 
                    className="docs-ai-table" 
                    style={{
                      '--table-header-bg': tableConfig?.headerBackground || 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.2))',
                      '--table-cell-max-width': tableConfig?.cellMaxWidth || '200px'
                    }}
                    {...props} 
                  />
                </div>
                {isTableScrollable && (
                  <div className="docs-ai-table-scroll-shadow"></div>
                )}
              </div>
            );
          },
          th: ({ node, ...props }) => <th className="docs-ai-table-th" {...props} />,
          td: ({ node, ...props }) => <td className="docs-ai-table-td" {...props} />,
          p: ({ node, ...props }) => <p className="docs-ai-paragraph" {...props} />,
          strong: ({ node, ...props }) => <strong className="docs-ai-strong" {...props} />,
          em: ({ node, ...props }) => <em className="docs-ai-emphasis" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="docs-ai-blockquote" {...props} />,
          ul: ({ node, ...props }) => <ul className="docs-ai-list" {...props} />,
          ol: ({ node, ...props }) => <ol className="docs-ai-list docs-ai-ordered-list" {...props} />,
          li: ({ node, ...props }) => <li className="docs-ai-list-item" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

// Enhanced default configuration with improved theme visibility
const defaultConfig = {
  apiEndpoint: '/api/docs-ai-proxy',
  theme: {
    primaryColor: '#06d6a0',
    secondaryColor: '#118ab2',
    backgroundColor: '#073b4c',
    textColor: '#ffffff',
    borderRadius: '24px',
    gradientStart: '#06d6a0',
    gradientEnd: '#118ab2',
    shadowColor: 'rgba(6, 214, 160, 0.35)',
    accentColor: '#ffd166',
    surfaceColor: '#0f3460',
    borderColor: 'rgba(6, 214, 160, 0.3)',
  },
  size: {
    desktop: { width: '420px', height: '650px' },
    mobile: { width: '100vw', height: '100vh' },
  },
  messages: {
    welcomeMessage: '👋 Hello! How can I help you today?',
    placeholder: 'Type your message here...',
    sendButton: 'Send',
    closeButton: 'Close',
    minimizeButton: 'Minimize',
    retryButton: 'Retry',
    clearChatButton: 'Clear Chat',
    errorMessage: 'Sorry, something went wrong. Please try again.',
  },
  animation: {
    enabled: true,
    duration: 0.4,
    easing: 'easeOut',
    slideDirection: 'up',
    fadeIn: true,
    bounceEffect: true,
  },
  behavior: {
    startMinimized: true,
    showWelcomeMessage: true,
    enableMarkdown: true,
    enableStreaming: true,
    closeOnOutsideClick: false,
    autoFocus: true,
    persistMessages: false,
    showTimestamps: true,
    enableRetry: true,
    enableClearChat: true,
    showTypingIndicator: true,
    enableSoundEffects: false,
    smoothScrolling: true,
  },
  responsive: {
    breakpoint: 768,
    mobileFullScreen: true,
    adaptiveHeight: true,
    minHeight: '400px',
    maxHeight: '80vh',
  },
  table: {
    enableHorizontalScroll: true,
    maxColumnsBeforeScroll: 4,
    cellMaxWidth: '250px',
    headerBackground: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.2))',
    rowStriping: true,
    hoverEffect: true,
    showScrollHint: true,
  },
  accessibility: {
    announceMessages: true,
    keyboardNavigation: true,
    highContrast: false,
    reduceMotion: false,
    fontSize: 'medium',
  },
  userKey: false,
  chatId: true,
  limit: 10,
  avatar: {
    bot: null,
    user: null,
  },
};

// Hook for mobile detection
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [breakpoint]);

  return isMobile;
};

// Enhanced smooth scrolling hook
const useSmoothScroll = (dependency, enabled = true) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const scrollToBottom = () => {
      elementRef.current.scrollTo({
        top: elementRef.current.scrollHeight,
        behavior: 'smooth'
      });
    };

    // Small delay to ensure content is rendered
    const timeoutId = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeoutId);
  }, [dependency, enabled]);

  return elementRef;
};

// Main ChatBot component
const DocsAIChatBot = ({
  config,
  onError,
  onMessageSent,
  onMessageReceived,
  onChatOpened,
  onChatClosed,
  onChatCleared
}) => {
  const finalConfig = {
    ...defaultConfig,
    ...config,
    theme: { ...defaultConfig.theme, ...config?.theme },
    animation: { ...defaultConfig.animation, ...config?.animation },
    behavior: { ...defaultConfig.behavior, ...config?.behavior },
    responsive: { ...defaultConfig.responsive, ...config?.responsive },
    table: { ...defaultConfig.table, ...config?.table },
    accessibility: { ...defaultConfig.accessibility, ...config?.accessibility },
    messages: { ...defaultConfig.messages, ...config?.messages },
    apiEndpoint: config?.apiEndpoint || defaultConfig.apiEndpoint
  };

  const isMobile = useIsMobile(finalConfig.responsive.breakpoint);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [streamingMessageId, setStreamingMessageId] = useState(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);
  const userKeyRef = useRef(null);
  const [currentChatId, setCurrentChatId] = useState(null);

  // Enhanced smooth scrolling
  const messagesRef = useSmoothScroll(
    [messages, streamingMessageId], 
    finalConfig.behavior.smoothScrolling
  );

  // Enhanced initialization
  useEffect(() => {
    setIsOpen(!finalConfig.behavior.startMinimized);
  }, [finalConfig.behavior.startMinimized]);

  // Handle user key
  useEffect(() => {
    if (finalConfig.userKey === true) {
      let storedUserKey = localStorage.getItem('docsai_user_key');
      if (!storedUserKey) {
        storedUserKey = `user_${Math.random().toString(36).substring(2, 10)}`;
        localStorage.setItem('docsai_user_key', storedUserKey);
      }
      userKeyRef.current = storedUserKey;
    } else if (typeof finalConfig.userKey === 'string') {
      userKeyRef.current = finalConfig.userKey;
      localStorage.removeItem('docsai_user_key');
    } else {
      userKeyRef.current = null;
      localStorage.removeItem('docsai_user_key');
    }
  }, [finalConfig.userKey]);

  // Handle chat ID
  useEffect(() => {
    if (finalConfig.chatId === true) {
      setCurrentChatId(Math.random().toString(36).substring(7));
    } else if (typeof finalConfig.chatId === 'string') {
      setCurrentChatId(finalConfig.chatId);
    } else {
      setCurrentChatId(null);
    }
  }, [finalConfig.chatId]);

  // Enhanced mobile styles
  const getMobileStyles = () => {
    if (!isMobile || !finalConfig.responsive.mobileFullScreen) {
      return {
        width: finalConfig.size.desktop.width,
        height: finalConfig.size.desktop.height,
        minHeight: finalConfig.responsive.minHeight,
        maxHeight: finalConfig.responsive.maxHeight,
      };
    }

    return {
      width: '100vw',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 0,
    };
  };

  // Initialize with welcome message
  useEffect(() => {
    if (finalConfig.behavior.showWelcomeMessage && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: finalConfig.messages.welcomeMessage,
        timestamp: new Date().toISOString(),
        status: 'complete'
      }]);
    }
  }, [finalConfig.behavior.showWelcomeMessage, finalConfig.messages.welcomeMessage, messages.length]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current && finalConfig.behavior.autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, finalConfig.behavior.autoFocus]);

  // Handle outside clicks
  useEffect(() => {
    if (!finalConfig.behavior.closeOnOutsideClick || !isOpen) return;

    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
        if (onChatClosed) onChatClosed();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, finalConfig.behavior.closeOnOutsideClick, onChatClosed]);

  // Enhanced error handling
  const handleError = (error, context) => {
    console.error(`DocsAI ChatBot Error (${context}):`, error);
    if (onError) {
      onError(error, context);
    }
  };

  // Clear chat function
  const clearChat = () => {
    setMessages(finalConfig.behavior.showWelcomeMessage ? [{
      id: 'welcome',
      role: 'assistant',
      content: finalConfig.messages.welcomeMessage,
      timestamp: new Date().toISOString(),
      status: 'complete'
    }] : []);
    setStreamingMessageId(null);
    if (onChatCleared) onChatCleared();
  };

  // Enhanced chat open/close handlers
  const handleChatOpen = () => {
    setIsOpen(true);
    if (onChatOpened) onChatOpened();
  };

  const handleChatClose = () => {
    setIsOpen(false);
    if (onChatClosed) onChatClosed();
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    if (!finalConfig.apiEndpoint) {
      handleError(new Error('apiEndpoint is required in config. Please provide your backend proxy endpoint.'), 'configuration');
      return;
    }

    const messageId = Math.random().toString(36).substring(7);
    const userMessage = {
      id: `user-${messageId}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      status: 'complete'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessageContent = message;
    setMessage('');
    setIsLoading(true);

    if (onMessageSent) {
      onMessageSent(userMessage);
    }

    const assistantMessageId = `assistant-${messageId}`;
    const thinkingMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'thinking'
    };
    setMessages(prev => [...prev, thinkingMessage]);

    const requestBody = {
      content: currentMessageContent,
      stream: finalConfig.behavior.enableStreaming,
    };

    if (currentChatId) {
      requestBody.chatId = currentChatId;
    }

    if (userKeyRef.current) {
      requestBody.userKey = userKeyRef.current;
    }

    if (finalConfig.limit !== undefined) {
      requestBody.limit = finalConfig.limit;
    }

    try {
      if (finalConfig.behavior.enableStreaming) {
        await handleStreamingResponse(requestBody, assistantMessageId);
      } else {
        await handleRegularResponse(requestBody, assistantMessageId);
      }
    } catch (error) {
      handleError(error, 'message_sending');
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? {
              ...msg,
              content: finalConfig.messages.errorMessage,
              status: 'error'
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  const handleStreamingResponse = async (requestBody, messageId) => {
    try {
      const response = await fetch(finalConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      setStreamingMessageId(messageId);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'streaming', content: '' }
          : msg
      ));

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let messageEndIndex;
        while ((messageEndIndex = buffer.indexOf('\n\n')) !== -1) {
          const fullMessage = buffer.substring(0, messageEndIndex);
          buffer = buffer.substring(messageEndIndex + 2);

          if (fullMessage.startsWith('data: ')) {
            const jsonString = fullMessage.substring(6);
            try {
              const parsed = JSON.parse(jsonString);
              if (parsed.message === '[DONE]') {
                setMessages(prev => prev.map(msg => 
                  msg.id === messageId 
                    ? { ...msg, status: 'complete' }
                    : msg
                ));
                setStreamingMessageId(null);
                
                const completedMessage = messages.find(m => m.id === messageId);
                if (completedMessage && onMessageReceived) {
                  onMessageReceived({ ...completedMessage, status: 'complete' });
                }
              } else if (parsed.message) {
                setMessages(prev => prev.map(msg => 
                  msg.id === messageId 
                    ? { ...msg, content: msg.content + parsed.message }
                    : msg
                ));
              }
            } catch (parseError) {
              handleError(parseError, 'stream_parsing');
            }
          }
        }
      }
    } catch (error) {
      throw new Error(`Streaming failed: ${error.message}`);
    }
  };

  const handleRegularResponse = async (requestBody, messageId) => {
    try {
      const response = await fetch(finalConfig.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? {
              ...msg,
              content: data.message,
              status: 'complete'
            }
          : msg
      ));

      const assistantMessage = {
        id: messageId,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        status: 'complete'
      };

      if (onMessageReceived) {
        onMessageReceived(assistantMessage);
      }
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Enhanced position styles
  const getPositionStyles = () => {
    if (isMobile && finalConfig.responsive.mobileFullScreen && isOpen) {
      return 'fixed inset-0 z-50';
    }

    if (!finalConfig.position) {
      return '';
    }

    const base = 'fixed z-50';
    const spacing = isMobile ? '4' : '6';

    switch (finalConfig.position) {
      case 'bottom-left':
        return `${base} bottom-${spacing} left-${spacing}`;
      case 'top-right':
        return `${base} top-${spacing} right-${spacing}`;
      case 'top-left':
        return `${base} top-${spacing} left-${spacing}`;
      case 'bottom-right':
        return `${base} bottom-${spacing} right-${spacing}`;
      default:
        return '';
    }
  };

  // Enhanced animations
  const getAnimationVariants = () => {
    if (!finalConfig.animation.enabled) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
      };
    }

    const slideMap = {
      'up': { y: 20 },
      'down': { y: -20 },
      'left': { x: 20 },
      'right': { x: -20 }
    };

    const slideOffset = slideMap[finalConfig.animation.slideDirection] || { y: 20 };

    return {
      hidden: {
        opacity: 0,
        scale: finalConfig.animation.bounceEffect ? (isMobile ? 0.95 : 0.8) : 1,
        ...slideOffset
      },
      visible: {
        opacity: 1,
        scale: 1,
        x: 0,
        y: 0,
        transition: {
          duration: finalConfig.animation.duration,
          ease: finalConfig.animation.easing
        }
      },
      exit: {
        opacity: 0,
        scale: finalConfig.animation.bounceEffect ? (isMobile ? 0.95 : 0.8) : 1,
        ...slideOffset,
        transition: {
          duration: finalConfig.animation.duration * 0.7,
          ease: "easeIn"
        }
      }
    };
  };

  const chatVariants = getAnimationVariants();

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0, rotate: -180 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: finalConfig.animation.duration * 1.3,
        ease: finalConfig.animation.easing
      }
    }
  };

  return (
    <div className={`docs-ai-chatbot ${getPositionStyles()}`}>
      {finalConfig.customCSS && <style>{finalConfig.customCSS}</style>}
      
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            ref={chatRef}
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="docs-ai-chat-container"
            style={{
              ...getMobileStyles(),
              borderRadius: isMobile && finalConfig.responsive.mobileFullScreen ? 0 : finalConfig.theme.borderRadius,
              background: `linear-gradient(135deg, ${finalConfig.theme.backgroundColor}, ${finalConfig.theme.surfaceColor || finalConfig.theme.backgroundColor})`,
              boxShadow: `0 25px 60px -12px ${finalConfig.theme.shadowColor}`,
              border: `1px solid ${finalConfig.theme.borderColor}`,
            }}
          >
            {/* Enhanced Header */}
            <div 
              className="docs-ai-header"
              style={{
                borderBottom: `1px solid ${finalConfig.theme.borderColor}`,
              }}
            >
              <div className="docs-ai-header-info">
                <div
                  className="docs-ai-bot-avatar"
                  style={{ 
                    background: finalConfig.avatar?.bot ? `url(${finalConfig.avatar.bot}) center/cover` : 
                      `linear-gradient(135deg, ${finalConfig.theme.primaryColor}30, ${finalConfig.theme.secondaryColor}20)`,
                    border: `1px solid ${finalConfig.theme.primaryColor}50`
                  }}
                >
                  {!finalConfig.avatar?.bot && (
                    <Bot className="docs-ai-icon" style={{ color: finalConfig.theme.primaryColor }} />
                  )}
                </div>
                <div>
                  <h3 className="docs-ai-title" style={{ color: finalConfig.theme.textColor }}>AI Assistant</h3>
                  <div className="docs-ai-status">
                    <div 
                      className="docs-ai-status-dot"
                      style={{ background: finalConfig.theme.primaryColor }}
                    ></div>
                    <p className="docs-ai-subtitle">Online & Ready</p>
                  </div>
                </div>
              </div>
              <div className="docs-ai-header-actions">
                {finalConfig.behavior.enableClearChat && (
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={clearChat}
                    className="docs-ai-action-btn"
                    style={{
                      borderColor: finalConfig.theme.borderColor,
                    }}
                    title={finalConfig.messages.clearChatButton}
                  >
                    <Trash2 className="docs-ai-icon-sm" />
                  </motion.button>
                )}
                {!isMobile && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleChatClose}
                    className="docs-ai-action-btn"
                    style={{
                      borderColor: finalConfig.theme.borderColor,
                    }}
                    title={finalConfig.messages.minimizeButton}
                  >
                    <Minimize2 className="docs-ai-icon-sm" />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleChatClose}
                  className="docs-ai-action-btn"
                  style={{
                    borderColor: finalConfig.theme.borderColor,
                  }}
                  title={finalConfig.messages.closeButton}
                >
                  <X className="docs-ai-icon-sm" />
                </motion.button>
              </div>
            </div>

            {/* Enhanced Messages */}
            <div 
              className="docs-ai-messages" 
              ref={messagesRef}
              style={{
                background: `linear-gradient(180deg, ${finalConfig.theme.backgroundColor}10, ${finalConfig.theme.surfaceColor || finalConfig.theme.backgroundColor}10)`
              }}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: finalConfig.animation.duration,
                    delay: finalConfig.animation.enabled ? Math.min(idx * 0.05, 0.2) : 0 
                  }}
                  className={`docs-ai-message ${msg.role === 'user' ? 'docs-ai-user' : 'docs-ai-assistant'}`}
                >
                  {msg.role === 'assistant' && (
                    <div
                      className="docs-ai-avatar"
                      style={{
                        background: finalConfig.avatar?.bot ? `url(${finalConfig.avatar.bot}) center/cover` : 
                          `linear-gradient(135deg, ${finalConfig.theme.secondaryColor}30, ${finalConfig.theme.primaryColor}20)`,
                        borderColor: `${finalConfig.theme.secondaryColor}50`
                      }}
                    >
                      {!finalConfig.avatar?.bot && (
                        <Bot className="docs-ai-icon-sm" style={{ color: finalConfig.theme.secondaryColor }} />
                      )}
                    </div>
                  )}

                  <div
                    className={`docs-ai-bubble ${msg.role === 'user' ? 'docs-ai-user-bubble' : 'docs-ai-assistant-bubble'}`}
                    style={{
                      background: msg.role === 'user'
                        ? `linear-gradient(135deg, ${finalConfig.theme.primaryColor}, ${finalConfig.theme.gradientEnd || finalConfig.theme.primaryColor})`
                        : `linear-gradient(135deg, ${finalConfig.theme.surfaceColor || finalConfig.theme.backgroundColor}, ${finalConfig.theme.backgroundColor})`,
                      borderColor: msg.role === 'user' ? finalConfig.theme.primaryColor : finalConfig.theme.borderColor,
                      boxShadow: `0 8px 32px ${finalConfig.theme.shadowColor}`,
                      color: finalConfig.theme.textColor,
                    }}
                  >
                    {msg.role === 'assistant' && finalConfig.behavior.enableMarkdown ? (
                      <MarkdownRenderer 
                        content={msg.content} 
                        tableConfig={finalConfig.table} 
                        isStreaming={msg.id === streamingMessageId}
                      />
                    ) : (
                      <div className="docs-ai-message-content">
                        {msg.content}
                      </div>
                    )}

                    {msg.status === 'thinking' && finalConfig.behavior.showTypingIndicator && (
                      <div 
                        className="docs-ai-thinking"
                        style={{
                          background: `${finalConfig.theme.secondaryColor}20`,
                          borderColor: `${finalConfig.theme.secondaryColor}30`
                        }}
                      >
                        <div className="docs-ai-dots">
                          <div 
                            className="docs-ai-dot" 
                            style={{ background: `linear-gradient(135deg, ${finalConfig.theme.secondaryColor}, ${finalConfig.theme.primaryColor})` }}
                          />
                          <div 
                            className="docs-ai-dot" 
                            style={{ background: `linear-gradient(135deg, ${finalConfig.theme.secondaryColor}, ${finalConfig.theme.primaryColor})` }}
                          />
                          <div 
                            className="docs-ai-dot" 
                            style={{ background: `linear-gradient(135deg, ${finalConfig.theme.secondaryColor}, ${finalConfig.theme.primaryColor})` }}
                          />
                        </div>
                        <span 
                          className="docs-ai-thinking-text"
                          style={{ color: finalConfig.theme.secondaryColor }}
                        >
                          AI is thinking...
                        </span>
                      </div>
                    )}

                    {msg.status === 'streaming' && (
                      <span 
                        className="docs-ai-cursor"
                        style={{ 
                          background: `linear-gradient(180deg, ${finalConfig.theme.primaryColor}, ${finalConfig.theme.secondaryColor})`
                        }}
                      />
                    )}

                    {msg.status === 'error' && finalConfig.behavior.enableRetry && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="docs-ai-retry-btn"
                        onClick={() => setMessage(messages[messages.indexOf(msg) - 1]?.content || '')}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)',
                          borderColor: 'rgba(239, 68, 68, 0.4)'
                        }}
                      >
                        <RotateCcw className="docs-ai-icon-sm" />
                        {finalConfig.messages.retryButton}
                      </motion.button>
                    )}

                    {finalConfig.behavior.showTimestamps && (
                      <div className="docs-ai-timestamp">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div
                      className="docs-ai-avatar"
                      style={{
                        background: finalConfig.avatar?.user ? `url(${finalConfig.avatar.user}) center/cover` : 
                          `linear-gradient(135deg, ${finalConfig.theme.primaryColor}30, ${finalConfig.theme.accentColor}20)`,
                        borderColor: `${finalConfig.theme.primaryColor}50`
                      }}
                    >
                      {!finalConfig.avatar?.user && (
                        <User className="docs-ai-icon-sm" style={{ color: finalConfig.theme.primaryColor }} />
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Enhanced Input */}
            <div 
              className="docs-ai-input-container"
              style={{
                borderTop: `1px solid ${finalConfig.theme.borderColor}`,
                background: `linear-gradient(135deg, ${finalConfig.theme.backgroundColor}90, ${finalConfig.theme.surfaceColor || finalConfig.theme.backgroundColor}70)`
              }}
            >
              {!finalConfig.apiEndpoint && (
                <div className="docs-ai-error-banner">
                  `apiEndpoint` is required in config. Please provide your backend proxy endpoint.
                </div>
              )}
              <div className="docs-ai-input-wrapper">
                <div className="docs-ai-input-field">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={finalConfig.messages.placeholder}
                    disabled={isLoading || !finalConfig.apiEndpoint}
                    className="docs-ai-input"
                    style={{
                      borderColor: `${finalConfig.theme.primaryColor}60`,
                      background: `${finalConfig.theme.surfaceColor || finalConfig.theme.backgroundColor}80`,
                      color: finalConfig.theme.textColor,
                      fontSize: finalConfig.accessibility.fontSize === 'large' ? '1rem' : finalConfig.accessibility.fontSize === 'small' ? '0.75rem' : '0.875rem'
                    }}
                  />
                </div>
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: `0 12px 32px ${finalConfig.theme.primaryColor}50` 
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={isLoading || !message.trim() || !finalConfig.apiEndpoint}
                  className="docs-ai-send-btn"
                  style={{
                    background: `linear-gradient(135deg, ${finalConfig.theme.primaryColor}, ${finalConfig.theme.gradientEnd || finalConfig.theme.primaryColor})`,
                    boxShadow: `0 8px 25px ${finalConfig.theme.primaryColor}40`
                  }}
                  title={finalConfig.messages.sendButton}
                >
                  {isLoading ? (
                    <div 
                      className="docs-ai-spinner"
                      style={{
                        borderTopColor: finalConfig.theme.textColor
                      }}
                    />
                  ) : (
                    <Send className="docs-ai-icon-sm" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Floating Button */}
      {!isOpen && (
        <motion.button
          variants={buttonVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ 
            scale: 1.1, 
            boxShadow: `0 25px 50px ${finalConfig.theme.primaryColor}50`,
            rotate: [0, -5, 5, 0]
          }}
          whileTap={{ scale: 0.9 }}
          onClick={handleChatOpen}
          className="docs-ai-fab"
          style={{
            background: `linear-gradient(135deg, ${finalConfig.theme.primaryColor}, ${finalConfig.theme.gradientEnd || finalConfig.theme.primaryColor})`,
            borderRadius: finalConfig.theme.borderRadius,
            boxShadow: `0 15px 40px ${finalConfig.theme.shadowColor}`,
          }}
          title="MyDocsAI Assistant"
        >
          <MessageCircle className="docs-ai-icon" />
          <div 
            className="docs-ai-fab-pulse"
            style={{
              background: `linear-gradient(135deg, ${finalConfig.theme.primaryColor}, ${finalConfig.theme.secondaryColor})`
            }}
          ></div>
        </motion.button>
      )}
    </div>
  );
};

export default DocsAIChatBot;