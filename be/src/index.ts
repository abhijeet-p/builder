require("dotenv").config();
import express from "express";
import { GenerateContentRequest, GoogleGenerativeAI } from "@google/generative-ai";
import { getSystemPrompt } from "./prompts";
import { strict } from "assert";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "default_key");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash",systemInstruction: getSystemPrompt() });

const app = express();
app.use(express.json())


app.post("/template", async (req, res) => {
    const promt:string = req.body.prompt;

    const request: GenerateContentRequest = {
        contents: [
            {
                role: "system",
                parts: [{ text: "You are a helpful and concise programming assistant." }]
            },
            {
                role: "user",
                parts: [{ text: promt }]
            }
        ]
    };

    const response = await model.generateContent(request);
    const answer = response; // react or node

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
  
  main();