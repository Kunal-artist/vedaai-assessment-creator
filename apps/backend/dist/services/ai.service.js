import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
export const generateQuestionPaper = async (prompt) => {
    const res = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    let text = res.text ?? "";
    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    text = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .trim();
    // Try to extract the first JSON object from the response
    const match = text.match(/\{[\s\S]*\}/);
    if (!match)
        throw new Error("AI response parsing failed – no JSON object found");
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed.sections))
        throw new Error("Invalid AI response – 'sections' array missing");
    return parsed.sections;
};
