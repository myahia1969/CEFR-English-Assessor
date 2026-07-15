import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Check, 
  HelpCircle, 
  ChevronRight, 
  TrendingUp, 
  Sparkles, 
  Zap, 
  RefreshCw, 
  Award, 
  AlertCircle,
  GraduationCap,
  BookOpen,
  Volume2,
  Bookmark,
  Languages
} from "lucide-react";
import { CEFRLevel, CEFRQuestion, SkillType } from "../types";

// Standard fallback questions mapped by CEFR Levels for offline capability and error resiliency
const FALLBACK_QUESTIONS: Record<CEFRLevel, CEFRQuestion[]> = {
  A0: [
    {
      cefr_level: "A0",
      skill_type: "Vocabulary",
      can_do_statement: "Can identify basic colors and greetings.",
      context_scenario: "Greeting a colleague in the morning.",
      question_text: "Which of the following is a morning greeting?",
      options: {
        A: "Good night",
        B: "Good morning",
        C: "Good afternoon",
        D: "Goodbye"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct because 'Good morning' is used to greet someone from sunrise until noon. 'Good night' is a farewell said in the evening."
    },
    {
      cefr_level: "A0",
      skill_type: "Grammar",
      can_do_statement: "Can use basic personal pronouns with the verb 'to be'.",
      context_scenario: "Introducing oneself.",
      question_text: "I ________ a student.",
      options: {
        A: "is",
        B: "are",
        C: "am",
        D: "be"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct because the first-person singular pronoun 'I' is paired with 'am' in the present tense of 'to be'."
    },
    {
      cefr_level: "A0",
      skill_type: "Reading",
      can_do_statement: "Can understand simple everyday signs.",
      context_scenario: "Looking at a sign at an office door.",
      question_text: "A sign on a door says 'PULL'. What should you do?",
      options: {
        A: "Push the door away from you.",
        B: "Pull the door toward you.",
        C: "Do not enter.",
        D: "Walk around the door."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct. 'PULL' means to exert force toward yourself to open the door."
    },
    {
      cefr_level: "A0",
      skill_type: "Listening",
      can_do_statement: "Can understand simple spelling and numbers.",
      context_scenario: "A front desk clerk confirms the room number.",
      question_text: "The clerk says: 'Your room is four-two-five.' What is the room number?",
      options: {
        A: "452",
        B: "245",
        C: "425",
        D: "524"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct because 'four' (4), 'two' (2), and 'five' (5) spells out 425."
    },
    {
      cefr_level: "A0",
      skill_type: "Grammar",
      can_do_statement: "Can use basic singular plural nouns.",
      context_scenario: "Counting objects on a desk.",
      question_text: "There are two ________ on my desk.",
      options: {
        A: "pen",
        B: "pens",
        C: "penes",
        D: "penned"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct because plural nouns in English typically take an '-s' suffix (pens)."
    }
  ],
  A1: [
    {
      cefr_level: "A1",
      skill_type: "Vocabulary",
      can_do_statement: "Can use simple vocab for everyday items.",
      context_scenario: "Having lunch at a simple restaurant.",
      question_text: "Can I have a ________ of water, please?",
      options: {
        A: "plate",
        B: "glass",
        C: "fork",
        D: "spoon"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct. Liquids such as water are typically served in a 'glass' or bottle."
    },
    {
      cefr_level: "A1",
      skill_type: "Grammar",
      can_do_statement: "Can ask basic present simple questions.",
      context_scenario: "Asking about a friend's residence.",
      question_text: "Where ________ your sister live?",
      options: {
        A: "do",
        B: "is",
        C: "does",
        D: "are"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct. 'Sister' is third-person singular (she), which requires the auxiliary 'does' in present simple questions."
    },
    {
      cefr_level: "A1",
      skill_type: "Reading",
      can_do_statement: "Can identify simple directions.",
      context_scenario: "Reading an email from a friend: 'Walk past the supermarket, turn left, and my flat is on the right.'",
      question_text: "Where is the flat located?",
      options: {
        A: "On the right side, after turning left.",
        B: "On the left side, before the supermarket.",
        C: "Opposite the supermarket.",
        D: "On the right side of the supermarket."
      },
      correct_option: "A",
      pedagogical_explanation: "Option A is correct because the text indicates you should walk past the supermarket, turn left, and find the flat on the right."
    },
    {
      cefr_level: "A1",
      skill_type: "Listening",
      can_do_statement: "Can extract primary times from conversation.",
      context_scenario: "A friend says: 'Our train is at quarter to eight, so let's meet at seven-thirty.'",
      question_text: "What time does the train leave?",
      options: {
        A: "7:30",
        B: "8:15",
        C: "7:45",
        D: "8:45"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct. 'Quarter to eight' means 15 minutes before 8:00, which is 7:45. 7:30 is when they meet."
    },
    {
      cefr_level: "A1",
      skill_type: "Grammar",
      can_do_statement: "Can utilize basic negative contractions.",
      context_scenario: "Describing food preferences.",
      question_text: "I like coffee, but I ________ like tea.",
      options: {
        A: "doesn't",
        B: "don't",
        C: "not",
        D: "am not"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct. The first-person pronoun 'I' uses the negative auxiliary 'don't' (do not) in present simple."
    }
  ],
  A2: [
    {
      cefr_level: "A2",
      skill_type: "Grammar",
      can_do_statement: "Can describe past events using regular and irregular verbs.",
      context_scenario: "Discussing weekend activities.",
      question_text: "Last Saturday, we ________ to the museum and saw a fascinating exhibition.",
      options: {
        A: "went",
        B: "go",
        C: "have gone",
        D: "was going"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A is correct. 'Last Saturday' specifies a completed past action, requiring the Past Simple irregular verb 'went'."
    },
    {
      cefr_level: "A2",
      skill_type: "Vocabulary",
      can_do_statement: "Can understand terms related to transport.",
      context_scenario: "Navigating an airport.",
      question_text: "Please make sure you have your boarding ________ before walking to the departure gate.",
      options: {
        A: "ticket",
        B: "pass",
        C: "card",
        D: "paper"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct. In aviation, the document allowing you on the plane is standardly termed a 'boarding pass'."
    },
    {
      cefr_level: "A2",
      skill_type: "Reading",
      can_do_statement: "Can extract information from public notices.",
      context_scenario: "Reading a library notice: 'Quiet study area. No phone calls allowed. Laptops permitted with headphones only.'",
      question_text: "Which of the following is true?",
      options: {
        A: "You can talk on your phone if you speak quietly.",
        B: "You cannot use laptops in this study area.",
        C: "You must use headphones with your laptop.",
        D: "You must check in your phone at the entrance."
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct because the sign specifically permits laptops with 'headphones only', meaning no audio can be played out loud."
    },
    {
      cefr_level: "A2",
      skill_type: "Listening",
      can_do_statement: "Can understand essential directions.",
      context_scenario: "An office announcement says: 'The lift is out of order. Please use the stairs near the emergency exit on the second floor.'",
      question_text: "What is the problem?",
      options: {
        A: "The stairs are closed.",
        B: "The elevator does not work.",
        C: "The emergency exit is locked.",
        D: "The second floor is off-limits."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct. 'Lift' is standard British/international English for elevator, and 'out of order' means it is not working."
    },
    {
      cefr_level: "A2",
      skill_type: "Grammar",
      can_do_statement: "Can express future arrangements using present continuous.",
      context_scenario: "Discussing evening schedules.",
      question_text: "I can't meet you tonight because I ________ dinner with my grandparents.",
      options: {
        A: "have",
        B: "having",
        C: "am having",
        D: "will had"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct. The Present Continuous ('am having') is standardly used to express pre-arranged personal plans in the near future."
    }
  ],
  B1: [
    {
      cefr_level: "B1",
      skill_type: "Grammar",
      can_do_statement: "Can connect clauses using appropriate relative pronouns.",
      context_scenario: "Talking about an influential teacher.",
      question_text: "This is the teacher ________ helped me prepare for my academic language exams.",
      options: {
        A: "which",
        B: "whose",
        C: "who",
        D: "whom"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct. 'Who' is the subject relative pronoun used to refer to people. 'Which' refers to things, and 'whose' shows possession."
    },
    {
      cefr_level: "B1",
      skill_type: "Vocabulary",
      can_do_statement: "Can use phrasal verbs in work and school contexts.",
      context_scenario: "Talking about team deadlines.",
      question_text: "We had to ________ the meeting until next Tuesday because our project manager was unwell.",
      options: {
        A: "put off",
        B: "call on",
        C: "look up",
        D: "take after"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A is correct. The phrasal verb 'put off' means to postpone, which fits the context of rescheduling a meeting."
    },
    {
      cefr_level: "B1",
      skill_type: "Reading",
      can_do_statement: "Can identify main arguments in a news editorial.",
      context_scenario: "Reading a blog post on eco-travel: 'While eco-resorts claim to protect ecosystems, local carbon emissions from flights outweigh the local recycling initiatives of these hotels.'",
      question_text: "What is the author's primary perspective?",
      options: {
        A: "Eco-hotels do not actually recycle their garbage.",
        B: "Flights neutralize the localized ecological benefits of green hotels.",
        C: "Air travel is cheaper than eco-tourism resorts.",
        D: "Eco-resorts should ban international travelers."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct. The author argues that the heavy emissions from flights 'outweigh' the local positive recycling efforts of green hotels."
    },
    {
      cefr_level: "B1",
      skill_type: "Listening",
      can_do_statement: "Can comprehend main ideas in announcements.",
      context_scenario: "Radio report: 'Due to severe weather warnings on the coast, commuter trains will face delay caps, but metro lines remain operational with extra carriages.'",
      question_text: "What should passengers expect?",
      options: {
        A: "Total closure of the municipal metro network.",
        B: "Delayed journeys on the coastal commuter trains.",
        C: "Higher ticket prices for the coastal journeys.",
        D: "No commuter services in the entire region."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct. The announcement highlights 'commuter trains will face delay caps' due to severe weather warnings."
    },
    {
      cefr_level: "B1",
      skill_type: "Grammar",
      can_do_statement: "Can use first conditional to express probability.",
      context_scenario: "A tutor talks to a student about exam prep.",
      question_text: "If you prepare for an hour every morning, you ________ major gains in your score.",
      options: {
        A: "see",
        B: "would see",
        C: "will see",
        D: "saw"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct. First Conditional structures ('If + Present Simple, Will + Verb') describe highly probable future outcomes of a present state."
    }
  ],
  B2: [
    {
      cefr_level: "B2",
      skill_type: "Grammar",
      can_do_statement: "Can use passive voice to focus on processes.",
      context_scenario: "A business presentation on software architecture.",
      question_text: "The new encryption algorithm ________ by our security engineers before the public launch next month.",
      options: {
        A: "will have implemented",
        B: "is going to be implemented",
        C: "will be implemented",
        D: "implements"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct because the statement requires a future passive construction ('will be' + past participle) to emphasize the software algorithm being acted upon."
    },
    {
      cefr_level: "B2",
      skill_type: "Vocabulary",
      can_do_statement: "Can utilize precise idiomatic expressions.",
      context_scenario: "Exhorting team members during a project crunch.",
      question_text: "Let's not lose sight of our core objective. We need to stay focused and not get ________ by minor details.",
      options: {
        A: "sidetracked",
        B: "overruled",
        C: "postponed",
        D: "displaced"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A is correct. To get 'sidetracked' is an idiomatic term meaning to be diverted from the main issue or path by minor distractions."
    },
    {
      cefr_level: "B2",
      skill_type: "Reading",
      can_do_statement: "Can synthesize complex arguments from professional articles.",
      context_scenario: "Reading a paper: 'Though digital currencies aim to democratize access, their high volatility renders them speculative mechanisms rather than viable everyday stores of transactional value.'",
      question_text: "According to the passage, what is the primary hurdle for digital currency adoption?",
      options: {
        A: "Lack of infrastructure in developing markets.",
        B: "High fees charged by regulatory agencies.",
        C: "Price volatility that undermines transactional stability.",
        D: "General public resistance to software wallets."
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct. The text explicitly asserts that 'high volatility renders them speculative mechanisms rather than viable everyday stores of transactional value.'"
    },
    {
      cefr_level: "B2",
      skill_type: "Listening",
      can_do_statement: "Can follow extended debate on common topics.",
      context_scenario: "A tech podcast host argues: 'We cannot simply blame algorithms for polarization; they merely mirror and accelerate latent cognitive biases already present within humanity.'",
      question_text: "What is the speaker's main thesis?",
      options: {
        A: "Algorithms should be redesigned immediately.",
        B: "Polarization is primarily caused by internet speed.",
        C: "Software amplification acts on pre-existing human tendencies.",
        D: "Linguistic cognitive biases are easy to correct."
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct. The host argues algorithms 'merely mirror and accelerate latent cognitive biases already present within humanity' (pre-existing human tendencies)."
    },
    {
      cefr_level: "B2",
      skill_type: "Grammar",
      can_do_statement: "Can formulate unreal past situations using the third conditional.",
      context_scenario: "Reflecting on previous academic studies.",
      question_text: "If I ________ that the university lecture was recorded, I wouldn't have woken up so early.",
      options: {
        A: "knew",
        B: "would know",
        C: "had known",
        D: "have known"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct. Third Conditional sentences use 'If + Past Perfect' ('had known') to describe hypothetical situations in the past that did not occur."
    }
  ],
  C1: [
    {
      cefr_level: "C1",
      skill_type: "Grammar",
      can_do_statement: "Can utilize inverted structures for dramatic emphasis.",
      context_scenario: "Writing an academic synthesis paper.",
      question_text: "Seldom ________ such a groundbreaking discovery in the field of acoustic physics.",
      options: {
        A: "researchers have made",
        B: "have researchers made",
        C: "did researchers made",
        D: "researchers made"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct. Negative adverbs like 'Seldom' placed at the beginning of a clause trigger subject-auxiliary inversion ('have researchers made')."
    },
    {
      cefr_level: "C1",
      skill_type: "Vocabulary",
      can_do_statement: "Can use precise scholarly synonyms.",
      context_scenario: "Critiquing an opposing academic claim.",
      question_text: "The critic's argument is fundamentally flawed because it is based on a ________ premise that ignores major variables.",
      options: {
        A: "tenuous",
        B: "lucid",
        C: "pivotal",
        D: "vibrant"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A is correct. 'Tenuous' means weak, slight, or fragile, indicating the premise is unsubstantiated. 'Lucid' means clear, 'pivotal' means crucial."
    },
    {
      cefr_level: "C1",
      skill_type: "Reading",
      can_do_statement: "Can recognize implicit meaning in academic texts.",
      context_scenario: "Reading an essay: 'Modernist literature does not simply abandon classical forms; rather, it superimposes them upon disjointed urban canvases to mock the nostalgia for cohesive historic narratives.'",
      question_text: "What does the author imply about Modernist literature?",
      options: {
        A: "It lacks a structured understanding of classical prose forms.",
        B: "It is written primarily for residents of large urban centers.",
        C: "It utilizes classical frameworks ironically to challenge old assumptions.",
        D: "It seeks to revive classical structural cohesion in poetry."
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct. The author implies Modernist works use classical structures on 'disjointed urban canvases' to 'mock the nostalgia' for cohesion, showing ironical subversion."
    },
    {
      cefr_level: "C1",
      skill_type: "Listening",
      can_do_statement: "Can comprehend highly abstract or idiomatic lectures.",
      context_scenario: "Professor discussing urban development: 'The municipal board's decision to green-light the high-rise was a classic case of putting the cart before the horse, as transport grids were already saturated.'",
      question_text: "What does the professor imply about the municipal decision?",
      options: {
        A: "The high-rise design was structurally unsafe.",
        B: "They prioritized residential density over the logical sequence of transport planning.",
        C: "They spent too much budget purchasing horses and transport assets.",
        D: "They delayed the high-rise project unnecessarily."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct. The idiom 'putting the cart before the horse' means doing things in the wrong chronological order. They built before planning transportation."
    },
    {
      cefr_level: "C1",
      skill_type: "Grammar",
      can_do_statement: "Can utilize mixed past/present conditional structures.",
      context_scenario: "Debating historical business decisions.",
      question_text: "If we had acquired the patent last year, our firm ________ the market leader today.",
      options: {
        A: "will be",
        B: "would have been",
        C: "would be",
        D: "is"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct. This is a Mixed Conditional (Past condition + Present result). 'If + Past Perfect' is coupled with 'would + bare infinitive' ('would be') to reflect a current counterfactual state."
    }
  ],
  C2: [
    {
      cefr_level: "C2",
      skill_type: "Grammar",
      can_do_statement: "Can employ complex subjunctive structures with ease.",
      context_scenario: "Drafting a highly formal bilateral agreement.",
      question_text: "It is of paramount importance that the prospective contractor ________ strictly to the confidentiality protocols.",
      options: {
        A: "adheres",
        B: "adhere",
        C: "adhered",
        D: "should be adhered"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct. Phrases of extreme importance (e.g., 'It is of paramount importance that...') trigger the Mandative Subjunctive in formal English, which uses the base form of the verb ('adhere') regardless of subject."
    },
    {
      cefr_level: "C2",
      skill_type: "Vocabulary",
      can_do_statement: "Can utilize highly literary/advanced English register.",
      context_scenario: "Describing a speaker's powerful eloquence.",
      question_text: "Her speech was so ________ that she managed to sway the entire hostile assembly within minutes.",
      options: {
        A: "cogent",
        B: "obtuse",
        C: "dormant",
        D: "prolix"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A is correct. 'Cogent' means clear, logical, and highly convincing, making it perfect for swaying an assembly. 'Obtuse' is dense/dull, 'prolix' is tediously wordy."
    },
    {
      cefr_level: "C2",
      skill_type: "Reading",
      can_do_statement: "Can digest highly complex, dense philosophical arguments.",
      context_scenario: "Reading epistemology: 'The pretense of unmediated empirical observation is a persistent epistemological mirage; our conceptual lenses inevitably shape, rather than merely register, sensory input.'",
      question_text: "Which statement best captures the author's primary philosophical stance?",
      options: {
        A: "Pure observation is the only path to objective reality.",
        B: "Sensory data is entirely fabricated and holds zero empirical value.",
        C: "Human cognitive structures actively filter and interpret observed reality.",
        D: "Empirical observation can only occur through scientific microscopes."
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct because the author argues our 'conceptual lenses shape, rather than merely register, sensory input', meaning observation is filtered by mental frameworks."
    },
    {
      cefr_level: "C2",
      skill_type: "Listening",
      can_do_statement: "Can capture subtle emotional register and double meanings.",
      context_scenario: "A politician remarks dryly: 'The minister's sudden conversion to environmentalism is as touching as it is politically expedient.'",
      question_text: "What is the speaker's tone regarding the minister's conversion?",
      options: {
        A: "Genuine emotional warmth and support.",
        B: "Sarcastic skepticism regarding his underlying motives.",
        C: "Frustrated anger about the speed of policy changes.",
        D: "Total apathy and disinterest."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct. Pairing 'touching' with 'politically expedient' in a dry remark is a highly sophisticated, sarcastic way to imply the conversion is self-serving."
    },
    {
      cefr_level: "C2",
      skill_type: "Grammar",
      can_do_statement: "Can utilize double relative structures.",
      context_scenario: "Analyzing complex scientific causality.",
      question_text: "The phenomenon is characterized by a feedback loop, the precise mechanics ________ remain largely shrouded in mystery.",
      options: {
        A: "for which",
        B: "of which",
        C: "by which",
        D: "to whom"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct. 'The precise mechanics of which' indicates possession/relation to the feedback loop in formal scholarly syntax."
    }
  ]
};

interface QuickCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel: CEFRLevel | null;
  stats: {
    testsTaken: number;
    practiceQuestions: number;
    evaluations: number;
    accuracy: number;
  };
  onUpdateStats: (newStats: Partial<{
    testsTaken: number;
    practiceQuestions: number;
    evaluations: number;
    accuracy: number;
  }>) => void;
}

const SKILL_ROTATION: SkillType[] = ["Vocabulary", "Grammar", "Reading", "Listening", "Vocabulary"];

export default function QuickCheckModal({
  isOpen,
  onClose,
  userLevel,
  stats,
  onUpdateStats
}: QuickCheckModalProps) {
  
  const currentCEFR = userLevel || "B1";
  
  // Local state for the assessment loop
  const [step, setStep] = useState<"intro" | "quiz" | "summary">("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<CEFRQuestion[]>([]);
  const [answers, setAnswers] = useState<Array<{
    question: CEFRQuestion;
    userAnswer: "A" | "B" | "C" | "D";
    isCorrect: boolean;
  }>>([]);
  
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [apiFailed, setApiFailed] = useState(false);

  // Reset states when modal is toggled
  useEffect(() => {
    if (isOpen) {
      setStep("intro");
      setCurrentQuestionIndex(0);
      setQuestions([]);
      setAnswers([]);
      setSelectedOption(null);
      setIsAnswered(false);
      setApiFailed(false);
    }
  }, [isOpen]);

  // Fetch or generate the 5 questions
  const startQuickCheck = async () => {
    setStep("quiz");
    setIsLoading(true);
    setLoadingText("Formulating diagnostic parameters...");
    
    const loadedQuestions: CEFRQuestion[] = [];
    let failedToCallApi = false;

    // We generate 5 questions based on user estimated CEFR level
    for (let i = 0; i < 5; i++) {
      const skill = SKILL_ROTATION[i];
      setLoadingText(`Synthesizing ${skill} scenario mapped to ${currentCEFR}...`);
      
      try {
        const response = await fetch("/api/generate-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cefrLevel: currentCEFR,
            skillType: skill,
            excludeQuestions: loadedQuestions.map(q => q.question_text)
          })
        });

        if (response.ok) {
          const data: CEFRQuestion = await response.json();
          loadedQuestions.push(data);
        } else {
          throw new Error("API failed");
        }
      } catch (err) {
        console.warn("API question generation failed, pulling high-fidelity templates...");
        failedToCallApi = true;
        // Break out of API loop and populate from templates to guarantee a zero-friction experience
        break;
      }
    }

    if (failedToCallApi || loadedQuestions.length < 5) {
      setApiFailed(true);
      // Grab the template questions for the user's level
      const templates = FALLBACK_QUESTIONS[currentCEFR] || FALLBACK_QUESTIONS["B1"];
      // Scramble them a bit or just use them
      setQuestions(templates.slice(0, 5));
    } else {
      setQuestions(loadedQuestions);
    }
    
    setIsLoading(false);
  };

  const handleOptionSelect = (option: "A" | "B" | "C" | "D") => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleAnswerSubmit = () => {
    if (!selectedOption || isAnswered) return;
    
    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQ.correct_option;
    
    setAnswers(prev => [
      ...prev,
      {
        question: currentQ,
        userAnswer: selectedOption,
        isCorrect
      }
    ]);
    
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setStep("summary");
    }
  };

  const handleFinish = () => {
    const correctCount = answers.filter(a => a.isCorrect).length;
    
    // Update local statistics
    const prevPractice = stats.practiceQuestions || 0;
    const prevAccuracy = stats.accuracy || 0;
    
    const newPracticeTotal = prevPractice + 5;
    // Weighted accuracy merge
    const totalCorrectPoints = (prevAccuracy * prevPractice) + ((correctCount / 5) * 100 * 5);
    const newAccuracy = Math.round(totalCorrectPoints / newPracticeTotal);

    onUpdateStats({
      practiceQuestions: newPracticeTotal,
      accuracy: Math.max(0, Math.min(100, newAccuracy))
    });

    // Log study activity for streak tracker
    window.dispatchEvent(new CustomEvent("log-study-activity"));
    onClose();
  };

  const currentQuestion = questions[currentQuestionIndex];
  const correctCount = answers.filter(a => a.isCorrect).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#0A0A0B]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#0F0F12] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative"
          id="quick-check-modal"
        >
          {/* Header Banner */}
          <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#141417]">
            <div className="flex items-center gap-2.5 text-left">
              <div className="h-8 w-8 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Zap className="h-4.5 w-4.5 animate-pulse" />
              </div>
              <div>
                <span className="text-[8px] font-mono font-bold text-[#D4AF37] uppercase tracking-widest block">
                  Fatima Quick Assessment Loop
                </span>
                <h3 className="text-sm font-serif font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>الفحص السريع للمهارات</span>
                  <span className="text-[#8E9299]">/</span>
                  <span>Skills Quick Check</span>
                </h3>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8E9299] hover:text-white hover:bg-white/5 transition"
              id="quick-check-close-btn"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
            
            {/* INTRO STEP */}
            {step === "intro" && (
              <div className="space-y-6 text-left">
                <div className="space-y-3">
                  <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-3">
                    <Languages className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-white uppercase tracking-wide">Bilingual Calibration Support Enabled</p>
                      <p className="text-indigo-200/80 leading-relaxed">
                        هذه الأداة صممت لتقييم مستواك الحالي بشكل سريع ودقيق في خمس دقائق عبر 5 أسئلة تغطي القواعد، المفردات، الاستماع والقراءة، ومطابقة مستواك بـ CEFR.
                      </p>
                    </div>
                  </div>

                  <h4 className="text-base font-serif font-black text-white uppercase tracking-wider pt-2">
                    Calibrate and update your profile status
                  </h4>
                  <p className="text-xs text-[#8E9299] leading-relaxed">
                    This rapid micro-diagnostic adaptively samples questions calibrated around your assessed level (<span className="text-[#D4AF37] font-mono font-bold">{currentCEFR}</span>). Completing this test updates your overall practice metrics and accuracy immediately.
                  </p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[10px]">
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="text-[#8E9299] block uppercase font-bold tracking-wider">Format</span>
                    <span className="text-white font-serif font-black text-xs uppercase tracking-wide">5 Multiple Choice</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="text-[#8E9299] block uppercase font-bold tracking-wider">Estimated Time</span>
                    <span className="text-white font-serif font-black text-xs uppercase tracking-wide">~3 Minutes</span>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                    <span className="text-[#8E9299] block uppercase font-bold tracking-wider">Target Tier</span>
                    <span className="text-[#D4AF37] font-serif font-black text-xs uppercase tracking-wide">CEFR {currentCEFR}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={startQuickCheck}
                    className="bg-[#D4AF37] hover:bg-[#E4C563] text-black font-extrabold text-xs uppercase tracking-widest px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-[#D4AF37]/15 transition duration-150 cursor-pointer"
                  >
                    <span>Start Quick Assessment</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* LOADING STATE */}
            {isLoading && (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="h-10 w-10 text-[#D4AF37] animate-spin" />
                <div className="space-y-1 text-center">
                  <p className="text-xs text-white font-bold uppercase tracking-widest font-mono">Fatima AI Synthesis Engine</p>
                  <p className="text-[11px] text-[#8E9299] font-mono animate-pulse">{loadingText}</p>
                </div>
              </div>
            )}

            {/* QUIZ STEP */}
            {!isLoading && step === "quiz" && currentQuestion && (
              <div className="space-y-6 text-left">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#8E9299]">
                    <span className="flex items-center gap-1.5 uppercase font-bold tracking-wider text-indigo-400">
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>{currentQuestion.skill_type} Section</span>
                    </span>
                    <span>Question {currentQuestionIndex + 1} of 5</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#D4AF37] to-indigo-500 transition-all duration-300" 
                      style={{ width: `${(currentQuestionIndex + 1) * 20}%` }}
                    />
                  </div>
                </div>

                {/* Scenario details */}
                <div className="bg-[#141417] border border-white/5 p-4 rounded-xl space-y-1.5">
                  <span className="text-[8px] font-mono font-bold text-[#8E9299] uppercase tracking-widest block">
                    Scenario Context / السياق والسيناريو
                  </span>
                  <p className="text-xs text-[#E0E0E0] italic leading-relaxed">
                    "{currentQuestion.context_scenario}"
                  </p>
                  {currentQuestion.can_do_statement && (
                    <span className="text-[9px] font-mono text-[#8E9299] block mt-1 pt-1.5 border-t border-white/5">
                      CEFR Descriptor: {currentQuestion.can_do_statement}
                    </span>
                  )}
                </div>

                {/* Question */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white leading-relaxed">
                    {currentQuestion.question_text}
                  </h4>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {(Object.keys(currentQuestion.options) as Array<"A" | "B" | "C" | "D">).map((optKey) => {
                      const isSelected = selectedOption === optKey;
                      const optionText = currentQuestion.options[optKey];
                      
                      let optionStyle = "border-white/5 bg-white/5 text-white hover:bg-white/10 hover:border-white/10";
                      
                      if (isAnswered) {
                        const isCorrect = optKey === currentQuestion.correct_option;
                        if (isCorrect) {
                          optionStyle = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.1)]";
                        } else if (isSelected) {
                          optionStyle = "border-rose-500/40 bg-rose-500/10 text-rose-300";
                        } else {
                          optionStyle = "border-white/5 bg-[#0F0F12] text-[#8E9299] opacity-50";
                        }
                      } else if (isSelected) {
                        optionStyle = "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37] font-bold";
                      }

                      return (
                        <button
                          key={optKey}
                          onClick={() => handleOptionSelect(optKey)}
                          disabled={isAnswered}
                          className={`w-full flex items-center justify-between p-4 rounded-xl text-xs text-left border transition duration-150 ${optionStyle} ${!isAnswered ? "cursor-pointer" : "cursor-default"}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`h-6 w-6 rounded-lg flex items-center justify-center font-mono font-bold text-[10px] ${
                              isSelected 
                                ? "bg-[#D4AF37] text-black" 
                                : isAnswered && optKey === currentQuestion.correct_option
                                ? "bg-emerald-500 text-black"
                                : "bg-white/5 border border-white/10 text-[#8E9299]"
                            }`}>
                              {optKey}
                            </span>
                            <span>{optionText}</span>
                          </div>
                          {isAnswered && optKey === currentQuestion.correct_option && (
                            <Check className="h-4 w-4 text-emerald-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback / Explanation display */}
                <AnimatePresence>
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/5 p-4 rounded-xl text-xs space-y-2 text-[#8E9299]"
                    >
                      <div className="flex items-center gap-2 text-white font-bold">
                        <AlertCircle className="h-4.5 w-4.5 text-[#D4AF37]" />
                        <span className="uppercase text-[10px] tracking-wider font-mono">Pedagogical Analysis / التفسير اللغوي</span>
                      </div>
                      <p className="leading-relaxed text-[#B0B2B8]">
                        {currentQuestion.pedagogical_explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer bar */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] font-mono text-[#8E9299]">
                    Level Indicator: <strong className="text-white font-bold">{currentQuestion.cefr_level}</strong>
                  </span>
                  
                  {!isAnswered ? (
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={!selectedOption}
                      className="bg-[#D4AF37] disabled:bg-white/5 disabled:text-[#8E9299] text-black font-extrabold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-lg transition duration-150 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Check Answer</span>
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-lg transition duration-150 cursor-pointer flex items-center gap-1"
                    >
                      <span>{currentQuestionIndex < 4 ? "Next Question" : "Finish Check"}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SUMMARY STEP */}
            {step === "summary" && (
              <div className="space-y-6 text-left">
                <div className="flex flex-col items-center justify-center text-center py-4 space-y-3">
                  <div className="h-16 w-16 bg-gradient-to-br from-[#D4AF37]/20 to-[#AA7C11]/20 border border-[#D4AF37]/35 rounded-full flex items-center justify-center text-[#D4AF37] shadow-xl shadow-[#D4AF37]/5">
                    <Award className="h-8 w-8 animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-[#D4AF37] uppercase tracking-widest block">
                      Micro Assessment Complete
                    </span>
                    <h4 className="text-lg font-serif font-black text-white uppercase tracking-wider">
                      Your Skill Calibration Report
                    </h4>
                    <p className="text-xs text-[#8E9299] max-w-md mx-auto leading-relaxed">
                      Your answers have successfully been processed through the Fatima CEFR diagnostics engine.
                    </p>
                  </div>
                </div>

                {/* Score panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-[10px] font-mono text-[#8E9299] uppercase tracking-widest font-bold">Accuracy Score</span>
                    <span className="text-4xl font-serif font-black text-[#D4AF37] font-mono">{correctCount} / 5</span>
                    <span className="text-[10px] text-white/50 font-mono font-bold">({Math.round(correctCount / 5 * 100)}% Match)</span>
                  </div>

                  <div className="p-5 bg-white/5 border border-white/5 rounded-2xl flex flex-col justify-center text-left space-y-2">
                    <div className="text-[10px] font-mono text-[#8E9299] uppercase tracking-widest font-bold">Performance Summary</div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#8E9299]">Level Calibrated:</span>
                        <span className="font-bold text-white font-mono">{currentCEFR}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8E9299]">Rating descriptor:</span>
                        <span className="font-bold text-white">{correctCount >= 4 ? "Excellent Speed" : correctCount >= 2 ? "Stable Focus" : "Needs Practice"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8E9299]">Profile Update:</span>
                        <span className="font-bold text-indigo-400 font-mono">+5 Questions Checked</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Questions Review */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-mono font-bold text-[#8E9299] uppercase tracking-widest block">
                    Question-by-Question Review
                  </span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                    {answers.map((ans, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={`h-5 w-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold ${
                            ans.isCorrect ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {idx + 1}
                          </span>
                          <div className="space-y-0.5 text-left">
                            <p className="font-serif font-bold text-white truncate max-w-sm">{ans.question.question_text}</p>
                            <span className="text-[9px] font-mono text-[#8E9299] uppercase">{ans.question.skill_type}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono font-bold uppercase ${ans.isCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                          {ans.isCorrect ? "Correct" : `Incorrect (${ans.userAnswer})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="bg-white/5 hover:bg-white/10 text-[#C8C8CC] hover:text-white border border-white/10 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition duration-150 cursor-pointer"
                  >
                    Discard Results
                  </button>
                  <button
                    onClick={handleFinish}
                    className="bg-[#D4AF37] hover:bg-[#E4C563] text-black font-extrabold text-xs uppercase tracking-widest px-6 py-3 rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/15 transition duration-150 cursor-pointer"
                  >
                    <span>Finish & Update Stats</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
