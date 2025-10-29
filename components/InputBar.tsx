
import React from 'react';
import { MicIcon, SendIcon } from './icons';

interface InputBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (e: React.FormEvent) => void;
  onMicClick: () => void;
  isListening: boolean;
  disabled: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ value, onChange, onSend, onMicClick, isListening, disabled }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
            <form onSubmit={onSend} className="flex items-center space-x-2 md:space-x-4 bg-gray-100 border border-gray-300 rounded-full p-2 focus-within:ring-2 focus-within:ring-blue-500">
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder={isListening ? "Listening..." : "Type a message..."}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-500 px-4"
                    disabled={disabled || isListening}
                />
                <button
                    type="button"
                    onClick={onMicClick}
                    disabled={disabled}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                        isListening 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'text-blue-700 hover:bg-blue-100'
                    }`}
                    aria-label="Use voice input"
                >
                    <MicIcon className="w-6 h-6" />
                </button>
                <button
                    type="submit"
                    disabled={disabled || !value.trim()}
                    className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200"
                    aria-label="Send message"
                >
                    <SendIcon className="w-6 h-6" />
                </button>
            </form>
      </div>
    </div>
  );
};

export default InputBar;
