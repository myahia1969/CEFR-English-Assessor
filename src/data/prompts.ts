import { EvaluatorPromptTemplate } from "../types";

export const CURATED_PROMPTS: EvaluatorPromptTemplate[] = [
  {
    id: "a0-speaking-intro",
    title: "Simple Greetings & Name",
    type: "speaking",
    targetLevel: "A0",
    scenario: "You are saying hello and introducing yourself to a new person for the very first time.",
    instructions: "Say 'Hello' or 'Hi', state your first name, and say 'Nice to meet you'."
  },
  {
    id: "a1-speaking-intro",
    title: "Self-Introduction",
    type: "speaking",
    targetLevel: "A1",
    scenario: "You are meeting an English-speaking colleague or classmate for the first time.",
    instructions: "Introduce yourself, state your name, your country of origin, where you live, what you do, and describe two things you like doing in your spare time."
  },
  {
    id: "a2-writing-invitation",
    title: "Weekend Invitation Email",
    type: "writing",
    targetLevel: "A2",
    scenario: "You want to invite a friend to spend the weekend with you in your city.",
    instructions: "Write an informal email (approx. 50-80 words) inviting your friend. Suggest a specific activity to do together, say what time to meet, and explain how they can travel to your home."
  },
  {
    id: "b1-speaking-narrative",
    title: "Memorable Travel Experience",
    type: "speaking",
    targetLevel: "B1",
    scenario: "You are chatting with friends about past holidays and travels.",
    instructions: "Describe a travel experience that you will always remember. Explain where you went, who you were with, what happened, and why it made such a strong impression on you."
  },
  {
    id: "b2-writing-complaint",
    title: "Formal Client Delay Notice",
    type: "writing",
    targetLevel: "B2",
    scenario: "You are a Project Manager and need to notify an important client that their software deliverable is delayed by two weeks due to testing bottlenecks.",
    instructions: "Write a professional email (approx. 120-180 words) apologizing for the delay. Clearly explain the technical testing issues, outline the mitigations you are taking, and propose a revised timeline and a status call."
  },
  {
    id: "c1-writing-argument",
    title: "Academic Argumentative Paragraph",
    type: "writing",
    targetLevel: "C1",
    scenario: "You are contributing to an academic forum on automation and employment.",
    instructions: "Write a sophisticated argumentative response (approx. 150-220 words) analyzing the dual impact of artificial intelligence on high-skilled professional jobs. Use cohesive devices, advanced grammar (e.g. passive reporting, inversions, conditionals), and precise lexical items."
  },
  {
    id: "c2-speaking-speculative",
    title: "Societal Impact of Technological Monopolies",
    type: "speaking",
    targetLevel: "C2",
    scenario: "You are a speaker at an international symposium addressing tech-regulation and free market economics.",
    instructions: "Deliver a short speech (approx. 2 minutes or 200-300 words) discussing whether global technology conglomerates should be regulated under anti-trust laws. Speculate on the democratic, social, and economic implications, using highly sophisticated, idiomatic, and nuanced vocabulary."
  }
];
