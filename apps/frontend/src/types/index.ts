export interface QuestionTypeConfig {
  type: string;
  count: number;
  marks: number;
}

export interface Question {
  text: string;
  options?: string[];
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  answer?: string;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface Assignment {
  _id: string;
  title: string;
  subject?: string;
  className?: string;
  dueDate: string;
  instructions: string;
  sourceText: string;
  questionTypes: QuestionTypeConfig[];
  status: "queued" | "processing" | "done" | "failed";
  result?: { sections: Section[] };
  createdAt: string;
}
