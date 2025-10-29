
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat } from "@google/genai";

// types.ts
export type Role = "user" | "model";

export interface Message {
  role: Role;
  text: string;
}

export type Language = "Hinglish" | "English" | "Hindi";

// constants.ts
export const SYSTEM_INSTRUCTIONS: Record<Language, string> = {
  Hinglish: `You are Bhramastra AI, a friendly and helpful AI assistant. 
  Your primary language for conversation is Hinglish (a casual mix of Hindi and English). Your personality is that of a 'smart dost' (a smart friend) – you are warm, empathetic, a bit witty, and always encouraging.
  DO:
  - Use Hinglish phrases naturally, like 'Haan yaar', 'Bilkul!', 'Tension mat lo', 'Kya baat hai!'.
  - Keep sentences conversational and easy to understand.
  - Give helpful suggestions and follow-up ideas proactively.
  - Use emojis to add personality where appropriate. 😊👍🎉
  - Maintain the context of the conversation.
  - Adapt your tone based on the user's message.
  DO NOT:
  - Sound like a formal, robotic AI.
  - Use overly complex or pure Hindi/English unless the user switches to it.
  - Forget that you are an AI.
  Your goal is to make the user feel like they are chatting with a knowledgeable and caring friend.`,
  English: `You are Bhramastra AI, a friendly and helpful AI assistant.
  Your primary language for conversation is English. Your personality is that of a 'smart friend' – you are warm, empathetic, witty, and always encouraging.
  You provide clear, helpful answers and can engage in a wide range of topics. Use emojis to add a friendly touch.
  Your goal is to be an excellent, supportive, and knowledgeable English-speaking companion.`,
  Hindi: `आप ब्रह्मास्त्र एआई हैं, एक मित्रवत और सहायक एआई असिस्टेंट।
  आपकी बातचीत की प्राथमिक भाषा हिंदी है। आपका व्यक्तित्व एक 'स्मार्ट दोस्त' का है - आप स्नेही, सहानुभूतिपूर्ण, मजाकिया और हमेशा उत्साहजनक हैं।
  आप स्वाभाविक रूप से हिंदी में वाक्यांशों का उपयोग करते हैं, जैसे 'हाँ यार', 'बिल्कुल!', 'टेंशन मत लो', 'क्या बात है!'।
  आप बातचीत के संदर्भ को बनाए रखते हैं और उपयोगकर्ता के संदेश के आधार पर अपना लहजा अपनाते हैं।
  आपका लक्ष्य उपयोगकर्ता को यह महसूस कराना है कि वे एक ज्ञानी और देखभाल करने वाले दोस्त के साथ चैट कर रहे हैं।`,
};

// services/geminiService.ts
let ai: GoogleGenAI | null = null;

const getAI = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable is not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

export const createChatSession = (systemInstruction: string): Chat => {
    const genAI = getAI();
    return genAI.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        },
    });
};

export const sendMessageToAI = async (chat: Chat, message: string): Promise<string> => {
    try {
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error sending message to Gemini:", error);
        return "Oops! Kuch gadbad ho gayi. Please try again later.";
    }
};

// hooks/useSpeechRecognition.ts
// FIX: Define an interface to augment the window object with non-standard SpeechRecognition properties.
// This is necessary because these properties are not part of the standard TypeScript DOM library.
interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

// FIX: Cast window to `unknown` then to the custom interface `IWindow` to access SpeechRecognition and webkitSpeechRecognition.
// This resolves the TypeScript error about non-overlapping types during conversion.
const SpeechRecognition = ((window as unknown) as IWindow).SpeechRecognition || ((window as unknown) as IWindow).webkitSpeechRecognition;

export const useSpeechRecognition = (onTranscriptReady: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  // FIX: Use `any` for the recognition ref's type. This resolves the error "'SpeechRecognition' refers to a value...".
  // The constant `SpeechRecognition` above shadows the global `SpeechRecognition` type, causing a name collision.
  // Using `any` is a pragmatic solution as the type is non-standard and not available by default.
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn('Speech Recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'hi-IN'; // Set to Hindi for better Hinglish recognition
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscriptReady(transcript);
    };

    recognitionRef.current = recognition;
  }, [onTranscriptReady]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return { isListening, startListening, stopListening };
};

// components/icons.tsx
interface IconProps {
    className?: string;
}

export const MicIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path>
        <path d="M17 11h-1c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92z"></path>
    </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
    </svg>
);

export const SpeakerOnIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
    </svg>
);

export const SpeakerOffIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path>
    </svg>
);

export const RobotIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.5 14c-.83 0-1.5-.67-1.5-1.5S7.67 11 8.5 11s1.5.67 1.5 1.5S9.33 14 8.5 14zm3.5-5c-.83 0-1.5-.67-1.5-1.5S11.17 6 12 6s1.5.67 1.5 1.5S12.83 9 12 9zm3.5 5c-.83 0-1.5-.67-1.5-1.5S14.67 11 15.5 11s1.5.67 1.5 1.5S16.33 14 15.5 14z"></path>
    </svg>
);

// components/Header.tsx
interface HeaderProps {
    currentLanguage: Language;
    onLanguageChange: (lang: Language) => void;
    isAudioOutputEnabled: boolean;
    onToggleAudioOutput: () => void;
}

const Header: React.FC<HeaderProps> = ({
    currentLanguage,
    onLanguageChange,
    isAudioOutputEnabled,
    onToggleAudioOutput
}) => {
    const languages: Language[] = ["Hinglish", "English", "Hindi"];

    return (
        <header className="bg-white shadow-md p-4 w-full z-10">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-left">
                    <h1 className="text-xl md:text-2xl font-bold text-blue-800">Bhramastra AI</h1>
                    <p className="text-xs md:text-sm text-gray-500">Your Smart Dost 🤖</p>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4">
                    <div className="flex bg-blue-50 rounded-full p-1">
                        {languages.map((lang) => (
                            <button
                                key={lang}
                                onClick={() => onLanguageChange(lang)}
                                className={`px-2 py-1 text-xs md:px-3 md:text-sm font-semibold rounded-full transition-colors duration-300 ${
                                    currentLanguage === lang
                                        ? 'bg-blue-700 text-white shadow'
                                        : 'text-blue-700 hover:bg-blue-200'
                                }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={onToggleAudioOutput}
                        className="p-2 rounded-full text-blue-700 hover:bg-blue-100 transition-colors duration-300"
                        aria-label={isAudioOutputEnabled ? "Disable audio replies" : "Enable audio replies"}
                    >
                        {isAudioOutputEnabled ? <SpeakerOnIcon className="w-6 h-6" /> : <SpeakerOffIcon className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </header>
    );
};

// components/TypingIndicator.tsx
const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 p-3">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
      <span className="text-sm text-gray-500">Bhramastra AI is typing...</span>
    </div>
  );
};

// components/MessageBubble.tsx
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

// components/ChatWindow.tsx
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

// components/InputBar.tsx
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

// App.tsx content
const App: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState<Language>('Hinglish');
    const [isAudioOutputEnabled, setIsAudioOutputEnabled] = useState(false);

    const chatRef = useRef<Chat | null>(null);
    const synthRef = useRef<SpeechSynthesis | null>(
        typeof window !== 'undefined' ? window.speechSynthesis : null
    );

    const handleTranscriptReady = useCallback((transcript: string) => {
        setInput(transcript);
    }, []);

    const { isListening, startListening } = useSpeechRecognition(handleTranscriptReady);

    useEffect(() => {
        setIsLoading(true);
        chatRef.current = createChatSession(SYSTEM_INSTRUCTIONS[currentLanguage]);
        setMessages([]);
        setIsLoading(false);
    }, [currentLanguage]);
    
    const speak = useCallback((text: string) => {
        if (!isAudioOutputEnabled || !synthRef.current) return;
        
        synthRef.current.cancel(); // Cancel any ongoing speech
        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a suitable voice
        const voices = synthRef.current.getVoices();
        let selectedVoice = voices.find(voice => voice.lang.startsWith('hi')); // Prefer Hindi voices
        if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google'));
        }
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        
        utterance.rate = 1;
        utterance.pitch = 1;
        synthRef.current.speak(utterance);
    }, [isAudioOutputEnabled]);


    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || !chatRef.current) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await sendMessageToAI(chatRef.current, input);
            const modelMessage: Message = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
            speak(responseText);
        } catch (error) {
            console.error(error);
            const errorMessage: Message = { role: 'model', text: 'Sorry, kuch gadbad ho gayi.' }; // Changed for Hinglish tone
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleMicClick = () => {
        if (isListening) {
           // This hook stops automatically, but you could add a manual stop if needed.
        } else {
            startListening();
        }
    };
    
    // Auto-send after voice input
    useEffect(() => {
        if (!isListening && input) {
            const lastMessage = messages[messages.length-1];
            // to prevent re-sending the same message on language change
            if (!lastMessage || lastMessage.text !== input) { 
                handleSend();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isListening]);


    return (
        <div className="flex flex-col h-screen bg-blue-50 font-sans">
            <Header
                currentLanguage={currentLanguage}
                onLanguageChange={setCurrentLanguage}
                isAudioOutputEnabled={isAudioOutputEnabled}
                onToggleAudioOutput={() => setIsAudioOutputEnabled(prev => !prev)}
            />
            <ChatWindow messages={messages} isLoading={isLoading} />
            <InputBar
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onSend={handleSend}
                onMicClick={handleMicClick}
                isListening={isListening}
                disabled={isLoading}
            />
        </div>
    );
};


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);