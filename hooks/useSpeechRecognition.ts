import { useState, useEffect, useRef } from 'react';

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
