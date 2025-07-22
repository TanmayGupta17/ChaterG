export default function MessageBubble({ role, content, timestamp }) {
    const isUser = role === 'user';
    const isBot = role === 'assistant' || role === 'bot';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] lg:max-w-[70%] ${isUser
                    ? 'bg-blue-600 text-white rounded-lg rounded-br-sm'
                    : 'bg-gray-200 text-gray-900 rounded-lg rounded-bl-sm'
                } px-4 py-3 shadow-sm`}>
                <div className="whitespace-pre-wrap break-words">
                    {content}
                </div>
                {timestamp && (
                    <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                        {new Date(timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
