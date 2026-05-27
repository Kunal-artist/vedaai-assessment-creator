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
          "marks": 1
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
- Questions must be relevant, clear, and appropriate for school level
- Total questions and marks must exactly match the distribution below

Assignment: ${data.title}
${data.subject ? `Subject: ${data.subject}` : ""}
${data.className ? `Class/Grade: ${data.className}` : ""}
Due date: ${data.dueDate}
Question distribution (type → count × marks each):
${data.questionTypes.map((q) => `  - ${q.type}: ${q.count} questions × ${q.marks} marks each`).join("\n")}
Additional instructions: ${data.instructions ?? "N/A"}
Reference content / topic: ${data.sourceText ?? "General curriculum – generate appropriate questions based on subject and grade"}

Generate all ${data.questionTypes.reduce((s, q) => s + q.count, 0)} questions now:
`;
