export default function TypingIndicator() {
    return (
        <div className="flex justify-start mb-4">
            <div className="bg-gray-200 rounded-lg px-4 py-3 max-w-xs">
                <div className="flex items-center space-x-1">
                    <div className="typing-dot w-2 h-2 bg-gray-500 rounded-full"></div>
                    <div className="typing-dot w-2 h-2 bg-gray-500 rounded-full"></div>
                    <div className="typing-dot w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
