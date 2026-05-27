export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  text: string;
  options?: string[];
  difficulty: Difficulty;
  marks: number;
}

export interface QuestionSection {
  title: string;
  instruction: string;
  questions: Question[];
}
