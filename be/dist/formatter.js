"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMessagesForGemini = convertMessagesForGemini;
function convertMessagesForGemini(messages) {
    const history = [];
    for (const message of messages) {
        if (message.role === "user") {
            history.push({ role: "user", parts: [{ text: message.content }] });
        }
        else {
            history.push({ role: "model", parts: [{ text: message.content }] });
        }
    }
    return history;
}
