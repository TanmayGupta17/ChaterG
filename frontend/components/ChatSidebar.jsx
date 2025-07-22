import { useState } from 'react';

export default function ChatSidebar({
    chats,
    onSelect,
    onNewChat,
    selectedId,
    className = ""
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const formatChatTitle = (chat) => {
        if (!chat) return "Untitled";
        if (chat.title) return chat.title;
        if (chat.messages && chat.messages.length > 0) {
            return chat.messages[0]?.content?.slice(0, 20) || "Untitled";
        }
        return "Untitled";
    };


    const formatDate = (dateString) => {
        if (!dateString) return "Just now";
        const date = new Date(dateString);
        if (isNaN(date)) return "Just now";

        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString();
    };

    return (
        <aside className={`${isCollapsed ? 'w-16' : 'w-64'
            } bg-gray-50 border-r border-gray-200 h-full flex flex-col transition-all duration-300 ${className}`}>

            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <button
                    className={`${isCollapsed ? 'w-8 h-8 p-0' : 'w-full py-2 px-4'
                        } bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center`}
                    onClick={onNewChat}
                    title="New Chat"
                >
                    {isCollapsed ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Chat
                        </>
                    )}
                </button>

                {/* Collapse toggle */}
                <button
                    className="mt-2 p-1 text-gray-500 hover:text-gray-700 rounded"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? 'Expand' : 'Collapse'}
                >
                    <svg className={`w-4 h-4 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-2">
                {chats.length === 0 ? (
                    <div className={`${isCollapsed ? 'hidden' : 'block'} text-gray-500 text-sm text-center mt-8 px-4`}>
                        No chats yet. Start a new conversation!
                    </div>
                ) : (
                    chats.map((chat, index) => (
                        <div
                            key={chat.id || `chat-${index}`}
                            className={`${selectedId === chat.id
                                ? 'bg-blue-100 border-blue-200 text-blue-900'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                } border rounded-lg cursor-pointer mb-2 transition-all duration-200 shadow-sm hover:shadow ${isCollapsed ? 'p-2' : 'p-3'
                                }`}
                            onClick={() => onSelect(chat.id)}
                            title={isCollapsed ? formatChatTitle(chat) : ''}
                        >
                            {isCollapsed ? (
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                                    {formatChatTitle(chat).charAt(0)}
                                </div>
                            ) : (
                                <>
                                    <div className="font-medium text-sm mb-1 truncate">
                                        {formatChatTitle(chat)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatDate(chat.created_at)}
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}
