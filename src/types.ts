export type CEFRLevel = "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type SkillType = "Grammar" | "Vocabulary" | "Listening" | "Reading" | "Speaking" | "Writing";

export interface CEFRQuestion {
  cefr_level: CEFRLevel;
  skill_type: SkillType;
  can_do_statement: string;
  context_scenario: string;
  question_text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: "A" | "B" | "C" | "D";
  pedagogical_explanation: string;
}

export interface TestHistoryEntry {
  question: CEFRQuestion;
  userAnswer: "A" | "B" | "C" | "D";
  isCorrect: boolean;
  levelIndexAtTime: number; // 0 to 5 (A1 to C2)
}

export interface AdaptiveTestState {
  currentQuestionNumber: number; // 1 to 20
  currentQuestion: CEFRQuestion | null;
  history: TestHistoryEntry[];
  currentLevelIndex: number; // 0=A1, 1=A2, 2=B1, 3=B2, 4=C1, 5=C2
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface EvaluationResult {
  overall_assigned_level: CEFRLevel;
  criteria_scores: {
    grammatical_accuracy: string;
    lexical_resource: string;
    coherence: string;
    pronunciation: string;
  };
  constructive_feedback: string;
  improved_version: string;
}

export interface EvaluationHistoryEntry {
  id: string;
  date: string;
  type: "writing" | "speaking";
  promptTitle: string;
  result: EvaluationResult;
}

export interface EvaluatorPromptTemplate {
  id: string;
  title: string;
  type: "writing" | "speaking";
  targetLevel: CEFRLevel;
  scenario: string;
  instructions: string;
}
