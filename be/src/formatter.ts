import { Part } from "@google/generative-ai";

export function convertMessagesForGemini(messages:Message[]): { role: string; parts: Part[] }[]  {
    const history: { role: string; parts: Part[] }[] = [];
    for (const message of messages) {
        if (message.role === "user") {
            history.push({ role: "user", parts: [{ text: message.content }] });
        } else {
            history.push({ role: "model", parts: [{ text: message.content }] });
        }
    }
    return history;
}

interface Message {
    role: string;
    content: string;
}