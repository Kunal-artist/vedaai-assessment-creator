import { create } from "zustand";
import { Assignment, QuestionTypeConfig } from "../types";

type View = "list" | "create" | "output";

interface FormState {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  sourceText: string;
  instructions: string;
  questionTypes: QuestionTypeConfig[];
}

const defaultForm: FormState = {
  title: "",
  subject: "",
  className: "",
  dueDate: "",
  sourceText: "",
  instructions: "",
  questionTypes: [
    { type: "Multiple Choice Questions", count: 4, marks: 1 },
    { type: "Short Questions", count: 3, marks: 4 },
  ],
};

interface State {
  assignments: Assignment[];
  selectedId?: string;
  view: View;
  form: FormState;

  setView: (v: View) => void;
  setForm: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  resetForm: () => void;
  addQuestionType: () => void;
  updateQuestionType: (
    idx: number,
    key: keyof QuestionTypeConfig,
    value: string | number
  ) => void;
  removeQuestionType: (idx: number) => void;

  setAssignments: (assignments: Assignment[]) => void;
  upsertAssignment: (assignment: Assignment) => void;
  removeAssignment: (id: string) => void;
  setSelected: (id?: string) => void;
}

export const useAssignmentStore = create<State>((set) => ({
  assignments: [],
  selectedId: undefined,
  view: "list",
  form: defaultForm,

  setView: (view) => set({ view }),

  setForm: (k, v) =>
    set((s) => ({ form: { ...s.form, [k]: v } })),

  resetForm: () => set({ form: defaultForm }),

  addQuestionType: () =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: [
          ...s.form.questionTypes,
          { type: "Numerical Problems", count: 2, marks: 5 },
        ],
      },
    })),

  updateQuestionType: (idx, key, value) =>
    set((s) => {
      const copy = [...s.form.questionTypes];
      copy[idx] = { ...copy[idx], [key]: value };
      return { form: { ...s.form, questionTypes: copy } };
    }),

  removeQuestionType: (idx) =>
    set((s) => ({
      form: {
        ...s.form,
        questionTypes: s.form.questionTypes.filter((_, i) => i !== idx),
      },
    })),

  setAssignments: (assignments) => set({ assignments }),

  upsertAssignment: (assignment) =>
    set((s) => ({
      assignments: [
        assignment,
        ...s.assignments.filter((a) => a._id !== assignment._id),
      ],
    })),

  removeAssignment: (id) =>
    set((s) => ({
      assignments: s.assignments.filter((a) => a._id !== id),
    })),

  setSelected: (id) => set({ selectedId: id }),
}));