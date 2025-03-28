"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const generative_ai_1 = require("@google/generative-ai");
const prompts_1 = require("./prompts");
const node_1 = require("./defaults/node");
const react_1 = require("./defaults/react");
const formatter_1 = require("./formatter");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "default_key");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: (0, prompts_1.getSystemPrompt)() });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post("/template", async (req, res) => {
    const promt = req.body.prompt;
    const request = {
        contents: [
            // {
            //     role: "system",
            //     parts: [{ text: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra" }]
            // },
            {
                role: "user",
                parts: [{ text: `Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra ${promt}` }]
            }
        ]
    };
    const result = await model.generateContent(request);
    const response = await result.response;
    const answer = response.text().trim(); // react or node
    console.log(" react or node :", answer);
    if (answer == 'react') {
        res.json({
            prompts: [prompts_1.BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [react_1.basePrompt]
        });
        return;
    }
    if (answer == 'node') {
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${node_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [node_1.basePrompt]
        });
        return;
    }
    res.status(403).json({ message: "You cant access this" });
    return;
});
async function main() {
    var _a, e_1, _b, _c;
    const prompt = "Create a simple todo app";
    const result = await model.generateContentStream(prompt);
    try {
        // console.log(result.response.text());
        for (var _d = true, _e = __asyncValues(result.stream), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
            _c = _f.value;
            _d = false;
            const chunk = _c;
            const chunkText = chunk.text();
            process.stdout.write(chunkText);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
        }
        finally { if (e_1) throw e_1.error; }
    }
}
app.post("/chat", async (req, res) => {
    var _a, e_2, _b, _c;
    const messages = req.body.messages; //TODO ClientSide: Append the new user message to its local history clientside and Send the entire history (the updated messages array) in the req.body
    try {
        const chat = model.startChat({
            history: (0, formatter_1.convertMessagesForGemini)(messages),
            generationConfig: {
                maxOutputTokens: 8000, //TODO tokens limit
            },
        });
        let result = await chat.sendMessageStream(messages[messages.length - 1].content);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        try {
            for (var _d = true, _e = __asyncValues(result.stream), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
                _c = _f.value;
                _d = false;
                const chunk = _c;
                const chunkText = chunk.text();
                if (chunkText) {
                    res.write(`data: ${chunkText}\n\n`);
                }
                process.stdout.write(chunkText);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
            }
            finally { if (e_2) throw e_2.error; }
        }
        res.end();
    }
    catch (error) {
        console.error("Error generating Gemini stream:", error);
        res.status(500).send("Internal server error.");
    }
});
//  main();
app.listen(3000);
