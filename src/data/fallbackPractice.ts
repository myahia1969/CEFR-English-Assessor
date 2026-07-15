import { CEFRLevel, SkillType, CEFRQuestion } from "../types";

export interface FallbackFlashcard {
  word: string;
  arabic_translation?: string;
  ipa: string;
  level: string;
  definition: string;
  example_sentence: string;
  usage_tip: string;
  quiz_question: string;
  quiz_answer: string;
}

export const FALLBACK_FLASHCARDS: Record<CEFRLevel, FallbackFlashcard[]> = {
  A0: [
    {
      word: "hello",
      arabic_translation: "مرحباً",
      ipa: "/həˈloʊ/",
      level: "A0",
      definition: "A common, friendly greeting used when meeting someone.",
      example_sentence: "Hello! My name is Fatima. Nice to meet you.",
      usage_tip: "Use this to start any conversation, formal or informal.",
      quiz_question: "Fatima said, '_______, how are you today?'",
      quiz_answer: "hello"
    },
    {
      word: "goodbye",
      arabic_translation: "وداعاً",
      ipa: "/ˌɡʊdˈbaɪ/",
      level: "A0",
      definition: "A phrase used when departing or ending a conversation.",
      example_sentence: "Goodbye! Have a safe trip back home.",
      usage_tip: "Can be shortened to 'bye' in casual situations.",
      quiz_question: "I waved and said, '_______' as the train departed.",
      quiz_answer: "goodbye"
    },
    {
      word: "please",
      arabic_translation: "من فضلك",
      ipa: "/pliːz/",
      level: "A0",
      definition: "A polite word used when asking for something or making a request.",
      example_sentence: "Could you pass me the water bottle, please?",
      usage_tip: "Always add this to requests to sound friendly and polite.",
      quiz_question: "Can I have some tea, _______?",
      quiz_answer: "please"
    },
    {
      word: "thank you",
      arabic_translation: "شكراً لك",
      ipa: "/θæŋk juː/",
      level: "A0",
      definition: "An expression of gratitude used to show appreciation.",
      example_sentence: "Thank you so much for helping me carry these boxes.",
      usage_tip: "Can be casually shortened to 'thanks'.",
      quiz_question: "_______ for the delicious meal you prepared!",
      quiz_answer: "thank you"
    },
    {
      word: "yes",
      arabic_translation: "نعم",
      ipa: "/jes/",
      level: "A0",
      definition: "An affirmative answer used to express agreement or confirmation.",
      example_sentence: "Yes, I would love to join you for lunch today.",
      usage_tip: "Use clearly to express positive confirmation.",
      quiz_question: "'Are you ready?' '_______, let's go!'",
      quiz_answer: "yes"
    },
    {
      word: "no",
      arabic_translation: "لا",
      ipa: "/noʊ/",
      level: "A0",
      definition: "A negative answer used to express refusal or disagreement.",
      example_sentence: "No, I do not have any pet animals at home.",
      usage_tip: "Be polite when saying no by adding 'thank you' (e.g. 'No, thank you').",
      quiz_question: "'Is it raining?' '_______, the sky is clear.'",
      quiz_answer: "no"
    }
  ],
  A1: [
    {
      word: "welcome",
      arabic_translation: "أهلاً بك",
      ipa: "/ˈwelkəm/",
      level: "A1",
      definition: "A warm greeting given to someone arriving in a new place.",
      example_sentence: "Welcome to our beautiful English training academy!",
      usage_tip: "Can be used as a verb (to welcome someone) or an adjective.",
      quiz_question: "A giant sign at the airport read: '_______ to London!'",
      quiz_answer: "welcome"
    },
    {
      word: "friend",
      arabic_translation: "صديق",
      ipa: "/frend/",
      level: "A1",
      definition: "A person whom you know well and like, but who is not a relative.",
      example_sentence: "Sarah is my best friend from high school.",
      usage_tip: "Usually collocates with verbs like 'make friends' or 'meet friends'.",
      quiz_question: "I am going to the cinema tonight with my close _______.",
      quiz_answer: "friend"
    },
    {
      word: "family",
      arabic_translation: "عائلة",
      ipa: "/ˈfæm.əl.i/",
      level: "A1",
      definition: "A group of people who are related to each other.",
      example_sentence: "My family gathers together every weekend for dinner.",
      usage_tip: "Can take singular or plural verbs in British English, but singular is standard in US English.",
      quiz_question: "I love my _______ very much; they support all my dreams.",
      quiz_answer: "family"
    },
    {
      word: "school",
      arabic_translation: "مدرسة",
      ipa: "/skuːl/",
      level: "A1",
      definition: "A place where children go to be educated.",
      example_sentence: "The children walk to school together every morning.",
      usage_tip: "No article is used when referring to studying there (e.g. 'He is at school' vs 'He is at the school building').",
      quiz_question: "She teaches young children at an elementary _______.",
      quiz_answer: "school"
    },
    {
      word: "water",
      arabic_translation: "ماء",
      ipa: "/ˈwɔː.tər/",
      level: "A1",
      definition: "A clear liquid, without color or taste, that falls as rain and is necessary for life.",
      example_sentence: "I always drink a large glass of water in the morning.",
      usage_tip: "Pronounced with a silent 'r' in British English (/ˈwɔː.tə/) and a flapped 't' in American English.",
      quiz_question: "Please give me a glass of cold _______ to drink.",
      quiz_answer: "water"
    },
    {
      word: "food",
      arabic_translation: "طعام",
      ipa: "/fuːd/",
      level: "A1",
      definition: "Something that people and animals eat to keep them alive.",
      example_sentence: "The local restaurant serves organic, healthy food.",
      usage_tip: "Uncountable noun, but can be plural ('foods') when talking about specific types of food.",
      quiz_question: "I bought some fresh _______ at the supermarket.",
      quiz_answer: "food"
    }
  ],
  A2: [
    {
      word: "appointment",
      arabic_translation: "موعد",
      ipa: "/əˈpɔɪnt.mənt/",
      level: "A2",
      definition: "A formal arrangement to meet someone at a particular time and place.",
      example_sentence: "I have a dentist appointment tomorrow morning at nine o'clock.",
      usage_tip: "Collocates with 'make an appointment' or 'keep an appointment'. Do not use 'date' for professional meetings.",
      quiz_question: "I need to call the clinic to book an _______ with Dr. Smith.",
      quiz_answer: "appointment"
    },
    {
      word: "schedule",
      arabic_translation: "جدول مواعيد",
      ipa: "/ˈʃed.juːl/",
      level: "A2",
      definition: "A plan of activities or events showing when they will happen.",
      example_sentence: "Her busy schedule leaves very little time for hobbies.",
      usage_tip: "Pronounced 'sked-yool' in US English and 'shed-yool' in British English.",
      quiz_question: "Please check your training _______ to see when our class starts.",
      quiz_answer: "schedule"
    },
    {
      word: "passenger",
      arabic_translation: "راكب",
      ipa: "/ˈpæs.ən.dʒər/",
      level: "A2",
      definition: "A person traveling in a vehicle, bus, train, or plane, who is not driving.",
      example_sentence: "The bus driver asked every passenger to show their ticket.",
      usage_tip: "Commonly used in travel contexts like boarding announcements.",
      quiz_question: "Every _______ must wear a seatbelt during the flight.",
      quiz_answer: "passenger"
    },
    {
      word: "luggage",
      arabic_translation: "أمتعة",
      ipa: "/ˈlʌɡ.ɪdʒ/",
      level: "A2",
      definition: "Bags, cases, and containers that hold a traveler's belongings.",
      example_sentence: "We checked our heavy luggage at the airport counter.",
      usage_tip: "Uncountable noun. Use 'a piece of luggage' to refer to a single bag. Never say 'luggages'.",
      quiz_question: "He lost his luggage at the airport, so he had no clothes.",
      quiz_answer: "luggage"
    },
    {
      word: "neighbor",
      arabic_translation: "جار",
      ipa: "/ˈneɪ.bər/",
      level: "A2",
      definition: "A person who lives next to or near you.",
      example_sentence: "Our neighbor kindly offered to water our plants while we were away.",
      usage_tip: "Spelled 'neighbour' in British English and 'neighbor' in American English.",
      quiz_question: "My next-door _______ is extremely quiet and friendly.",
      quiz_answer: "neighbor"
    },
    {
      word: "receipt",
      arabic_translation: "إيصال",
      ipa: "/rɪˈsiːt/",
      level: "A2",
      definition: "A piece of paper proving that money, goods, or information has been received.",
      example_sentence: "Always keep your receipt in case you need to return the item.",
      usage_tip: "Note that the letter 'p' is completely silent.",
      quiz_question: "The cashier handed me the change and my shopping _______.",
      quiz_answer: "receipt"
    }
  ],
  B1: [
    {
      word: "look forward to",
      arabic_translation: "يتطلع إلى",
      ipa: "/lʊk ˈfɔːr.wərd tuː/",
      level: "B1",
      definition: "To feel pleased and excited about something that is going to happen.",
      example_sentence: "I look forward to meeting you in person next week.",
      usage_tip: "Always follow 'to' with a noun or a gerund (verb-ing), NOT an infinitive verb.",
      quiz_question: "We look forward to _______ (receive) your formal application.",
      quiz_answer: "receiving"
    },
    {
      word: "recommend",
      arabic_translation: "يوصي بـ",
      ipa: "/ˌrek.əˈmend/",
      level: "B1",
      definition: "To advise someone to do something, or to say that something is good.",
      example_sentence: "I highly recommend trying the seafood pasta at that restaurant.",
      usage_tip: "Do not say 'recommend me a book', say 'recommend a book to me' or 'recommend that I read...'.",
      quiz_question: "Can you _______ a reliable mechanic in the area?",
      quiz_answer: "recommend"
    },
    {
      word: "opportunity",
      arabic_translation: "فرصة",
      ipa: "/ˌɒp.əˈtjuː.nə.ti/",
      level: "B1",
      definition: "A situation or occasion that makes it possible to do something.",
      example_sentence: "This internship is a marvelous opportunity to gain real work experience.",
      usage_tip: "Collocates with 'take/seize/miss/waste an opportunity'.",
      quiz_question: "Do not miss the _______ to ask questions at the end of the seminar.",
      quiz_answer: "opportunity"
    },
    {
      word: "disappointed",
      arabic_translation: "خائب الأمل",
      ipa: "/ˌdɪs.əˈpɔɪn.tɪd/",
      level: "B1",
      definition: "Unhappy because someone or something was not as good as you hoped.",
      example_sentence: "She was deeply disappointed with the slow customer support service.",
      usage_tip: "Use prepositions 'by', 'about', or 'with' for things, and 'in' or 'with' for people.",
      quiz_question: "The fans were _______ when their team lost the championship match.",
      quiz_answer: "disappointed"
    },
    {
      word: "achieve",
      arabic_translation: "يحقق",
      ipa: "/əˈtʃiːv/",
      level: "B1",
      definition: "To succeed in finishing or reaching something, especially after a lot of work.",
      example_sentence: "With focus and persistence, she was able to achieve all her career goals.",
      usage_tip: "Usually collocates with 'goals', 'milestones', 'success', or 'results'.",
      quiz_question: "It takes hard work and dedication to _______ high academic grades.",
      quiz_answer: "achieve"
    },
    {
      word: "take part in",
      arabic_translation: "يشارك في",
      ipa: "/teɪk pɑːrt ɪn/",
      level: "B1",
      definition: "To actively participate or get involved in an event or activity.",
      example_sentence: "More than sixty students decided to take part in the debate contest.",
      usage_tip: "Synonymous with 'participate in', but more common in natural conversation.",
      quiz_question: "We encourage all employees to _______ the volunteering day.",
      quiz_answer: "take part in"
    }
  ],
  B2: [
    {
      word: "coincidence",
      arabic_translation: "صدفة",
      ipa: "/koʊˈɪn.sɪ.dəns/",
      level: "B2",
      definition: "An occasion when two or more similar things happen at the same time by chance.",
      example_sentence: "What an amazing coincidence that we bumped into each other in Tokyo!",
      usage_tip: "Adjective form is 'coincidental'. Use in phrases like 'by sheer coincidence'.",
      quiz_question: "It was a complete _______ that we both wore the exact same shirt today.",
      quiz_answer: "coincidence"
    },
    {
      word: "consequence",
      arabic_translation: "عاقبة / نتيجة",
      ipa: "/ˈkɒn.sɪ.kwəns/",
      level: "B2",
      definition: "A result of a particular action or situation, often one that is bad or not convenient.",
      example_sentence: "Rising sea levels are a direct consequence of global warming.",
      usage_tip: "Often used in the plural. Adverb form is 'consequently' (as a result).",
      quiz_question: "You must accept the _______ of your choices, whatever they may be.",
      quiz_answer: "consequence"
    },
    {
      word: "procrastinate",
      arabic_translation: "يسوف / يماطل",
      ipa: "/proʊˈkræs.tɪ.neɪt/",
      level: "B2",
      definition: "To delay doing something that you must do, usually because it is unpleasant or boring.",
      example_sentence: "If you procrastinate on your essay, you will be highly stressed next week.",
      usage_tip: "Noun form is 'procrastination' (the act of putting things off).",
      quiz_question: "Stop trying to _______ and start working on your research project today.",
      quiz_answer: "procrastinate"
    },
    {
      word: "ubiquitous",
      arabic_translation: "واسع الانتشار / كلي الوجود",
      ipa: "/juːˈbɪk.wɪ.təs/",
      level: "B2",
      definition: "Seeming to be everywhere or in all places at the same time.",
      example_sentence: "Smartphones have become completely ubiquitous in modern daily life.",
      usage_tip: "A highly expressive C1/B2 level word meaning 'omnipresent' or extremely common.",
      quiz_question: "Coffee shops are _______ in this city; there is one on every corner.",
      quiz_answer: "ubiquitous"
    },
    {
      word: "compelling",
      arabic_translation: "مقنع جداً / جذاب",
      ipa: "/kəmˈpel.ɪŋ/",
      level: "B2",
      definition: "Very exciting or interesting; making you accept that something is true.",
      example_sentence: "The defense attorney presented a compelling argument to the jury.",
      usage_tip: "Use with nouns like 'evidence', 'argument', 'story', 'reason', or 'need'.",
      quiz_question: "There is no _______ reason to reject their commercial proposal.",
      quiz_answer: "compelling"
    },
    {
      word: "hypothetical",
      arabic_translation: "افتراضي",
      ipa: "/ˌhaɪ.pəˈθet.ɪ.kəl/",
      level: "B2",
      definition: "Based on an imagined situation or theory rather than facts or reality.",
      example_sentence: "Let us discuss a hypothetical scenario where carbon emissions are zero.",
      usage_tip: "Derived from 'hypothesis'. Often used in science, math, or debating contexts.",
      quiz_question: "This is a purely _______ question; it has no real-world implications.",
      quiz_answer: "hypothetical"
    }
  ],
  C1: [
    {
      word: "eloquent",
      arabic_translation: "بليغ / فصيح",
      ipa: "/ˈel.ə.kwənt/",
      level: "C1",
      definition: "Giving a clear, strong, and fluent message through beautiful expression.",
      example_sentence: "She delivered an eloquent speech that moved the entire audience to tears.",
      usage_tip: "Commonly describes writers, speakers, speeches, or prose style.",
      quiz_question: "He is a highly _______ advocate for environmental sustainability.",
      quiz_answer: "eloquent"
    },
    {
      word: "tenuous",
      arabic_translation: "ضعيف / واهن",
      ipa: "/ˈten.ju.əs/",
      level: "C1",
      definition: "Weak, thin, or easily broken; showing a very weak connection.",
      example_sentence: "The correlation between the two variables was tenuous at best.",
      usage_tip: "Often collocates with 'link', 'grip', 'connection', 'hold', or 'relationship'.",
      quiz_question: "His argument relies on a highly _______ assumption about human behavior.",
      quiz_answer: "tenuous"
    },
    {
      word: "pragmatic",
      arabic_translation: "عملي / واقعي",
      ipa: "/præɡˈmæt.ɪk/",
      level: "C1",
      definition: "Solving problems in a sensible, practical way rather than following strict theories.",
      example_sentence: "We need a pragmatic approach to solve this complex budget crisis.",
      usage_tip: "Antonym of 'idealistic'. Noun form is 'pragmatism'.",
      quiz_question: "She took a highly _______ decision to cut costs instead of expanding.",
      quiz_answer: "pragmatic"
    },
    {
      word: "cognitive",
      arabic_translation: "إدراكي / معرفي",
      ipa: "/ˈkɒɡ.nɪ.tɪv/",
      level: "C1",
      definition: "Connected with thinking, knowing, remembering, and mental processing.",
      example_sentence: "Regular puzzle training helps preserve cognitive functions in seniors.",
      usage_tip: "Often collocates with 'load', 'dissonance', 'development', or 'psychology'.",
      quiz_question: "Too much information can increase the user's _______ load.",
      quiz_answer: "cognitive"
    },
    {
      word: "mitigate",
      arabic_translation: "يخفف / يلطف",
      ipa: "/ˈmɪt.ɪ.ɡeɪt/",
      level: "C1",
      definition: "To make something less harmful, severe, serious, or painful.",
      example_sentence: "We must implement safety filters to mitigate the security risks.",
      usage_tip: "Often collocates with 'risks', 'damage', 'effects', 'impact', or 'losses'.",
      quiz_question: "What measures can we take to _______ the negative impacts of inflation?",
      quiz_answer: "mitigate"
    },
    {
      word: "advocate",
      arabic_translation: "يدافع عن / يناصر",
      ipa: "/ˈæd.və.keɪt/",
      level: "C1",
      definition: "To publicly recommend, support, or defend a particular policy or idea.",
      example_sentence: "Our organization advocates for equal educational rights globally.",
      usage_tip: "Can be a verb (pron. /ˈædvəkeɪt/) or a noun (pron. /ˈædvəkət/).",
      quiz_question: "We do not _______ using aggressive tactics in this negotiation.",
      quiz_answer: "advocate"
    }
  ],
  C2: [
    {
      word: "ephemeral",
      arabic_translation: "سريع الزوال / عابر",
      ipa: "/ɪˈfem.ər.əl/",
      level: "C2",
      definition: "Lasting for only a very short time; transient or short-lived.",
      example_sentence: "Fame in the digital age is highly ephemeral, fading in weeks.",
      usage_tip: "A literary word often paired with abstract concepts like 'beauty', 'joy', or 'existence'.",
      quiz_question: "The artistic installation was _______, designed to decompose in a week.",
      quiz_answer: "ephemeral"
    },
    {
      word: "paradigm",
      arabic_translation: "نموذج / فكر سائد",
      ipa: "/ˈpær.ə.daɪm/",
      level: "C2",
      definition: "A typical model, pattern, or outstanding example of something.",
      example_sentence: "Quantum physics triggered a massive paradigm shift in modern science.",
      usage_tip: "Most commonly used in the phrase 'paradigm shift' (a fundamental change in approach).",
      quiz_question: "The internet caused a total _______ shift in how we exchange knowledge.",
      quiz_answer: "paradigm"
    },
    {
      word: "quintessential",
      arabic_translation: "جوهري / نموذجي تماماً",
      ipa: "/ˌkwɪn.tɪˈsen.ʃəl/",
      level: "C2",
      definition: "Being the most perfect, classic, or typical example of a quality or class.",
      example_sentence: "Sitting by the fireplace with hot cocoa is the quintessential winter experience.",
      usage_tip: "Derived from 'quintessence' (the absolute essence of a substance).",
      quiz_question: "He is the _______ English gentleman, always polite and reserved.",
      quiz_answer: "quintessential"
    },
    {
      word: "cacophony",
      arabic_translation: "تنافر أصوات / ضوضاء",
      ipa: "/kəˈkɒf.ə.ni/",
      level: "C2",
      definition: "An unpleasant mixture of loud, harsh, discordant sounds.",
      example_sentence: "A loud cacophony of car horns and construction noise filled the street.",
      usage_tip: "The adjective form is 'cacophonous'. It is the antonym of 'euphony'.",
      quiz_question: "As the concert gates opened, a _______ of cheering erupted.",
      quiz_answer: "cacophony"
    },
    {
      word: "recalcitrant",
      arabic_translation: "عنيد / متمرد",
      ipa: "/rɪˈkæl.sɪ.trənt/",
      level: "C2",
      definition: "Unwilling to obey orders or be cooperative; fiercely resistant to authority.",
      example_sentence: "The manager had to deal with a recalcitrant employee who refused to comply.",
      usage_tip: "Formal, academic adjective describing stubborn, unmanageable behavior.",
      quiz_question: "No matter the incentive, the _______ subject refused to participate.",
      quiz_answer: "recalcitrant"
    },
    {
      word: "surreptitious",
      arabic_translation: "خفي / سري خاطف",
      ipa: "/ˌsʌr.əpˈtɪʃ.əs/",
      level: "C2",
      definition: "Done secretly, stealthily, or quickly, to avoid being noticed.",
      example_sentence: "She took a surreptitious glance at her phone during the quiet meeting.",
      usage_tip: "Finer nuance than 'secretive'. Suggests physical stealth or keeping eyes down.",
      quiz_question: "Through a _______ transaction, he acquired control of the shares.",
      quiz_answer: "surreptitious"
    }
  ]
};

export const FALLBACK_QUESTIONS: Record<CEFRLevel, Record<SkillType, CEFRQuestion>> = {
  A0: {
    Grammar: {
      cefr_level: "A0",
      skill_type: "Grammar",
      can_do_statement: "Can recognize and use basic subject pronouns (I, you, he, she).",
      context_scenario: "Fatima is introducing herself to a classmate at the entrance of Fatima Academy.",
      question_text: "Fatima: \"Hello! My name is Fatima. ________ am from Cairo. What is your name?\"",
      options: {
        A: "He",
        B: "You",
        C: "I",
        D: "She"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C ('I') is correct because the speaker is introducing herself and referring to her own origin. Options A, B, and D refer to other subjects (third person male, second person, and third person female respectively) which do not fit the context."
    },
    Vocabulary: {
      cefr_level: "A0",
      skill_type: "Vocabulary",
      can_do_statement: "Can identify basic colors and numbers in everyday contexts.",
      context_scenario: "A student is looking at three apples on a desk in the classroom.",
      question_text: "Teacher: \"How many apples do you see on the table?\" \nStudent: \"I see ________ apples.\"",
      options: {
        A: "blue",
        B: "three",
        C: "apple",
        D: "yes"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B ('three') correctly answers the quantity question 'How many'. Option A is a color, Option C is the singular noun itself, and Option D is an affirmation, none of which answer the question."
    },
    Reading: {
      cefr_level: "A0",
      skill_type: "Reading",
      can_do_statement: "Can understand extremely short, simple signs and notices.",
      context_scenario: "You are standing outside the Fatima Academy main library doors.",
      question_text: "The large sign on the door says: \"OPEN from 9:00 AM to 5:00 PM.\" What does this mean?",
      options: {
        A: "The library is closed now.",
        B: "You can go inside the library.",
        C: "The library is only for teachers.",
        D: "There is no library."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct because the sign 'OPEN' indicates that entrance is permitted during those hours. Option A indicates closure, which contradicts 'OPEN'."
    },
    Listening: {
      cefr_level: "A0",
      skill_type: "Listening",
      can_do_statement: "Can recognize basic greetings and names in spoken language.",
      context_scenario: "A receptionist welcomes you in English.",
      question_text: "Receptionist: \"Welcome to Fatima Academy! Good morning.\" \nWhat is the receptionist doing?",
      options: {
        A: "Asking for money",
        B: "Saying hello politely",
        C: "Closing the school",
        D: "Singing a song"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct because 'Welcome' and 'Good morning' are polite, standard greeting phrases used to say hello. Options A, C, and D are unrelated actions."
    },
    Speaking: {
      cefr_level: "A0",
      skill_type: "Speaking",
      can_do_statement: "Can reply to simple greetings and questions about identity.",
      context_scenario: "Your teacher asks you your name on the first day.",
      question_text: "Teacher: \"Hello, what is your name?\" \nWhich is the most appropriate spoken response?",
      options: {
        A: "I am fine, thank you.",
        B: "My name is Yahia.",
        C: "The apple is red.",
        D: "Yes, please."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is the correct answer because it directly provides the speaker's name in response to 'what is your name'. Option A answers 'how are you', Option C is about an object, and Option D is a request acceptance."
    },
    Writing: {
      cefr_level: "A0",
      skill_type: "Writing",
      can_do_statement: "Can write extremely basic personal information on forms.",
      context_scenario: "You are filling in a contact form at the school reception desk.",
      question_text: "The form has a blank field labeled: \"FIRST NAME: ________\". What should you write?",
      options: {
        A: "Egypt",
        B: "Mohamed",
        C: "Student",
        D: "English"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B ('Mohamed') is correct because it is a personal first name. Option A is a country, Option C is a role/occupation, and Option D is a language."
    }
  },
  A1: {
    Grammar: {
      cefr_level: "A1",
      skill_type: "Grammar",
      can_do_statement: "Can use the verb 'to be' in the present simple with appropriate singular/plural agreement.",
      context_scenario: "Two students are speaking about their course instructor, Mr. Alan.",
      question_text: "Sarah: \"Mr. Alan is so supportive.\" \nDavid: \"Yes, he ________ a wonderful English teacher.\"",
      options: {
        A: "are",
        B: "is",
        C: "am",
        D: "be"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B ('is') is correct because the subject 'he' requires the singular third-person form of the verb 'to be'. Option A is for plural/second-person subjects, Option C is for first-person singular 'I', and Option D is the base form."
    },
    Vocabulary: {
      cefr_level: "A1",
      skill_type: "Vocabulary",
      can_do_statement: "Can use basic everyday vocabulary describing familiar objects and environments.",
      context_scenario: "You are looking for your textbook in a quiet classroom.",
      question_text: "A: \"Where is my book?\" \nB: \"Look! It is on your ________, next to your computer.\"",
      options: {
        A: "sky",
        B: "desk",
        C: "water",
        D: "apple"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B ('desk') is correct because a desk is a standard flat-topped piece of furniture where textbooks and computers are typically kept. Options A, C, and D are completely out of context."
    },
    Reading: {
      cefr_level: "A1",
      skill_type: "Reading",
      can_do_statement: "Can understand simple descriptions of people, including name, age, and country.",
      context_scenario: "You read a student profile on the Academy bulletin board.",
      question_text: "\"My classmate is John. He is 20 years old and he is from Canada. He likes football.\" \nWhere is John from?",
      options: {
        A: "Football",
        B: "Canada",
        C: "London",
        D: "Classmate"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct as the text explicitly states 'he is from Canada'. Option A is a sport, Option C is not mentioned, and Option D is his relationship."
    },
    Listening: {
      cefr_level: "A1",
      skill_type: "Listening",
      can_do_statement: "Can understand simple directions on how to get from X to Y, slow and clear.",
      context_scenario: "You ask the receptionist where the cafeteria is.",
      question_text: "Receptionist: \"Go straight and turn left at the door.\" \nWhere should you turn?",
      options: {
        A: "Right at the window",
        B: "Left at the door",
        C: "Go up the stairs",
        D: "Nowhere"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B matches the receptionist's spoken instructions 'turn left at the door' precisely. Options A, C, and D are incorrect."
    },
    Speaking: {
      cefr_level: "A1",
      skill_type: "Speaking",
      can_do_statement: "Can make simple introductions and share basic personal facts.",
      context_scenario: "Introducing your friend from France.",
      question_text: "What is the most natural way to introduce your friend in English?",
      options: {
        A: "This is my friend Pierre. He is from France.",
        B: "Pierre is a country in France.",
        C: "Goodbye Pierre from France.",
        D: "What is Pierre doing?"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A is a standard, polite A1 formula for introducing another person and describing where they are from. Options B, C, and D are grammatically incorrect or illogical."
    },
    Writing: {
      cefr_level: "A1",
      skill_type: "Writing",
      can_do_statement: "Can write a very short, simple postcard or email greeting.",
      context_scenario: "Writing a brief email to your English tutor.",
      question_text: "Complete the email: \"Dear Mr. Alan, ________. See you tomorrow. Best regards, Fatima.\"",
      options: {
        A: "I cannot come to class today because I am sick",
        B: "Who are you?",
        C: "English is a language on the earth",
        D: "Dear sir, thank you for the payment"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A is correct because it provides a standard, logical message to a tutor before the class. Options B, C, and D are either impolite, irrelevant, or grammatically out of place."
    }
  },
  A2: {
    Grammar: {
      cefr_level: "A2",
      skill_type: "Grammar",
      can_do_statement: "Can use regular and common irregular verbs in the past simple tense.",
      context_scenario: "John is telling his friend about his weekend trip to Alexandria.",
      question_text: "John: \"We had a wonderful weekend. We ________ to the beach and swam in the sea.\"",
      options: {
        A: "go",
        B: "went",
        C: "gone",
        D: "goes"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B ('went') is correct because the context refers to a completed past event ('had a wonderful weekend', 'swam in the sea'). Option A is present, Option C requires an auxiliary verb (e.g. 'had gone'), and Option D is third-person present."
    },
    Vocabulary: {
      cefr_level: "A2",
      skill_type: "Vocabulary",
      can_do_statement: "Can use vocabulary related to local travel, booking, and transport.",
      context_scenario: "A tourist is checking in at the train station ticket counter.",
      question_text: "Agent: \"Do you want a single ticket, or a ________ ticket so you can travel back?\"",
      options: {
        A: "luggage",
        B: "passenger",
        C: "return",
        D: "receipt"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C ('return') is correct because a 'return ticket' (or round-trip) allows you to travel back to your starting location. Option A refers to bags, Option B refers to the traveler, and Option D is the paper invoice."
    },
    Reading: {
      cefr_level: "A2",
      skill_type: "Reading",
      can_do_statement: "Can find specific, predictable information in simple daily materials like timetables or advertisements.",
      context_scenario: "Reading a flight display board.",
      question_text: "\"Flight MS 776 to Cairo is delayed by 45 minutes due to fog. New departure: 11:30 AM.\" \nWhy is the flight delayed?",
      options: {
        A: "Because of bad weather (fog)",
        B: "Because of a strike",
        C: "Because of maintenance",
        D: "Because the airport is closed"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A is correct because the announcement explicitly cites 'due to fog' which constitutes bad weather. The other reasons are completely unmentioned."
    },
    Listening: {
      cefr_level: "A2",
      skill_type: "Listening",
      can_do_statement: "Can catch the main point in short, clear, simple messages and announcements.",
      context_scenario: "Listening to a supermarket announcement.",
      question_text: "\"Attention customers: The store will close in 10 minutes. Please bring your items to the cashier.\" \nWhat should you do?",
      options: {
        A: "Leave your trolley and walk out",
        B: "Pay for your items now",
        C: "Start shopping for more items",
        D: "Call security"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct because the announcement states that closure is imminent and customers should bring items to the cashiers, meaning they must pay. The other options contradict the instruction."
    },
    Speaking: {
      cefr_level: "A2",
      skill_type: "Speaking",
      can_do_statement: "Can handle short social exchanges and ask/answer simple questions.",
      context_scenario: "Inviting a colleague for a coffee break.",
      question_text: "What is the most polite and natural way to suggest a coffee break?",
      options: {
        A: "You must drink coffee with me now.",
        B: "Would you like to get a cup of coffee with me?",
        C: "Give me some coffee please.",
        D: "I drink coffee every single day."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is the standard polite invitation formula ('Would you like to...'). Option A is too authoritative, Option C is an order, and Option D is just a fact."
    },
    Writing: {
      cefr_level: "A2",
      skill_type: "Writing",
      can_do_statement: "Can write short, simple notes and messages relating to matters in areas of immediate need.",
      context_scenario: "Leaving a note for your flatmate about grocery shopping.",
      question_text: "Complete the note: \"Hi Alex, I went to the store. We have no milk, so I ________. See you soon!\"",
      options: {
        A: "am going to buy some",
        B: "drank all of it",
        C: "bought a new television",
        D: "will sleep in the living room"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A is grammatically and logically consistent with 'We have no milk, so I went to the store'. Options B, C, and D are illogical transitions."
    }
  },
  B1: {
    Grammar: {
      cefr_level: "B1",
      skill_type: "Grammar",
      can_do_statement: "Can choose correctly between the Present Perfect and Past Simple to describe experiences versus historical events.",
      context_scenario: "Laura is interviewing a job candidate about their professional travel history.",
      question_text: "Laura: \"Your CV says you are fluent in Spanish. Have you ever lived in Spain?\" \nCandidate: \"Yes, I ________ in Barcelona for two years when I was a student.\"",
      options: {
        A: "have lived",
        B: "lived",
        C: "was living",
        D: "had lived"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B ('lived') is correct because the action occurred at a specific, completed time in the past ('when I was a student'). Present perfect (Option A) is incorrect because the time frame is finished and explicitly stated. Past continuous (Option C) and past perfect (Option D) are grammatically inappropriate."
    },
    Vocabulary: {
      cefr_level: "B1",
      skill_type: "Vocabulary",
      can_do_statement: "Can use high-utility collocations and phrasal verbs related to professional collaboration.",
      context_scenario: "Two project managers are finalizing their weekly agendas.",
      question_text: "Manager: \"We need to postpone the client demonstration because the software isn't ready. Let's ________ until next Thursday.\"",
      options: {
        A: "put it off",
        B: "take it off",
        C: "call it off",
        D: "set it up"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A ('put it off') is the correct phrasal verb meaning to postpone or delay an event. Option C ('call it off') means to cancel entirely, which contradicts 'until next Thursday'. Options B and D mean to remove or schedule/organize."
    },
    Reading: {
      cefr_level: "B1",
      skill_type: "Reading",
      can_do_statement: "Can understand the main points of clear standard input on familiar matters regularly encountered in work, school, or leisure.",
      context_scenario: "Reading an update from the Human Resources team.",
      question_text: "\"Fatima Academy now permits a hybrid working schedule, meaning employees must work from the office on Tuesdays and Thursdays, but can work remotely on the other three weekdays if approved.\" \nWhat is the core hybrid office rule?",
      options: {
        A: "Employees can work from home every single day.",
        B: "Employees must be physically present on Tuesdays and Thursdays.",
        C: "Working from home is banned completely.",
        D: "The office is closed on Thursdays."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct because the policy states 'employees must work from the office on Tuesdays and Thursdays'. Options A and C are too extreme, and Option D is incorrect."
    },
    Listening: {
      cefr_level: "B1",
      skill_type: "Listening",
      can_do_statement: "Can understand the main points of clear standard speech on familiar matters.",
      context_scenario: "Listening to a voicemail from a supplier.",
      question_text: "\"Hi, this is Mark from Logistics. Your order is ready, but we cannot ship it today because our delivery van is undergoing repair. It will leave our depot first thing tomorrow.\" \nWhat is the problem?",
      options: {
        A: "The order was cancelled.",
        B: "The delivery is delayed because of vehicle repair.",
        C: "The supplier lost the order details.",
        D: "The customer must pick up the items."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct as Mark explicitly cites 'delivery van is undergoing repair' and 'It will leave tomorrow', indicating a one-day delay. The other options are incorrect interpretations."
    },
    Speaking: {
      cefr_level: "B1",
      skill_type: "Speaking",
      can_do_statement: "Can connect phrases in a simple way in order to describe experiences and events, dreams, hopes, and ambitions.",
      context_scenario: "Sharing your plans for learning English.",
      question_text: "What is the most coherent way to express your motivation and future goal?",
      options: {
        A: "I learn English because it is nice and fun and okay.",
        B: "I am studying English at Fatima Academy in order to pass the IELTS exam and apply for a master's program abroad.",
        C: "English is studied by me. I pass exam soon.",
        D: "I want a master's degree so I speak English."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct because it uses B1-level discourse markers ('in order to', 'and') to connect reasons, goals, and actions in a logically cohesive sequence. Options A and C are grammatically simplistic or fragmented."
    },
    Writing: {
      cefr_level: "B1",
      skill_type: "Writing",
      can_do_statement: "Can write straightforward connected text on topics which are familiar or of personal interest.",
      context_scenario: "Writing a brief professional follow-up email.",
      question_text: "Complete the sentence: \"Thank you for your advice during our yesterday meeting. I have decided to ________ your recommendation and revise the slides.\"",
      options: {
        A: "follow",
        B: "dismiss",
        C: "refuse",
        D: "avoid"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A ('follow') is correct because it collocates perfectly with 'recommendation' and fits the helpful, collaborative context indicated by 'Thank you'. Options B, C, and D are antonyms that represent negative responses."
    }
  },
  B2: {
    Grammar: {
      cefr_level: "B2",
      skill_type: "Grammar",
      can_do_statement: "Can use the third conditional to express hypothetical past situations and regrets.",
      context_scenario: "Two project consultants are reviewing a failed business pitch.",
      question_text: "John: \"We lost the bid because our proposal was too vague.\" \nSarah: \"I agree. If we ________ more precise metrics, we might have secured the contract.\"",
      options: {
        A: "included",
        B: "would include",
        C: "had included",
        D: "were including"
      },
      correct_option: "C",
      pedagogical_explanation: "Option C ('had included') is correct because it represents the past perfect subjunctive required in the 'if-clause' of a third conditional sentence ('If + Past Perfect, would + have + Past Participle'). Options A, B, and D are grammatically incorrect in third conditional formulas."
    },
    Vocabulary: {
      cefr_level: "B2",
      skill_type: "Vocabulary",
      can_do_statement: "Can use precise idiomatic vocabulary and common collocations in business or academic environments.",
      context_scenario: "An executive is explaining why a decision is extremely urgent.",
      question_text: "Executive: \"We cannot afford to delay our entry into this new market; time is of the ________ and competitors are moving fast.\"",
      options: {
        A: "necessity",
        B: "essence",
        C: "priority",
        D: "importance"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B ('essence') is correct because 'time is of the essence' is a standard, highly idiomatic English idiom used to indicate that speed is critically important. Options A, C, and D are not part of this idiomatic collocation."
    },
    Reading: {
      cefr_level: "B2",
      skill_type: "Reading",
      can_do_statement: "Can read articles and reports concerned with contemporary problems in which the writers adopt particular attitudes or viewpoints.",
      context_scenario: "Reading an opinion article on corporate environmental policies.",
      question_text: "\"While many tech firms boast about carbon offsets, these measures often act as smoke screens for their increasing absolute emissions. Real progress requires structural changes to supply chains, not just green credentials.\" \nWhat is the writer's attitude towards carbon offsets?",
      options: {
        A: "Skeptical, viewing them as superficial solutions",
        B: "Highly enthusiastic and encouraging",
        C: "Completely neutral and objective",
        D: "Angry that companies do not purchase more of them"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A is correct because the writer describes offsets as 'smoke screens' (deceptions) and argues that they mask increasing emissions, indicating a highly skeptical, critical viewpoint. Options B and C contradict this critical tone."
    },
    Listening: {
      cefr_level: "B2",
      skill_type: "Listening",
      can_do_statement: "Can understand standard spoken language, live or broadcast, on both familiar and unfamiliar topics.",
      context_scenario: "Listening to a podcast interview with an urban planner.",
      question_text: "\"The integration of smart grids is not merely an option for reducing city electricity costs; rather, it represents the foundational infrastructure required to support the upcoming transition to universal electric vehicle usage.\" \nAccording to the speaker, what is the primary role of smart grids?",
      options: {
        A: "To make electric vehicles cheaper to buy",
        B: "To serve as necessary infrastructure for electric vehicles",
        C: "To replace human power engineers",
        D: "To slow down city development"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct because the speaker states that smart grids are 'the foundational infrastructure required to support the upcoming transition to universal electric vehicle usage'. Option A is about purchase cost, which is not mentioned."
    },
    Speaking: {
      cefr_level: "B2",
      skill_type: "Speaking",
      can_do_statement: "Can present clear, detailed descriptions on a wide range of subjects, and explain a viewpoint on a topical issue.",
      context_scenario: "Presenting your opinion on artificial intelligence in universities.",
      question_text: "What is the most structured and persuasive way to present your viewpoint?",
      options: {
        A: "AI in schools is bad. Students cheat. We should stop it because cheating is wrong.",
        B: "While AI tools offer unprecedented support for literature synthesis and personalized learning, they simultaneously threaten academic integrity. Consequently, universities should establish clear boundaries rather than implement outright bans.",
        C: "I think AI is good. I use it every day to write my essays and save time.",
        D: "Many people disagree on AI, but overall, it is changing the entire world very fast."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct because it presents a balanced, structured perspective using complex concession structures ('While... simultaneously') and cohesive transitions ('Consequently', 'rather than'). Options A and C are too simplistic and subjective."
    },
    Writing: {
      cefr_level: "B2",
      skill_type: "Writing",
      can_do_statement: "Can write an essay or report, passing on information or giving reasons in support of or against a particular point of view.",
      context_scenario: "Drafting a summary report on customer loyalty trends.",
      question_text: "Complete the passage: \"Customer retention has improved by fifteen percent. This spike is ________ due to the launch of our new loyalty points system last quarter.\"",
      options: {
        A: "largely",
        B: "widely",
        C: "scarcely",
        D: "rarely"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A ('largely') is correct because it is used to indicate a primary cause or source in formal analytical writing. Option C ('scarcely') and Option D ('rarely') negate the link, and Option B does not collocate correctly here."
    }
  },
  C1: {
    Grammar: {
      cefr_level: "C1",
      skill_type: "Grammar",
      can_do_statement: "Can use negative inversion to create emphatic, formal assertions.",
      context_scenario: "An educational strategist is addressing a panel on pedagogical methodology.",
      question_text: "Strategist: \"________ have I witnessed such profound academic acceleration as we have seen with this dynamic adaptive learning engine.\"",
      options: {
        A: "Rarely",
        B: "No sooner",
        C: "Under no circumstances",
        D: "Only when"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A ('Rarely') is correct because it is a negative adverbial that perfectly triggers the inversion 'Rarely have I witnessed...' to express emphatic rarity. Option B triggers a sequence of events with 'than', Option C expresses a strict prohibition, and Option D requires a subordinate clause."
    },
    Vocabulary: {
      cefr_level: "C1",
      skill_type: "Vocabulary",
      can_do_statement: "Can use advanced literary vocabulary and precise academic collocations.",
      context_scenario: "A critic is evaluating the scientific validity of a controversial research paper.",
      question_text: "Critic: \"The author's primary thesis relies on a highly ________ connection between the two historical events, which lacks empirical proof.\"",
      options: {
        A: "tenuous",
        B: "eloquent",
        C: "pragmatic",
        D: "cognitive"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A ('tenuous') is correct because it means extremely weak or fragile, which fits the context of a connection that lacks empirical proof. Option B means fluent/expressive, Option C means practical, and Option D means mental/intellectual."
    },
    Reading: {
      cefr_level: "C1",
      skill_type: "Reading",
      can_do_statement: "Can understand long, complex technical or literary texts, appreciating distinctions of style.",
      context_scenario: "Reading an essay on algorithmic decision-making.",
      question_text: "\"The rise of automated profiling does not merely streamline administrative allocation; it surreptitiously recalibrates the parameters of equity. By encoding historical biases into mathematical models, these algorithms generate feedback loops that perpetuate systemic disadvantage.\" \nWhat is the author's primary warning about automated profiling?",
      options: {
        A: "It is inefficient and slow.",
        B: "It is expensive to maintain.",
        C: "It encodes historical biases and reinforces systemic inequality.",
        D: "It will replace human software engineers."
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct because the author explicitly warns that algorithms encode historical biases and generate loops that perpetuate systemic disadvantage. Options A, B, and D are not the focus of the warning."
    },
    Listening: {
      cefr_level: "C1",
      skill_type: "Listening",
      can_do_statement: "Can understand enough to follow a talk or lecture on abstract or complex topics.",
      context_scenario: "Listening to an economics lecture extract.",
      question_text: "\"The central bank's intervention was designed to inject liquidity into the banking sector, yet it had the unintended consequence of inflating asset values while wages remained largely stagnant, thus widening the wealth disparity.\" \nWhat was the unintended outcome of the bank's action?",
      options: {
        A: "Wages increased dramatically.",
        B: "Asset values inflated while wages remained stagnant.",
        C: "The bank lost all its reserves.",
        D: "The entire banking sector collapsed."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct because the lecturer states the intervention inflated asset values while wages remained largely stagnant. Option A is the opposite of stagnant wages, and C and D are unmentioned extremes."
    },
    Speaking: {
      cefr_level: "C1",
      skill_type: "Speaking",
      can_do_statement: "Can express ideas fluently and spontaneously, almost effortlessly.",
      context_scenario: "Explaining how companies should tackle remote worker burnout.",
      question_text: "Which spoken response represents C1 fluency, structure, and lexical depth?",
      options: {
        A: "Companies must stop work at five PM. People are tired. Burnout is a big problem in offices.",
        B: "To mitigate employee burnout, corporate leadership must implement systemic guardrails, such as institutionalizing asynchronous communication channels, rather than placing the burden of self-care on individual employees.",
        C: "If people burn out, they leave. That is bad for business and costs a lot of money to hire new staff.",
        D: "I think managers should talk to staff and tell them to relax on weekends."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct because it uses highly precise, formal vocabulary ('mitigate', 'systemic guardrails', 'asynchronous') and complex syntax ('such as...', 'rather than...') to articulate a sophisticated perspective. The other options are linguistically simple."
    },
    Writing: {
      cefr_level: "C1",
      skill_type: "Writing",
      can_do_statement: "Can write clear, well-structured texts of complex subjects, underlining the relevant salient issues.",
      context_scenario: "Drafting an academic abstract.",
      question_text: "Complete the thesis statement: \"This study explores the cognitive mechanisms of bilingualism, ________ the neurological benefits of early language acquisition.\"",
      options: {
        A: "thereby highlighting",
        B: "which highlighting",
        C: "although highlighting",
        D: "whereas highlighting"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A ('thereby highlighting') is correct because 'thereby + participle' is a sophisticated C1 structure showing cause and consequence in formal writing. Option B is ungrammatical, and Option C and D indicate concession or contrast."
    }
  },
  C2: {
    Grammar: {
      cefr_level: "C2",
      skill_type: "Grammar",
      can_do_statement: "Can use inversion structures triggered by limiting conditionals to articulate absolute precise constraints.",
      context_scenario: "A Senior Legal Counsel is delivering a compliance warning.",
      question_text: "Counsel: \"Only on the condition that the board submits a fully audited financial disclosure, ________ we proceed with the merger negotiations.\"",
      options: {
        A: "should",
        B: "will",
        C: "did",
        D: "would"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B ('will') is correct because 'Only on the condition that... will we...' is a highly formal limiting conditional inversion that asserts a strict constraint in the future. 'Should' (Option A) and 'would' (Option D) do not match the real-world declarative tone, and 'did' (Option C) refers to the past."
    },
    Vocabulary: {
      cefr_level: "C2",
      skill_type: "Vocabulary",
      can_do_statement: "Can use ultra-advanced, rare idiomatic usage and literary collocations with absolute precision.",
      context_scenario: "An art critic is discussing the temporary nature of sand sculptures.",
      question_text: "Critic: \"The beauty of these masterfully carved sand sculptures is essentially ________; the tides will soon reclaim them.\"",
      options: {
        A: "ephemeral",
        B: "quintessential",
        C: "cacophonous",
        D: "recalcitrant"
      },
      correct_option: "A",
      pedagogical_explanation: "Option A ('ephemeral') is correct because it means short-lived, transient, or lasting for only a very brief moment, which matches 'the tides will soon reclaim them'. Option B means prototypical, Option C means harsh-sounding, and Option D means rebellious."
    },
    Reading: {
      cefr_level: "C2",
      skill_type: "Reading",
      can_do_statement: "Can read with ease virtually all forms of the written language, including abstract, structurally or linguistically complex texts.",
      context_scenario: "Reading a philosophical treatise on modern technology.",
      question_text: "\"The quintessence of hyper-connectivity lies not in its utility, but in its surreptitious colonization of solitude. By commodifying attention, modern digital architectures have hollowed out the contemplative spaces necessary for autonomous self-constitution, reducing consciousness to a sequence of reactive impulses.\" \nWhat is the core philosophical critique of hyper-connectivity?",
      options: {
        A: "It makes communication more expensive.",
        B: "It is slow to adopt in developing areas.",
        C: "It encroaches upon solitude and undermines independent self-constitution.",
        D: "It makes people more intelligent."
      },
      correct_option: "C",
      pedagogical_explanation: "Option C is correct because the text critiques technology for its 'surreptitious colonization of solitude' and argues that it hollows out spaces 'necessary for autonomous self-constitution'. The other options miss this deep philosophical point entirely."
    },
    Listening: {
      cefr_level: "C2",
      skill_type: "Listening",
      can_do_statement: "Can understand any kind of spoken language, whether live or recorded, even when delivered at fast native speed.",
      context_scenario: "Listening to a debate on game theory in climate policy.",
      question_text: "\"While multilateral climate treaties represent the quintessential cooperative paradigm, their actual execution is perpetually vulnerable to the free-rider defect, whereby sovereign entities surreptitiously maximize domestic production while enjoying global mitigation efforts.\" \nWhat is the 'free-rider defect' described by the speaker?",
      options: {
        A: "Countries offering free transport for citizens.",
        B: "Sovereign nations quietly maximizing domestic output while benefiting from others' climate efforts.",
        C: "Sovereign nations refusing to attend international climate summits.",
        D: "A defect in electric vehicle battery systems."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B is correct because the speaker defines the free-rider defect as 'whereby sovereign entities surreptitiously maximize domestic production while enjoying global mitigation efforts'. Options A, C, and D are complete misinterpretations."
    },
    Speaking: {
      cefr_level: "C2",
      skill_type: "Speaking",
      can_do_statement: "Can formulate thoughts and deliver complex ideas with absolute clarity, fluency, and rhetorical precision.",
      context_scenario: "Providing a deep critique of standard language testing.",
      question_text: "Which response demonstrates absolute C2 mastery, rhetorical precision, and native-level flow?",
      options: {
        A: "Language tests are too simple. They only test grammar and not how we speak in real life. We need to change tests to be better.",
        B: "Standardized testing often reduces language proficiency to a sterile, binary rubric. To truly capture communicative competence, we must look beyond clinical accuracy and evaluate the nuanced, sociolinguistic adaptations that speakers employ in real-time.",
        C: "I don't like tests because they make me stressed and do not show how smart I am in English.",
        D: "Many people think tests are the best way to see your level, but they are wrong because tests are boring."
      },
      correct_option: "B",
      pedagogical_explanation: "Option B demonstrates absolute C2 rhetorical control, sophisticated vocabulary ('sterile, binary rubric', 'clinical accuracy', 'sociolinguistic adaptations'), and fluent native-like flow. The other options are simple or subjective."
    },
    Writing: {
      cefr_level: "C2",
      skill_type: "Writing",
      can_do_statement: "Can write clear, smoothly flowing, complex texts in an appropriate and effective style and a logical structure.",
      context_scenario: "Composing an editorial paragraph on leadership styles.",
      question_text: "Complete the editorial passage: \"True leadership is not marked by authoritarian mandate, but by the ________ capacity to cultivate shared purpose, thereby rendering obedience organic rather than coerced.\"",
      options: {
        A: "surreptitious",
        B: "subtle",
        C: "cacophonous",
        D: "recalcitrant"
      },
      correct_option: "B",
      pedagogical_explanation: "Option B ('subtle') is correct because a 'subtle capacity' perfectly contrasts with 'authoritarian mandate' to describe a nuanced, quiet style of leadership that makes obedience organic. Options A, C, and D are negative or structurally incoherent."
    }
  }
};
