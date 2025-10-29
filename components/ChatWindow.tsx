import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  const welcomeMessage = "Namaste! Main hoon Bhramastra AI. How can I help you today, dost?";

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
       <div className="max-w-4xl mx-auto">
        {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <h2 className="text-3xl font-bold text-blue-800">Bhramastra AI</h2>
                <p className="mt-2 text-lg">“Smart baat, human touch – Bhramastra AI ke saath!”</p>
                <div className="mt-8">
                     <MessageBubble message={{role: 'model', text: welcomeMessage}} />
                </div>
            </div>
        )}
        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;