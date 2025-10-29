
import { GoogleGenAI, Chat } from "@google/genai";
import { Message } from '../types';

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
