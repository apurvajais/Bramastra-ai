
import React from 'react';
import { Message } from '../types';
import { RobotIcon } from './icons';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white flex-shrink-0">
          <RobotIcon className="w-5 h-5" />
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl shadow ${
          isUser
            ? 'bg-blue-700 text-white rounded-br-none'
            : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
};

export default MessageBubble;
