require("dotenv").config();
import express from "express";
import { GenerateContentRequest, GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import {basePrompt as nodeBasePrompt} from "./defaults/node";
import {basePrompt as reactBasePrompt} from "./defaults/react";
import { convertMessagesForGemini } from "./formatter";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "default_key");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: getSystemPrompt() });

const app = express();
app.use(express.json())


app.post("/template", async (req, res) => {
    const promt:string = req.body.prompt;

    const request: GenerateContentRequest = {
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
            prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        })
        return;
    }

    if (answer == 'node') {
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [nodeBasePrompt]
        })
        return;
    }

    res.status(403).json({message: "You cant access this"})
    return;

})


async function main() {
  
    const prompt = "Create a simple todo app";
    const result = await model.generateContentStream(prompt);
  
    // console.log(result.response.text());
    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        process.stdout.write(chunkText);
      }
  }
app.post("/chat", async (req, res) => {
    const messages = req.body.messages; //TODO ClientSide: Append the new user message to its local history clientside and Send the entire history (the updated messages array) in the req.body
    try {
        const chat = model.startChat({ // initialize the chat session set context
            history: convertMessagesForGemini(messages), 
            generationConfig: {
                maxOutputTokens: 8000, //TODO tokens limit
            },
        });
        let result = await chat.sendMessageStream(messages[messages.length - 1].content);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                res.write(`data: ${chunkText}\n\n`);
            }
            process.stdout.write(chunkText);
          }

        res.end();
    } catch (error) {
        console.error("Error generating Gemini stream:", error);
        res.status(500).send("Internal server error.");
    }
}
)

  
//  main();

  app.listen(3000);