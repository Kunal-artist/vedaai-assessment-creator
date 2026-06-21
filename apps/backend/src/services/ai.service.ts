import { GoogleGenAI, Part } from "@google/genai";
import { env } from "../config/env.js";
import { QuestionSection } from "../types.js";

const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

interface GenerateOptions {
  prompt: string;
  /** Base64-encoded image or PDF data (optional). */
  sourceBase64?: string;
  /** MIME type of the uploaded file, e.g. "image/png" or "application/pdf". */
  sourceMimeType?: string;
}

export const generateQuestionPaper = async (
  options: GenerateOptions | string
): Promise<QuestionSection[]> => {
  // Support legacy string-only callers
  const { prompt, sourceBase64, sourceMimeType } =
    typeof options === "string"
      ? { prompt: options, sourceBase64: undefined, sourceMimeType: undefined }
      : options;

  // Build the parts array for the Gemini request
  const parts: Part[] = [];

  // If a file (image or PDF) was uploaded, prepend it as an inline data part
  if (sourceBase64 && sourceMimeType) {
    parts.push({
      inlineData: {
        data: sourceBase64,
        mimeType: sourceMimeType as any,
      },
    });
  }

  // Always add the text prompt as the last part
  parts.push({ text: prompt });

  const res = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts }],
  });

  let text = res.text ?? "";

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  text = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  // Try to extract the first JSON object from the response
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI response parsing failed – no JSON object found");

  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed.sections))
    throw new Error("Invalid AI response – 'sections' array missing");

  return parsed.sections;
};
