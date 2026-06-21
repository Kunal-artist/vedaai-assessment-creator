interface QuestionTypeInput {
  type: string;
  count: number;
  marks: number;
}

export const buildPrompt = (data: {
  title: string;
  subject?: string;
  className?: string;
  sourceText?: string;
  dueDate: string;
  instructions?: string;
  questionTypes: QuestionTypeInput[];
  /** True when an image or PDF is attached as an inline part alongside this prompt. */
  hasAttachedFile?: boolean;
}) => `
You are an expert school exam paper creator. Generate a structured question paper as strict JSON.

IMPORTANT: Respond with ONLY valid JSON. No markdown, no explanation, no code fences.

Output format (strictly follow this schema):
{
  "sections": [
    {
      "title": "Section A: Multiple Choice Questions",
      "instruction": "Attempt all questions. Each question carries 1 mark.",
      "questions": [
        {
          "text": "What is the SI unit of electric current?",
          "options": ["Ampere", "Volt", "Ohm", "Watt"],
          "difficulty": "easy",
          "marks": 1,
          "answer": "Ampere"
        }
      ]
    }
  ]
}

Rules:
- difficulty must be one of: "easy", "medium", "hard"
- Group questions by their type into separate sections (Section A, B, C, etc.)
- Each section title should include the question type name
- The instruction should mention marks per question and what to attempt
- If a question is a multiple-choice question (MCQ or Objective), you MUST provide an "options" array with the choices (usually 4 options).
- Do NOT include the "options" array for subjective, short answer, or essay questions.
- You MUST provide a precise, correct "answer" field for every question. 
  - For MCQs, provide the correct option text. 
  - For short answer questions, the answer MUST be detailed and at least 170 - 250 words.
  - For long answer/essay questions, the answer MUST be highly detailed and at least 350 - 400 words.
- Questions must be relevant, clear, and appropriate for school level
- Total questions and marks must exactly match the distribution below

Assignment: ${data.title}
${data.subject ? `Subject: ${data.subject}` : ""}
${data.className ? `Class/Grade: ${data.className}` : ""}
Due date: ${data.dueDate}
Question distribution (type → count × marks each):
${data.questionTypes.map((q) => `  - ${q.type}: ${q.count} questions × ${q.marks} marks each`).join("\n")}
Additional instructions: ${data.instructions ?? "N/A"}
${
  data.hasAttachedFile
    ? "Reference content: An image or PDF document has been attached above. Read its content thoroughly and base all questions on the material in that document."
    : `Reference content / topic: ${data.sourceText ?? "General curriculum – generate appropriate questions based on subject and grade"}`
}

Generate all ${data.questionTypes.reduce((s, q) => s + q.count, 0)} questions now:
`;
