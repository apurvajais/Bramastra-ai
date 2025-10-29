
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chat } from '@google/genai';
import { Message, Language } from './types';
import { SYSTEM_INSTRUCTIONS } from './constants';
import { createChatSession, sendMessageToAI } from './services/geminiService';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';

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
            const errorMessage: Message = { role: 'model', text: 'Sorry, something went wrong.' };
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

export default App;
