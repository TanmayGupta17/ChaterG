import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function ChatWindow({
    messages = [],
    onSend,
    onStop,
    streaming = false,
    selectedChatId
}) {
    const [input, setInput] = useState('');
    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, streaming]);

    useEffect(() => {
        if (inputRef.current && !streaming) {
            inputRef.current.focus();
        }
    }, [selectedChatId, streaming]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !streaming) {
            onSend(input.trim());
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
        if (e.key === 'Escape' && streaming) {
            onStop();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="border-b border-gray-200 p-4 bg-white">
                <h1 className="text-lg font-medium text-gray-900">
                    {selectedChatId ? 'Chat' : 'Select a chat or start a new one'}
                </h1>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {!selectedChatId ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Chat</h3>
                            <p className="text-sm text-gray-500">
                                Start a new conversation or select an existing chat from the sidebar.
                            </p>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">New Chat</h3>
                            <p className="text-sm text-gray-500">
                                Send a message to start the conversation.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <MessageBubble
                                key={message.id || index}
                                role={message.role}
                                content={message.content}
                                timestamp={message.timestamp}
                            />
                        ))}
                        {streaming && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            {selectedChatId && (
                <div className="border-t border-gray-200 p-4 bg-white">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message..."
                                disabled={streaming}
                                rows="1"
                                style={{
                                    minHeight: '48px',
                                    maxHeight: '120px',
                                    overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden'
                                }}
                            />

                            {/* Send button inside input */}
                            <button
                                type="submit"
                                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${input.trim() && !streaming
                                    ? 'text-blue-600 hover:bg-blue-50'
                                    : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                disabled={!input.trim() || streaming}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>

                        {streaming && (
                            <button
                                type="button"
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
                                onClick={onStop}
                            >
                                Stop
                            </button>
                        )}
                    </form>

                    <div className="mt-2 text-xs text-gray-500 text-center">
                        Press Enter to send, Shift+Enter for new line
                        {streaming && ', Esc to stop'}
                    </div>
                </div>
            )}
        </div>
    );
}
