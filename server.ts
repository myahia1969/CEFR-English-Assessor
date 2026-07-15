import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization helper to prevent crashes if GEMINI_API_KEY is not defined at startup
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please set it in the Secrets panel in the AI Studio UI.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// 1. API: Generate Question (Task 1 & Task 2)
app.post("/api/generate-question", async (req, res) => {
  try {
    const { cefrLevel, skillType, topic, excludeQuestions } = req.body;
    
    const level = cefrLevel || "B1";
    const skill = skillType || "Grammar";
    const excludeList = excludeQuestions && Array.isArray(excludeQuestions) ? excludeQuestions.join(", ") : "";

    const ai = getGeminiClient();

    const promptText = `You are a certified CEFR Senior Language Assessor and expert Instructional Designer.
Generate an authentic English assessment item mapped to the official CEFR standards.

CEFR Level: ${level}
Skill Type: ${skill}
${topic ? `Context Topic/Scenario: ${topic}` : "General real-world communication context"}
${excludeList ? `Do NOT generate any of these previous questions to prevent duplication: ${excludeList}` : ""}

Pedagogical Directives:
- Communicative Competence: Prioritize practical, situational communication over abstract grammar isolation.
- Structured Scenario: Place the question in a realistic context scenario (e.g., A2: Booking a hotel room, B2: Presenting a product pitch in a business meeting, C1: High-level academic discourse).
- Distractors: Provide one indisputably correct option and three highly plausible distractors representing common learner misconceptions or interlanguage errors at this specific level.
- Explanation: Provide a detailed breakdown of why the correct option is right, and explain why each distractor is incorrect based on CEFR lexis or grammar rules.
- Authenticity: Ensure the English is natural, standard, and highly authentic. No placeholders or generic filler.

Format the output strictly according to the specified JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cefr_level: { type: Type.STRING, description: "The exact level: A0, A1, A2, B1, B2, C1, or C2" },
            skill_type: { type: Type.STRING, description: "The skill type: Grammar, Vocabulary, Listening, Reading, Speaking, or Writing" },
            can_do_statement: { type: Type.STRING, description: "The official CEFR functional 'Can-Do' statement mapped to this item" },
            context_scenario: { type: Type.STRING, description: "The realistic scenario, dialog, or passage establishing the context" },
            question_text: { type: Type.STRING, description: "The actual question prompt or gap-fill sentence for the user" },
            options: {
              type: Type.OBJECT,
              properties: {
                A: { type: Type.STRING, description: "Option A" },
                B: { type: Type.STRING, description: "Option B" },
                C: { type: Type.STRING, description: "Option C" },
                D: { type: Type.STRING, description: "Option D" }
              },
              required: ["A", "B", "C", "D"]
            },
            correct_option: { type: Type.STRING, description: "The correct key: A, B, C, or D" },
            pedagogical_explanation: { type: Type.STRING, description: "Detailed explanation of the correct option and distractor errors based on CEFR specifications" }
          },
          required: [
            "cefr_level", "skill_type", "can_do_statement", "context_scenario", 
            "question_text", "options", "correct_option", "pedagogical_explanation"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("Error generating question:", error);
    res.status(500).json({ error: error.message || "Failed to generate question" });
  }
});

// 2. API: Evaluate Open-ended Submission (Task 3)
app.post("/api/evaluate-submission", async (req, res) => {
  try {
    const { submissionType, promptText, userContent, cefrLevel, arabicFeedback } = req.body;

    if (!userContent || userContent.trim().length === 0) {
      return res.status(400).json({ error: "Submission content cannot be empty." });
    }

    const ai = getGeminiClient();

    const evaluationPrompt = `You are a certified CEFR Senior Language Assessor. Evaluate this open-ended English user response.

Assessment Parameters:
- Submission Type: ${submissionType === 'speaking' ? 'Speaking (Voice Transcription)' : 'Writing (Essay/Text)'}
- Target CEFR Level: ${cefrLevel || "B2"}
- Prompt Context: "${promptText || "General writing or speaking task"}"
- User Response: "${userContent}"

Rigorous CEFR Criteria Evaluation (Weighted Equally):
1. Grammatical Range and Accuracy (GRA): Analyze range of simple and complex structures used, frequency and impact of errors.
2. Lexical Resource (LR): Assess vocabulary depth, precision, collocations, style/register, and idiomatic expressions.
3. Fluency and Coherence (FC): Evaluate logical flow, paragraphing, organization, and the range and appropriateness of cohesive devices.
4. Pronunciation & Phonetic Accuracy: 
   - For speaking tasks: Analyze potential pronunciation friction points, phonetic accuracy, word stress, intonation patterns, and typical accents based on the transcribed text and user choices.
   - For writing tasks: Simply state "N/A for writing tasks".

Provide an overall assigned CEFR level (A1, A2, B1, B2, C1, or C2) that represents the user's best fit proficiency level.
Provide detailed constructive feedback highlighting key errors, grammatical corrections, and actionable tips.
${arabicFeedback ? `- **Crucial Request**: The user wants bilingual support. After your core English feedback, append a clear, neat, and highly encouraging section in Arabic (باللغة العربية) translating and summarizing the key corrections, grammatical advice, and pronunciation/writing tips so the user can perfectly comprehend their weak points.` : ""}
Provide an "improved_version" showing how a highly competent native speaker would express the same ideas at a superior tier, preserving the user's original message but with elevated structures.

Format the output strictly according to the specified JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: evaluationPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overall_assigned_level: { type: Type.STRING, description: "Must be exactly A0, A1, A2, B1, B2, C1, or C2" },
            criteria_scores: {
              type: Type.OBJECT,
              properties: {
                grammatical_accuracy: { type: Type.STRING, description: "Band score/level with deep GRA analysis and justification" },
                lexical_resource: { type: Type.STRING, description: "Band score/level with Lexical Resource depth analysis and justification" },
                coherence: { type: Type.STRING, description: "Band score/level with Fluency/Coherence and logical flow justification" },
                pronunciation: { type: Type.STRING, description: "Only for speaking tasks: Phonetic assessment/pronunciation analysis. For writing: write N/A" }
              },
              required: ["grammatical_accuracy", "lexical_resource", "coherence", "pronunciation"]
            },
            constructive_feedback: { type: Type.STRING, description: "Actionable peer-review pointing out specific errors and detailing corrections (with bilingual Arabic explanation if requested)" },
            improved_version: { type: Type.STRING, description: "The polished native speaker rewrite elevating the text to C1/C2 competency" }
          },
          required: ["overall_assigned_level", "criteria_scores", "constructive_feedback", "improved_version"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No evaluation report received from Gemini.");
    }

    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("Error evaluating submission:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate submission" });
  }
});

// 3. API: Generate Vocabulary Flashcards from missed questions or level standards
app.post("/api/generate-flashcards", async (req, res) => {
  try {
    const { missedQuestions, cefrLevel } = req.body;
    const level = cefrLevel || "B1";
    
    const ai = getGeminiClient();

    const promptText = `You are an expert lexicologist, senior English educator, and specialist in CEFR certification standards.
    Your objective is to generate 6 custom digital vocabulary flashcards.
    
    ${missedQuestions && Array.isArray(missedQuestions) && missedQuestions.length > 0 
      ? `The learner has recently struggled with specific questions and scenarios in their adaptive assessment.
         Analyze their past errors to extract 6 highly-relevant target vocabulary words, phrasal verbs, or idioms that represent the source of their confusion or are key lexical items tested:
         
         Learner Assessment Errors Context:
         ${JSON.stringify((missedQuestions || [])
           .filter((q: any) => q && (q.question_text || q.context_scenario || q.question || q.scenario))
           .map((q: any) => ({
             scenario: q?.context_scenario || q?.scenario || "",
             question: q?.question_text || q?.question || "",
             explanation: q?.pedagogical_explanation || q?.explanation || ""
           }))
         )}
         
         Analyze the context of their errors to identify the precise words, collocations, phrasal verbs, or advanced idioms they missed. Create the deck specifically targeting these key concepts.`
      : `Since the user hasn't completed any adaptive assessments with missed items yet, curate a deck of 6 high-utility, standard, and challenging CEFR ${level} vocabulary words, phrasal verbs, or idiomatic expressions that are typical focus areas and common pain points at this level.`
    }

    For each of the 6 flashcard items, you must provide:
    1. "word": The target vocabulary word, phrasal verb, or idiom. Keep it concise (1-3 words max).
    2. "arabic_translation": A highly precise, natural translation of the word or phrase in Arabic (باللغة العربية).
    3. "ipa": The standard International Phonetic Alphabet (IPA) pronunciation guide (e.g. /ɪmˈpækt/).
    4. "level": The CEFR level of this specific word (must be A1, A2, B1, B2, C1, or C2).
    5. "definition": A precise, simple, and elegant learner-friendly definition.
    6. "example_sentence": A highly contextual, realistic example sentence illustrating the word's precise usage. Highlight the word in the sentence.
    7. "usage_tip": A professional tip, grammatical collocation partner, or common misconception to avoid.
    8. "quiz_question": A custom fill-in-the-blank practice sentence where the target word is replaced with a blank (e.g., "________"), so the user can test their knowledge.
    9. "quiz_answer": The exact target word or phrase that fills in the blank.

    Make sure the vocabulary targets represent highly authentic standard English.
    Format the output strictly according to the specified JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING, description: "The target vocabulary word, phrasal verb, or idiom" },
              arabic_translation: { type: Type.STRING, description: "Highly precise, natural translation of the word or phrase in Arabic (باللغة العربية)" },
              ipa: { type: Type.STRING, description: "Standard IPA pronunciation guide" },
              level: { type: Type.STRING, description: "Specific CEFR level of this word (A1, A2, B1, B2, C1, C2)" },
              definition: { type: Type.STRING, description: "Clear learner-friendly definition" },
              example_sentence: { type: Type.STRING, description: "Realistic context-rich example sentence showcasing the word" },
              usage_tip: { type: Type.STRING, description: "Professional tip, collocation, or warning about common mistakes" },
              quiz_question: { type: Type.STRING, description: "A gap-fill practice sentence replacing the target word with '_______'" },
              quiz_answer: { type: Type.STRING, description: "The correct target word/phrase to fill in" }
            },
            required: ["word", "arabic_translation", "ipa", "level", "definition", "example_sentence", "usage_tip", "quiz_question", "quiz_answer"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No flashcard data received from Gemini.");
    }

    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("Error generating flashcards:", error);
    res.status(500).json({ error: error.message || "Failed to generate flashcards" });
  }
});

// 4. API: Language Mentor Chat Sidebar
app.post("/api/mentor-chat", async (req, res) => {
  try {
    const { messages, userLevel, arabicExplanations } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    // Map sender-based messages to Gemini Content objects
    // user -> 'user', mentor -> 'model'
    const formattedContents = messages.map((msg: any) => ({
      role: msg.sender === "mentor" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    const systemInstruction = `You are Dr. Lexis, a supportive, senior CEFR English Language Mentor at Lexicon Academy.
Your role is to answer user's questions about English grammar, vocabulary, collocations, phrasal verbs, pronunciation, idioms, or CEFR exam strategies.
- The learner's CEFR proficiency level: ${userLevel || "unassessed"}. Align explanations so they are accessible but challenging.
- Provide highly contextual, natural, authentic examples.
- Highlight patterns, common learner pitfalls, or interesting collocations.
- Keep responses relatively brief (2-3 paragraphs max) so they fit nicely in a sidebar chat.
- Always be encouraging, warm, professional, and articulate.
- Use clear Markdown formatting (bold, lists, etc.) to make the advice easy to scan.
${arabicExplanations ? `- **Crucial Instruction**: The user has requested bilingual assistance. Provide your explanations in clear English, but append direct, natural translations or explanation summaries in Arabic (باللغة العربية) for all complex grammar terms, collocations, idioms, and examples. Ensure both English-only and Arabic translation parts are clear and neatly structured.` : ""}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction
      }
    });

    const reply = response.text || "I apologize, but I am unable to formulate a response at this moment. Let's try again.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Error in Language Mentor Chat:", error);
    res.status(500).json({ error: error.message || "Failed to process mentor question." });
  }
});

// 5. API: Language Mentor Roleplay Mode Endpoint
app.post("/api/mentor-roleplay", async (req, res) => {
  try {
    const { action, persona, userLevel, messages, userInput, arabicExplanations } = req.body;
    
    if (!persona || !action) {
      return res.status(400).json({ error: "Action and Persona parameters are required." });
    }

    const ai = getGeminiClient();

    const personaPrompts: Record<string, { name: string; role: string; details: string }> = {
      job_interviewer: {
        name: "Mr. Harrison",
        role: "Senior HR Director at a multinational technology company",
        details: "Conducts professional, structured job interviews. Asks about career goals, handling teamwork, resolving conflicts, and technical background. At A1-A2, asks simple questions like 'Why do you want this job?' or 'What do you do?'. At B1-B2, asks about work projects and problem-solving. At C1-C2, asks about high-level leadership, cross-functional conflicts, and executive strategic vision."
      },
      barista: {
        name: "Alex",
        role: "Friendly, fast-talking barista at a busy downtown coffee shop",
        details: "Handles coffee orders, pastry requests, and payment options. May introduce light complications (e.g. out of milk options, cards-only, special flavor syrups) to test practical comprehension. Keeps the conversation upbeat and casual."
      },
      customs_officer: {
        name: "Officer Vance",
        role: "Professional Border Control agent at JFK International Airport",
        details: "Asks questions about passport details, travel duration, the purpose of visit, declaring items, and baggage contents. Keeps a formal, serious, but polite tone. Expects clear, direct answers."
      },
      hotel_receptionist: {
        name: "Maya",
        role: "Helpful but busy front-desk receptionist at a luxury boutique hotel",
        details: "Assists with booking rooms, explaining amenities, handling complaints (e.g., loud neighbors, missing towels, cold water), and providing local sightseeing tips. May challenge the user with reservation mistakes or billing questions."
      },
      debate_partner: {
        name: "Dr. Clara",
        role: "Sharp, academic professor and intellectual debate partner",
        details: "Engages in structured intellectual debates on topics like 'AI in education', 'Remote vs office work', or 'Climate policy'. Challenges user's arguments, asks for evidence, uses sophisticated logical structure, and expects formal discourse markers."
      }
    };

    const targetPersona = personaPrompts[persona] || personaPrompts.barista;
    const level = userLevel || "B1";

    if (action === "start") {
      const systemInstruction = `You are playing the role of ${targetPersona.name}, who is a ${targetPersona.role}.
Target Learner CEFR Level: ${level}.
Details about your character's conversational guidelines:
${targetPersona.details}

TASK: Generate a single opening message in-character as ${targetPersona.name} to greet the user and begin the scenario.
Keep the greeting highly engaging, realistic, and strictly calibrated to the CEFR level:
- For A1-A2: Keep it very simple, short, and use clear, direct questions.
- For B1-B2: Normal professional/casual pacing, with a standard realistic setup.
- For C1-C2: Elegant, sophisticated, or highly advanced phrasing.

Do NOT write any meta-commentary, introductory text, or side explanations. Output ONLY the spoken words of the character.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Start the roleplay.",
        config: { systemInstruction }
      });

      return res.json({ reply: response.text?.trim() });
    }

    if (action === "chat") {
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages history is required for chat action." });
      }

      const formattedContents = messages.map((msg: any) => ({
        role: msg.sender === "mentor" ? "model" : "user",
        parts: [{ text: msg.text }]
      }));

      // Append user input if provided separately
      if (userInput) {
        formattedContents.push({
          role: "user",
          parts: [{ text: userInput }]
        });
      }

      const systemInstruction = `You are playing the role of ${targetPersona.name}, who is a ${targetPersona.role}.
Target Learner CEFR Level: ${level}.
Character guidelines:
${targetPersona.details}

Rules for the conversation:
- Respond STRICTLY in-character as ${targetPersona.name}. Do not break character.
- Keep your response brief, natural, and conversational (1 to 3 sentences maximum) to mimic real-world interactions.
- Calibrate your language level strictly to ${level}:
  * A1-A2: use simple vocabulary, present/past tenses, clear sentence structures, and direct questions.
  * B1-B2: natural conversation with moderate phrasal verbs, clauses, and realistic situational speed.
  * C1-C2: sophisticated lexicon, idioms, subjunctive clauses, and complex sentence flow.
- React directly to the user's previous statement, keeping the scene dynamic. If the user makes an obvious grammatical slip, do NOT correct them in-character, but keep the conversation moving. You will assess them at the end.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: { systemInstruction }
      });

      return res.json({ reply: response.text?.trim() });
    }

    if (action === "feedback") {
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages transcript is required for feedback." });
      }

      const transcript = messages.map((m: any) => `${m.sender === "mentor" ? targetPersona.name : "User"}: ${m.text}`).join("\n");

      const promptText = `You are a certified CEFR Senior Language Assessor evaluating a student's performance in an interactive English roleplay.
      
Scenario Persona: ${targetPersona.name} (${targetPersona.role})
Expected Level: ${level}
Roleplay Transcript:
"""
${transcript}
"""

Evaluate the User's English performance under these aspects:
- Grammatical Range & Accuracy (GRA)
- Lexical Resource (Vocabulary used, range, collocations)
- Situational/Task Success (Did they communicate their needs or answers effectively in this role?)

Determine an estimated CEFR Level demonstrated by the user in this transcript (A1, A2, B1, B2, C1, or C2).
Provide detailed, constructive corrections of spelling, grammar, or word choices.
Provide vocabulary recommendations suitable for this scenario at their target level.
Decide if they successfully completed the communication goals (task_completed).
${arabicExplanations ? `Provide a highly encouraging and comprehensive Arabic translation of the key strengths and corrections in the "arabic_summary" field so the user understands perfectly.` : "You can leave the 'arabic_summary' as N/A or a short sentence."}

Format the output strictly according to the specified JSON schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              assigned_level: { type: Type.STRING, description: "Estimated CEFR level shown: A1, A2, B1, B2, C1, or C2" },
              strengths: { type: Type.STRING, description: "Specific communication strengths demonstrated" },
              corrections: { type: Type.STRING, description: "Grammatical or stylistic corrections with clear explanation" },
              vocabulary_suggestions: { type: Type.STRING, description: "A few elevated words or idioms they could have used in this scenario" },
              task_completed: { type: Type.BOOLEAN, description: "Whether they completed the roleplay task successfully" },
              arabic_summary: { type: Type.STRING, description: "The Arabic summary of strengths and corrections if requested" }
            },
            required: ["assigned_level", "strengths", "corrections", "vocabulary_suggestions", "task_completed", "arabic_summary"]
          }
        }
      });

      const feedbackData = JSON.parse(response.text?.trim() || "{}");
      return res.json(feedbackData);
    }

    res.status(400).json({ error: "Invalid action." });
  } catch (error: any) {
    console.error("Error in Language Mentor Roleplay:", error);
    res.status(500).json({ error: error.message || "Failed to process roleplay." });
  }
});

// 6. API: Generate TOEFL iBT Practice Test
app.post("/api/generate-toefl-test", async (req, res) => {
  try {
    const { level } = req.body;
    const targetLevel = level || "B2";
    const ai = getGeminiClient();

    const promptText = `You are a certified TOEFL iBT Test Constructor and expert ESL Instructional Designer.
Generate a complete, highly authentic miniature TOEFL iBT practice test tailored to the target level.

Target Level: ${targetLevel} (can be: "B1" for Low-Intermediate / Score 57-86, "B2" for High-Intermediate / Score 87-109, "C1" for Advanced / Score 110-120).

This practice test must contain:
1. Reading Section:
   - An academic passage (roughly 250-350 words) on a scientific, historical, or cultural topic (e.g. marine biology, Roman architecture, cosmic dust).
   - 3 multiple-choice questions testing reading skills like: vocabulary in context, factual recall, and rhetorical purpose.
2. Listening Section:
   - An academic lecture script (roughly 250-350 words) delivered by a university professor. The professor should speak clearly with introductory remarks, a main thesis, and conversational pacing or questions to students.
   - 3 multiple-choice questions testing key details, speaker stance, or organizational structure.
3. Speaking Section:
   - 1 Independent Speaking Question (Task 1 style, expressing an opinion or choosing between two options with support).
4. Writing Section:
   - 1 Writing for Academic Discussion Prompt (reminiscent of the new TOEFL iBT Writing format: a professor asks a question on a discussion board, and two student posts are presented. The user must contribute their own response to the discussion).

All questions must be highly authentic and realistic. Ensure there is only ONE indisputably correct option (A, B, C, or D) and three plausible distractors representing common English language learner misconceptions.
Format the output strictly according to the specified JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING },
            readingSection: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                passage: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionText: { type: Type.STRING },
                      options: {
                        type: Type.OBJECT,
                        properties: {
                          A: { type: Type.STRING },
                          B: { type: Type.STRING },
                          C: { type: Type.STRING },
                          D: { type: Type.STRING }
                        },
                        required: ["A", "B", "C", "D"]
                      },
                      correctOption: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    },
                    required: ["questionText", "options", "correctOption", "explanation"]
                  }
                }
              },
              required: ["title", "passage", "questions"]
            },
            listeningSection: {
              type: Type.OBJECT,
              properties: {
                lectureTitle: { type: Type.STRING },
                lectureText: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionText: { type: Type.STRING },
                      options: {
                        type: Type.OBJECT,
                        properties: {
                          A: { type: Type.STRING },
                          B: { type: Type.STRING },
                          C: { type: Type.STRING },
                          D: { type: Type.STRING }
                        },
                        required: ["A", "B", "C", "D"]
                      },
                      correctOption: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    },
                    required: ["questionText", "options", "correctOption", "explanation"]
                  }
                }
              },
              required: ["lectureTitle", "lectureText", "questions"]
            },
            speakingSection: {
              type: Type.OBJECT,
              properties: {
                speakingPrompt: { type: Type.STRING }
              },
              required: ["speakingPrompt"]
            },
            writingSection: {
              type: Type.OBJECT,
              properties: {
                writingPrompt: { type: Type.STRING }
              },
              required: ["writingPrompt"]
            }
          },
          required: ["level", "readingSection", "listeningSection", "speakingSection", "writingSection"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini.");
    }

    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("Error in generating TOEFL test:", error);
    res.status(500).json({ error: error.message || "Failed to generate TOEFL practice test." });
  }
});

// 7. API: Evaluate TOEFL Speaking or Writing response
app.post("/api/evaluate-toefl-section", async (req, res) => {
  try {
    const { type, prompt, userResponse, level } = req.body;
    
    if (!userResponse || userResponse.trim().length === 0) {
      return res.status(400).json({ error: "Response content cannot be empty." });
    }

    const ai = getGeminiClient();

    const evaluationPrompt = `You are a certified TOEFL iBT Expert Grader. Grade this student response for the TOEFL iBT ${type === "speaking" ? "Speaking" : "Writing"} section.

Target Level: ${level || "B2"}
Section Type: ${type === "speaking" ? "Speaking" : "Writing"}
Prompt / Question: "${prompt}"
User Response: "${userResponse}"

Evaluate the response strictly based on the official TOEFL iBT scoring rubrics (0 to 30 scaled score).
Provide:
1. score: Integer from 0 to 30.
2. rubricScores: Object with scores/analysis for Delivery (or Organization), Language Use (Grammar/Vocabulary), and Topic Development.
3. constructiveFeedback: Actionable, detailed feedback pointing out mistakes and how to fix them.
4. improvedVersion: A polished, perfect score native version of the response.
5. arabicFeedback: Encapsulate key corrections and suggestions in a detailed Arabic description (باللغة العربية) so Arabic speaking users can perfectly understand their scores and errors.

Format the output strictly according to the specified JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: evaluationPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "A scaled score from 0 to 30 representing the TOEFL rubric rating." },
            rubricScores: {
              type: Type.OBJECT,
              properties: {
                delivery_or_organization: { type: Type.STRING, description: "Evaluation of pacing, pronunciation, flow (for speaking) or structural paragraphing and organization (for writing)" },
                language_use: { type: Type.STRING, description: "Evaluation of grammatical range/accuracy and lexical resource/choice" },
                topic_development: { type: Type.STRING, description: "Evaluation of response relevance, argumentation, elaboration, and coherence" }
              },
              required: ["delivery_or_organization", "language_use", "topic_development"]
            },
            constructiveFeedback: { type: Type.STRING, description: "Deep actionable tips, explaining specific errors and spelling/pronunciation slips" },
            improvedVersion: { type: Type.STRING, description: "A top-tier native score level rewrite of the response" },
            arabicFeedback: { type: Type.STRING, description: "A translation/summary of errors and learning advice in clear Arabic (باللغة العربية)" }
          },
          required: ["score", "rubricScores", "constructiveFeedback", "improvedVersion", "arabicFeedback"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini.");
    }

    res.json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("Error in evaluating TOEFL response:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate TOEFL response." });
  }
});

// Helper to convert 24kHz 16-bit Mono PCM buffer to a playable WAV buffer
function pcmToWav(pcmBuffer: Buffer, sampleRate: number = 24000): Buffer {
  const header = Buffer.alloc(44);
  const blockAlign = 2; // 1 channel, 16-bit (2 bytes per sample)
  const byteRate = sampleRate * blockAlign;
  const dataLength = pcmBuffer.length;
  const fileLength = 36 + dataLength;

  // RIFF identifier
  header.write("RIFF", 0);
  // file length minus 8 bytes
  header.writeUInt32LE(fileLength, 4);
  // RIFF type
  header.write("WAVE", 8);
  // format chunk identifier
  header.write("fmt ", 12);
  // format chunk length (16)
  header.writeUInt32LE(16, 16);
  // sample format (1 is PCM)
  header.writeUInt16LE(1, 20);
  // channel count (1)
  header.writeUInt16LE(1, 22);
  // sample rate
  header.writeUInt32LE(sampleRate, 24);
  // byte rate
  header.writeUInt32LE(byteRate, 28);
  // block align (2)
  header.writeUInt16LE(blockAlign, 32);
  // bits per sample (16)
  header.writeUInt16LE(16, 34);
  // data chunk identifier
  header.write("data", 36);
  // data chunk length
  header.writeUInt32LE(dataLength, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// 8. API: Text-to-Speech (TTS) using Gemini Voice model
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceName } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const ai = getGeminiClient();
    const voice = voiceName || "Kore"; // Puck, Charon, Kore, Fenrir, Zephyr

    // Clean markdown and brackets for cleaner audio speech output
    const cleanText = text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/#+\s+/g, "")
      .replace(/<\/?[^>]+(>|$)/g, "")
      .trim();

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = audioPart?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio content returned by the Gemini TTS model.");
    }

    // Decode PCM base64 to Buffer
    const pcmBuffer = Buffer.from(base64Audio, "base64");
    
    // Wrap raw PCM buffer in WAV header
    const wavBuffer = pcmToWav(pcmBuffer, 24000);

    // Convert back to base64
    const base64Wav = wavBuffer.toString("base64");

    res.json({
      audio: base64Wav,
      mimeType: "audio/wav"
    });
  } catch (error: any) {
    console.error("Error in AI TTS:", error);
    res.status(500).json({ error: error.message || "Failed to generate voice." });
  }
});

// Serve health status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Integrate Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
