import { GoogleGenAI } from "@google/genai";
import { env } from "./src/config/env.js";

const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

async function test() {
  try {
    const res = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "hello",
    });
    console.log("gemini-2.5-flash works!");
  } catch (e: any) {
    console.error("gemini-2.5-flash error:", e.message);
  }
}

test();
