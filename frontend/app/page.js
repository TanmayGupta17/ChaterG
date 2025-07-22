"use client";
import { useState, useEffect, useRef } from 'react';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';

function deduplicateText(text) {
  let result = text.replace(/\b(\w+)( \1\b)+/gi, '$1');
  result = result.replace(/\b(\w+?)\1+\b/gi, '$1');

  return result;
}

export default function Home() {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef(null);

  // API Base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

  // Inline API Functions
  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/allchats`);
      if (!res.ok) throw new Error('Failed to fetch chats');
      return await res.json();
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  };

  const fetchChat = async (chatId) => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/${chatId}`);
      if (!res.ok) throw new Error('Failed to fetch chat');
      return await res.json();
    } catch (error) {
      console.error('Error fetching chat:', error);
      return { messages: [] };
    }
  };

  const createChat = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (!res.ok) throw new Error('Failed to create chat');
      return await res.json();
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const sendMessage = async (chatId, message, onToken, signal) => {
    try {
      const response = await fetch(`${API_BASE}/api/chat/${chatId}/message`, {
        method: 'POST',
        body: JSON.stringify({ message }),
        headers: {
          'Content-Type': 'application/json'
        },
        signal: signal
      });

      if (!response.ok) throw new Error('Failed to send message');
      if (!response.body) throw new Error('No response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          onToken(chunk);
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        console.error('Error sending message:', error);
        throw error;
      }
    }
  };

  const stopChat = async (chatId) => {
    try {
      await fetch(`${API_BASE}/api/chat/${chatId}/stop`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error stopping chat:', error);
    }
  };

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChatId) {
      loadChatMessages(selectedChatId);
    } else {
      setMessages([]);
    }
  }, [selectedChatId]);


  const loadChats = async () => {
    try {
      setLoading(true);
      const chatList = await fetchChats();
      setChats(chatList);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChatMessages = async (chatId) => {
    try {
      const chatData = await fetchChat(chatId);
      setMessages(chatData.messages || []);
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      setMessages([]);
    }
  };

  const handleSelectChat = (chatId) => {
    if (chatId !== selectedChatId) {
      setSelectedChatId(chatId);
    }
  };

  // const handleNewChat = async () => {
  //   try {
  //     if (streaming) handleStopGeneration();

  //     const newChat = await createChat();

  //     const safeChat = {
  //       id: newChat.id,
  //       createdAt: newChat.createdAt || new Date().toISOString(),
  //       messages: [],
  //     };

  //     setChats(prev => [safeChat, ...prev]);

  //     // ✅ Preload empty messages so it doesn't feel broken
  //     setTimeout(() => {
  //       setSelectedChatId(safeChat.id);
  //     }, 500);
  //     setMessages([]);
  //   } catch (error) {
  //     console.error('Failed to create new chat:', error);
  //   }
  // };

  const handleNewChat = async () => {
    try {
      if (streaming) handleStopGeneration();
      const newChat = await createChat();
      await loadChats();  // refreshes sidebar
      setSelectedChatId(newChat.id);
      setMessages([]);
    } catch (err) {
      console.error("Error creating new chat:", err);
    }
  };




  const handleSendMessage = async (messageText) => {
    if (!selectedChatId || streaming) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setStreaming(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      await sendMessage(
        selectedChatId,
        messageText,
        (token) => {
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              const updated = lastMessage.content + token;
              lastMessage.content = deduplicateText(updated);
            }
            return newMessages;
          });
        },
        abortControllerRef.current.signal
      );
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to send message:', error);
        // Remove the assistant message on error
        setMessages(prev => prev.slice(0, -1));
        alert('Failed to send message. Please try again.');
      }
    } finally {
      setStreaming(false);
      abortControllerRef.current = null;
      // Refresh chat list to get updated titles
      loadChats();
    }
  };

  const handleStopGeneration = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (selectedChatId) {
      await stopChat(selectedChatId);
    }

    setStreaming(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ChatSidebar
        chats={chats}
        onSelect={handleSelectChat}
        onNewChat={handleNewChat}
        selectedId={selectedChatId}
      />
      <main className="flex-1 flex flex-col">
        <ChatWindow
          messages={messages}
          onSend={handleSendMessage}
          onStop={handleStopGeneration}
          streaming={streaming}
          selectedChatId={selectedChatId}
        />
      </main>
    </div>
  );
}
