import React from 'react';
import { Language } from '../types';
import { SpeakerOnIcon, SpeakerOffIcon } from './icons';

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

export default Header;