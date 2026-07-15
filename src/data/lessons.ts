export interface AudioLesson {
  id: string;
  title: string;
  arabicTitle: string;
  level: string; // A0, A1, A2, B1, B2, C1, C2
  category: string;
  description: string;
  arabicDescription: string;
  durationEstimate: string;
  sentences: string[];
  arabicTranslations: string[];
  vocabList?: Array<{ word: string; meaning: string; arabicMeaning: string; phonetic: string }>;
}

export const CEFR_LESSONS: AudioLesson[] = [
  // A0 Starter
  {
    id: "a0-lesson-1",
    title: "Simple Greetings & Names",
    arabicTitle: "التحيات البسيطة والأسماء",
    level: "A0",
    category: "Speaking & Greetings",
    description: "Learn how to introduce yourself and welcome others in professional settings.",
    arabicDescription: "تعلم كيفية تقديم نفسك والترحيب بالآخرين في بيئات العمل أو الحياة اليومية.",
    durationEstimate: "2 mins",
    sentences: [
      "Hello! My name is Dr. Lexis.",
      "What is your name?",
      "Nice to meet you.",
      "I am a teacher.",
      "Welcome to Fatima Academy."
    ],
    arabicTranslations: [
      "مرحباً! اسمي الدكتور ليكسيس.",
      "ما هو اسمك؟",
      "سررت بلقائك.",
      "أنا معلم.",
      "مرحباً بك في أكاديمية فاطمة."
    ],
    vocabList: [
      { word: "Hello", meaning: "Used as a greeting or to begin a conversation", arabicMeaning: "مرحباً", phonetic: "/həˈloʊ/" },
      { word: "Name", meaning: "A word by which a person or thing is known", arabicMeaning: "اسم", phonetic: "/neɪm/" },
      { word: "Meet", meaning: "To come into the presence or company of someone", arabicMeaning: "يقابل / يلتقي", phonetic: "/miːt/" }
    ]
  },
  {
    id: "a0-lesson-2",
    title: "Numbers & Basic Colors",
    arabicTitle: "الأرقام والألوان الأساسية",
    level: "A0",
    category: "Vocabulary Basics",
    description: "Master simple cardinal numbers and core everyday physical descriptions.",
    arabicDescription: "أتقن الأرقام الفردية البسيطة والأوصاف المادية الأساسية للأشياء من حولك.",
    durationEstimate: "2 mins",
    sentences: [
      "Let us learn simple numbers.",
      "One, two, three, four, five.",
      "The sky is blue.",
      "The apple is red.",
      "This is a yellow sun."
    ],
    arabicTranslations: [
      "فلنتعلم الأرقام البسيطة.",
      "واحد، اثنان، ثلاثة، أربعة، خمسة.",
      "السماء زرقاء.",
      "التفاحة حمراء.",
      "هذه شمس صفراء."
    ],
    vocabList: [
      { word: "Numbers", meaning: "Arithmetical values representing a particular quantity", arabicMeaning: "أرقام", phonetic: "/ˈnʌmbərz/" },
      { word: "Sky", meaning: "The region of the atmosphere visible from the earth", arabicMeaning: "سماء", phonetic: "/skaɪ/" },
      { word: "Red", meaning: "The color of ripe cherries or blood", arabicMeaning: "أحمر", phonetic: "/rɛd/" }
    ]
  },
  {
    id: "a0-lesson-3",
    title: "Common Classroom Objects",
    arabicTitle: "أدوات الصف الشائعة",
    level: "A0",
    category: "Vocabulary Basics",
    description: "Learn the names of objects found in schools, academies, and classrooms.",
    arabicDescription: "تعرف على أسماء الأشياء والأدوات الموجودة في المدارس والأكاديميات والصفوف الدراسية.",
    durationEstimate: "2 mins",
    sentences: [
      "This is a pen.",
      "That is a big book.",
      "The pencil is on the table.",
      "Please sit on the chair.",
      "Open your notebook."
    ],
    arabicTranslations: [
      "هذا قلم حبر.",
      "ذلك كتاب كبير.",
      "قلم الرصاص على الطاولة.",
      "الرجاء الجلوس على الكرسي.",
      "افتح دفتر ملاحظاتك."
    ],
    vocabList: [
      { word: "Pen", meaning: "An instrument for writing or drawing with ink", arabicMeaning: "قلم", phonetic: "/pɛn/" },
      { word: "Book", meaning: "A written or printed work consisting of pages bound together", arabicMeaning: "كتاب", phonetic: "/bʊk/" },
      { word: "Chair", meaning: "A separate seat for one person, typically with a back and four legs", arabicMeaning: "كرسي", phonetic: "/tʃɛər/" }
    ]
  },
  {
    id: "a0-lesson-4",
    title: "Days of the Week & Simple Time",
    arabicTitle: "أيام الأسبوع والوقت البسيط",
    level: "A0",
    category: "Everyday Vocabulary",
    description: "Understand the names of days and simple time divisions like morning and night.",
    arabicDescription: "فهم أسماء أيام الأسبوع وتقسيمات الوقت البسيطة مثل الصباح والمساء.",
    durationEstimate: "2 mins",
    sentences: [
      "Today is Monday.",
      "Tomorrow is Tuesday.",
      "I study English in the morning.",
      "I sleep at night.",
      "The weekend is happy."
    ],
    arabicTranslations: [
      "اليوم هو الإثنين.",
      "غداً هو الثلاثاء.",
      "أنا أدرس الإنجليزية في الصباح.",
      "أنا أنام في الليل.",
      "عطلة نهاية الأسبوع سعيدة."
    ],
    vocabList: [
      { word: "Today", meaning: "On or during this present day", arabicMeaning: "اليوم", phonetic: "/təˈdeɪ/" },
      { word: "Morning", meaning: "The period of time between midnight and noon", arabicMeaning: "الصباح", phonetic: "/ˈmɔːrnɪŋ/" },
      { word: "Night", meaning: "The period of darkness in each twenty-four hours", arabicMeaning: "الليل", phonetic: "/naɪt/" }
    ]
  },
  {
    id: "a0-lesson-5",
    title: "Basic Family Members",
    arabicTitle: "أفراد العائلة الأساسيون",
    level: "A0",
    category: "Speaking & Greetings",
    description: "Learn the core family relations words to start talking about your home.",
    arabicDescription: "تعلم الكلمات الأساسية الخاصة بالعلاقات العائلية للبدء في التحدث عن منزلك.",
    durationEstimate: "2 mins",
    sentences: [
      "This is my father.",
      "This is my mother.",
      "I love my brother.",
      "My sister is small.",
      "We are a happy family."
    ],
    arabicTranslations: [
      "هذا والدي.",
      "هذه والدتي.",
      "أنا أحب أخي.",
      "أختي صغيرة.",
      "نحن عائلة سعيدة."
    ],
    vocabList: [
      { word: "Father", meaning: "A male parent", arabicMeaning: "أب", phonetic: "/ˈfɑːðər/" },
      { word: "Mother", meaning: "A female parent", arabicMeaning: "أم", phonetic: "/ˈmʌðər/" },
      { word: "Family", meaning: "A group of parents and children living together", arabicMeaning: "عائلة", phonetic: "/ˈfæməli/" }
    ]
  },

  // A1 Beginner
  {
    id: "a1-lesson-1",
    title: "Introducing Yourself & Family",
    arabicTitle: "التعريف بالنفس والعائلة",
    level: "A1",
    category: "Social Dialogues",
    description: "Share simple biographical details about where you live and your immediate family members.",
    arabicDescription: "مشاركة تفاصيل بيوغرافية بسيطة حول مكان سكنك وأفراد عائلتك المقربين.",
    durationEstimate: "3 mins",
    sentences: [
      "Good morning, everyone.",
      "I live in London with my family.",
      "I have a brother and a sister.",
      "We like to read books together.",
      "What about you?"
    ],
    arabicTranslations: [
      "صباح الخير للجميع.",
      "أنا أعيش في لندن مع عائلتي.",
      "لدي أخ وأخت.",
      "نحن نحب قراءة الكتب معاً.",
      "ماذا عنك؟"
    ],
    vocabList: [
      { word: "Live", meaning: "To make one's home in a particular place", arabicMeaning: "يعيش / يسكن", phonetic: "/lɪv/" },
      { word: "Family", meaning: "A group of one or more parents and their children", arabicMeaning: "عائلة", phonetic: "/ˈfæməli/" },
      { word: "Together", meaning: "With or in proximity to another person or people", arabicMeaning: "معاً / سوياً", phonetic: "/təˈɡɛðər/" }
    ]
  },
  {
    id: "a1-lesson-2",
    title: "Talking About the Weather",
    arabicTitle: "الحديث عن حالة الطقس",
    level: "A1",
    category: "Everyday Phrases",
    description: "Describe daily atmospheric conditions and carry out casual small talk.",
    arabicDescription: "وصف الظروف الجوية اليومية وإجراء أحاديث ودية قصيرة وبسيطة.",
    durationEstimate: "3 mins",
    sentences: [
      "It is a very beautiful day today.",
      "Is it hot or cold outside?",
      "The sun is shining brightly.",
      "I think it will rain later.",
      "Don't forget your umbrella."
    ],
    arabicTranslations: [
      "إنه يوم جميل جداً اليوم.",
      "هل الجو حار أم بارد في الخارج؟",
      "الشمس تشرق بسطوع.",
      "أعتقد أنها ستمطر لاحقاً.",
      "لا تنسى مظلتك."
    ],
    vocabList: [
      { word: "Weather", meaning: "The state of the atmosphere at a place and time", arabicMeaning: "طقس / جو", phonetic: "/ˈwɛðər/" },
      { word: "Shining", meaning: "Giving out or reflecting bright light", arabicMeaning: "تشرق / يسطع", phonetic: "/ˈʃaɪnɪŋ/" },
      { word: "Umbrella", meaning: "A folding canopy on a central rod used for protection against rain", arabicMeaning: "مظلة / شمسية", phonetic: "/ʌmˈbrɛlə/" }
    ]
  },
  {
    id: "a1-lesson-3",
    title: "Daily Routines & Habits",
    arabicTitle: "الروتين والأنشطة اليومية",
    level: "A1",
    category: "Everyday Phrases",
    description: "Describe what you do every day from waking up to going to sleep.",
    arabicDescription: "صف الأنشطة والأعمال التي تقوم بها يومياً من الاستيقاظ وحتى النوم.",
    durationEstimate: "3 mins",
    sentences: [
      "I wake up early at six o'clock.",
      "First, I brush my teeth and wash my face.",
      "Then, I drink hot coffee and eat breakfast.",
      "I catch the bus to go to work.",
      "I return home and relax in the evening."
    ],
    arabicTranslations: [
      "أستيقاظ باكراً في الساعة السادسة تماماً.",
      "أولاً، أنظف أسناني وأغسل وجهي.",
      "ثم، أشرب قهوة ساخنة وأتناول وجبة الإفطار.",
      "أستقل الحافلة للذهاب إلى العمل.",
      "أعود إلى المنزل وأسترخي في المساء."
    ],
    vocabList: [
      { word: "Wake up", meaning: "To emerge or cause to emerge from sleep", arabicMeaning: "يستيقظ", phonetic: "/weɪk ʌp/" },
      { word: "Breakfast", meaning: "The first meal of the day", arabicMeaning: "فطور", phonetic: "/ˈbrɛkfəst/" },
      { word: "Relax", meaning: "Make or become less tense or anxious", arabicMeaning: "يسترخي", phonetic: "/rɪˈlæks/" }
    ]
  },
  {
    id: "a1-lesson-4",
    title: "Describing Clothes & Shopping",
    arabicTitle: "وصف الملابس والتسوق",
    level: "A1",
    category: "Everyday Phrases",
    description: "Learn how to talk about clothing items and purchase them at a local store.",
    arabicDescription: "تعلم كيفية التحدث عن الملابس وشرائها من المتاجر المحلية.",
    durationEstimate: "3 mins",
    sentences: [
      "I want to buy a new blue shirt.",
      "How much does this warm jacket cost?",
      "It costs twenty dollars.",
      "Do you have these shoes in size eight?",
      "Yes, here is a black pair to try."
    ],
    arabicTranslations: [
      "أريد شراء قميص أزرق جديد.",
      "كم تبلغ تكلفة هذه السترة الدافئة؟",
      "تكلف عشرين دولاراً.",
      "هل لديكم هذه الأحذية بمقاس ثمانية؟",
      "نعم، إليك زوج أسود لتجربته."
    ],
    vocabList: [
      { word: "Buy", meaning: "Obtain in exchange for payment", arabicMeaning: "يشتري", phonetic: "/baɪ/" },
      { word: "Jacket", meaning: "An outer garment extending to the waist or hips", arabicMeaning: "سترة / جاكيت", phonetic: "/ˈdʒækɪt/" },
      { word: "Size", meaning: "The relative extent of something; a dimensions rating", arabicMeaning: "مقاس", phonetic: "/saɪz/" }
    ]
  },
  {
    id: "a1-lesson-5",
    title: "Foods & Likes/Dislikes",
    arabicTitle: "الأطعمة وما نحبه وما لا نحبه",
    level: "A1",
    category: "Social Dialogues",
    description: "Express your preferences regarding different meals, foods, and fruits.",
    arabicDescription: "عبّر عن تفضيلاتك فيما يتعلق بالوجبات والأطعمة والفواكه المختلفة.",
    durationEstimate: "3 mins",
    sentences: [
      "What is your favorite food?",
      "I love grilled chicken and fresh salad.",
      "I do not like spicy peppers very much.",
      "My sister prefers sweet apple pie.",
      "We always enjoy a delicious dinner together."
    ],
    arabicTranslations: [
      "ما هو طعامك المفضل؟",
      "أنا أحب الدجاج المشوي والسلطة الطازجة.",
      "أنا لا أحب الفلفل الحار كثيراً.",
      "شقيقتي تفضل فطيرة التفاح الحلوة.",
      "نحن دائماً نستمتع بعشاء لذيذ معاً."
    ],
    vocabList: [
      { word: "Favorite", meaning: "Preferred before all others of the same kind", arabicMeaning: "مفضل", phonetic: "/ˈfeɪvərɪt/" },
      { word: "Salad", meaning: "A cold dish of various mixtures of raw or cooked vegetables", arabicMeaning: "سلطة", phonetic: "/ˈsæləd/" },
      { word: "Dinner", meaning: "The main meal of the day, taken either around midday or in the evening", arabicMeaning: "عشاء", phonetic: "/ˈdɪnər/" }
    ]
  },

  // A2 Elementary
  {
    id: "a2-lesson-1",
    title: "Ordering Food at a Cafe",
    arabicTitle: "طلب الطعام في المقهى",
    level: "A2",
    category: "Functional Service Dialogues",
    description: "Interact with servers, make polite orders, and clarify preferences elegantly.",
    arabicDescription: "التفاعل مع النادل، تقديم طلبات مهذبة، وتوضيح تفضيلاتك من المأكولات والمشروبات.",
    durationEstimate: "3 mins",
    sentences: [
      "Welcome to our cafe. Are you ready to order?",
      "Yes, please. I would like a hot cup of coffee.",
      "Would you prefer milk or sugar with that?",
      "Just a little milk, please.",
      "And I will also take a fresh chocolate croissant.",
      "Excellent choice. That will be five dollars."
    ],
    arabicTranslations: [
      "مرحباً بكم في مقهانا. هل أنت مستعد للطلب؟",
      "نعم، من فضلك. أود كوباً من القهوة الساخنة.",
      "هل تفضل الحليب أو السكر مع ذلك؟",
      "قليل من الحليب فقط، من فضلك.",
      "وسآخذ أيضاً كرواسون الشوكولاتة الطازج.",
      "اختيار ممتاز. سيكون الحساب خمسة دولارات."
    ],
    vocabList: [
      { word: "Order", meaning: "To request something to be made, supplied, or served", arabicMeaning: "يطلب (في مطعم)", phonetic: "/ˈɔːrdər/" },
      { word: "Prefer", meaning: "To like one thing or path better than another", arabicMeaning: "يفضل", phonetic: "/prɪˈfɜːr/" },
      { word: "Choice", meaning: "An act of selecting or making a decision when faced with possibilities", arabicMeaning: "خيار / انتقاء", phonetic: "/tʃɔɪs/" }
    ]
  },
  {
    id: "a2-lesson-2",
    title: "Describing Your Weekend",
    arabicTitle: "وصف عطلة نهاية الأسبوع",
    level: "A2",
    category: "Narrative & Past Tenses",
    description: "Use basic simple past tense verbs to outline leisure activities and share feedback.",
    arabicDescription: "استخدام أفعال الماضي البسيط لوصف الأنشطة الترفيهية ومشاركة المشاعر الإيجابية.",
    durationEstimate: "3 mins",
    sentences: [
      "Last weekend, I visited a beautiful museum in the city.",
      "The paintings were absolutely fantastic.",
      "Afterwards, I met my friends for a delicious lunch.",
      "We talked about our work and plans.",
      "It was a very relaxing and happy weekend."
    ],
    arabicTranslations: [
      "في نهاية الأسبوع الماضي، زرت متحفاً جميلاً في المدينة.",
      "كانت اللوحات رائعة للغاية.",
      "بعد ذلك، التقيت بأصدقائي لتناول غداء لذيذ.",
      "تحدثنا عن عملنا وخططنا.",
      "لقد كانت عطلة نهاية أسبوع مريحة وسعيدة للغاية."
    ],
    vocabList: [
      { word: "Visited", meaning: "Went to see and spend time with a person or place", arabicMeaning: "زار", phonetic: "/ˈvɪzɪtɪd/" },
      { word: "Paintings", meaning: "Pictures or designs executed in paints or colors", arabicMeaning: "لوحات فنية", phonetic: "/ˈpeɪntɪŋz/" },
      { word: "Relaxing", meaning: "Reducing tension or anxiety; restful", arabicMeaning: "مريح / مهدئ", phonetic: "/rɪˈlæksɪŋ/" }
    ]
  },
  {
    id: "a2-lesson-3",
    title: "Talking about Hobbies & Free Time",
    arabicTitle: "التحدث عن الهوايات وقت الفراغ",
    level: "A2",
    category: "Narrative & Present Habits",
    description: "Discuss how you spend your free time and share details about hobbies you enjoy.",
    arabicDescription: "ناقش كيف تقضي وقت فراغك وشارك تفاصيل حول الهوايات التي تستمتع بها.",
    durationEstimate: "3 mins",
    sentences: [
      "In my free time, I really enjoy playing football.",
      "I also like listening to classical music while reading.",
      "My friend plays the guitar very well.",
      "How often do you go hiking in the mountains?",
      "I try to go at least once a month."
    ],
    arabicTranslations: [
      "في وقت فراغي، أستمتع حقاً بلعب كرة القدم.",
      "أحب أيضاً الاستماع إلى الموسيقى الكلاسيكية أثناء القراءة.",
      "صديقي يعزف على الغيتار بشكل جيد للغاية.",
      "كم مرة تذهب للمشي والتنزه في الجبال؟",
      "أحاول الذهاب مرة واحدة على الأقل في الشهر."
    ],
    vocabList: [
      { word: "Hobbies", meaning: "Activities done regularly in one's leisure time for pleasure", arabicMeaning: "هوايات", phonetic: "/ˈhɒbiz/" },
      { word: "Guitar", meaning: "A stringed musical instrument, with six or twelve strings", arabicMeaning: "قيثارة / غيتار", phonetic: "/ɡɪˈtɑːr/" },
      { word: "Hiking", meaning: "The activity of going for long walks, especially in the country or woods", arabicMeaning: "المشي الجبلي / التنزه", phonetic: "/ˈhaɪkɪŋ/" }
    ]
  },
  {
    id: "a2-lesson-4",
    title: "Directions & Getting Around",
    arabicTitle: "الاتجاهات والتنقل",
    level: "A2",
    category: "Functional Service Dialogues",
    description: "Learn how to ask for and give basic directions to key landmarks in a city.",
    arabicDescription: "تعلم كيفية السؤال عن الاتجاهات وإعطاء إرشادات بسيطة للوصول للمعالم الأساسية في المدينة.",
    durationEstimate: "3 mins",
    sentences: [
      "Excuse me, is there a pharmacy near here?",
      "Yes, walk straight and turn left at the next corner.",
      "Is the train station far from this street?",
      "No, it is only a five-minute walk from here.",
      "Thank you so much for your kind help!"
    ],
    arabicTranslations: [
      "معذرة، هل توجد صيدلية بالقرب من هنا؟",
      "نعم، سر بشكل مستقيم ثم انعطف يساراً عند الزاوية القادمة.",
      "هل محطة القطار بعيدة عن هذا الشارع؟",
      "لا، إنها على بعد خمس دقائق فقط سيراً على الأقدام من هنا.",
      "شكراً جزيلاً لك على مساعدتك اللطيفة!"
    ],
    vocabList: [
      { word: "Pharmacy", meaning: "A store where medicinal drugs are dispensed and sold", arabicMeaning: "صيدلية", phonetic: "/ˈfɑːrməsi/" },
      { word: "Corner", meaning: "A place where two streets, sides, or edges meet", arabicMeaning: "زاوية / منعطف", phonetic: "/ˈkɔːrnər/" },
      { word: "Far", meaning: "At, to, or by a great distance", arabicMeaning: "بعيد", phonetic: "/fɑːr/" }
    ]
  },
  {
    id: "a2-lesson-5",
    title: "Standard Workplace Tasks",
    arabicTitle: "مهام العمل المعتادة",
    level: "A2",
    category: "Everyday Phrases",
    description: "Describe daily tasks, basic office duties, and work routines to colleagues.",
    arabicDescription: "وصف المهام اليومية، والواجبات المكتبية الأساسية، وروتين العمل لزملائك.",
    durationEstimate: "3 mins",
    sentences: [
      "I work in a quiet office in Cairo.",
      "Every morning, I answer emails and check my calendar.",
      "We have a short team meeting at nine thirty.",
      "I write weekly reports for my manager.",
      "I enjoy collaborating with my professional colleagues."
    ],
    arabicTranslations: [
      "أنا أعمل في مكتب هادئ في القاهرة.",
      "كل صباح، أجيب على رسائل البريد الإلكتروني وأتحقق من تقويمي.",
      "لدينا اجتماع فريق قصير في الساعة التاسعة والنصف.",
      "أكتب تقارير أسبوعية لمديري في العمل.",
      "أستمتع بالتعاون مع زملائي المهنيين."
    ],
    vocabList: [
      { word: "Office", meaning: "A room or department where professional duties are carried out", arabicMeaning: "مكتب", phonetic: "/ˈɒfɪs/" },
      { word: "Meeting", meaning: "An assembly of people for discussion or planning", arabicMeaning: "اجتماع", phonetic: "/ˈmiːtɪŋ/" },
      { word: "Reports", meaning: "Spoken or written accounts of something observed or investigated", arabicMeaning: "تقارير", phonetic: "/rɪˈpɔːrts/" }
    ]
  },

  // B1 Intermediate
  {
    id: "b1-lesson-1",
    title: "Asking for Clarification & Directions",
    arabicTitle: "طلب التوضيح والاتجاهات",
    level: "B1",
    category: "Survival Skills",
    description: "Learn how to ask for help on public streets and request double-checks on instructions.",
    arabicDescription: "تعلم كيفية طلب المساعدة في الشوارع العامة وطلب تأكيد التعليمات أو الاتجاهات.",
    durationEstimate: "4 mins",
    sentences: [
      "Excuse me, I seem to be completely lost.",
      "Could you please tell me how to reach the nearest subway station?",
      "Of course! Just walk straight down this street for two blocks.",
      "Then, turn right at the traffic lights.",
      "Thank you. Did you say right or left at the lights?",
      "You should turn right. It will be directly on your left hand side."
    ],
    arabicTranslations: [
      "عذراً، يبدو أنني تائه تماماً.",
      "هل يمكنك إخباري بكيفية الوصول إلى أقرب محطة مترو أنفاق؟",
      "بالتأكيد! فقط سر بشكل مستقيم في هذا الشارع لكتلتين سكنيتين.",
      "ثم، انعطف يميناً عند الإشارات الضوئية.",
      "شكراً لك. هل قلت يميناً أم يساراً عند الإشارات؟",
      "يجب أن تنعطف يميناً. ستكون مباشرة على جانبك الأيسر."
    ],
    vocabList: [
      { word: "Subway", meaning: "An underground electric railway system", arabicMeaning: "مترو الأنفاق", phonetic: "/ˈsʌbweɪ/" },
      { word: "Straight", meaning: "Without a curve or bend in a direct course", arabicMeaning: "بشكل مستقيم", phonetic: "/streɪt/" },
      { word: "Directly", meaning: "With nothing or no one between; immediately", arabicMeaning: "مباشرة", phonetic: "/dəˈrɛktli/" }
    ]
  },
  {
    id: "b1-lesson-2",
    title: "Making Travel Plans",
    arabicTitle: "وضع خطط السفر",
    level: "B1",
    category: "Planning & Coherence",
    description: "Discuss forward logistics, bookings, schedules, and draft simple travel itineraries.",
    arabicDescription: "مناقشة ترتيبات السفر المستقبلية، الحجوزات، المواعيد، وكتابة خطة يومية بسيطة.",
    durationEstimate: "3 mins",
    sentences: [
      "I am planning a trip to Kyoto next month.",
      "I really want to experience the traditional temples and gardens.",
      "Should I book my accommodation in advance?",
      "Yes, definitely. Hotels get fully booked very quickly during spring.",
      "I will also buy a travel guide to plan my daily itinerary."
    ],
    arabicTranslations: [
      "أنا أخطط لرحلة إلى كيوتو الشهر المقبل.",
      "أريد حقاً تجربة المعابد والحدائق التقليدية.",
      "هل يجب علي حجز مكان الإقامة مسبقاً؟",
      "نعم، بالتأكيد. الفنادق تحجز بالكامل بسرعة كبيرة خلال فصل الربيع.",
      "سأشتري أيضاً دليل سفر لتخطيط مسار رحلتي اليومي."
    ],
    vocabList: [
      { word: "Planning", meaning: "The process of making plans for something future", arabicMeaning: "تخطيط", phonetic: "/ˈplænɪŋ/" },
      { word: "Accommodation", meaning: "A room or building in which someone may live or stay", arabicMeaning: "مكان الإقامة", phonetic: "/əˌkɑːməˈdeɪʃn/" },
      { word: "Itinerary", meaning: "A planned route or journey details", arabicMeaning: "مسار الرحلة", phonetic: "/aɪˈtɪnəreri/" }
    ]
  },
  {
    id: "b1-lesson-3",
    title: "Health, Fitness & Doctors",
    arabicTitle: "الصحة والياقة البدنية والطبابة",
    level: "B1",
    category: "Survival Skills",
    description: "Describe physical symptoms, understand doctor's advice, and discuss fitness habits.",
    arabicDescription: "تعلم وصف الأعراض الجسدية، وفهم نصائح الطبيب، ومناقشة عادات اللياقة البدنية والرياضية.",
    durationEstimate: "4 mins",
    sentences: [
      "I have been suffering from a severe headache since yesterday morning.",
      "You should make an appointment to consult with a general practitioner.",
      "The doctor prescribed some pain relievers and suggested taking full rest.",
      "In addition, regular exercise can significantly improve your blood circulation.",
      "I will try to eat a balanced diet and stay hydrated."
    ],
    arabicTranslations: [
      "لقد كنت أعاني من صداع شديد منذ صباح أمس.",
      "يجب عليك تحديد موعد للتشاور مع طبيب ممارس عام.",
      "وصف الطبيب بعض مسكنات الألم واقترح أخذ قسط كامل من الراحة.",
      "بالإضافة إلى ذلك، يمكن أن يؤدي التمرين المنتظم إلى تحسين الدورة الدموية بشكل كبير.",
      "سأحاول تناول نظام غذائي متوازن والحفاظ على رطوبة جسمي بشرب الماء."
    ],
    vocabList: [
      { word: "Symptom", meaning: "A physical or mental feature indicating a condition of disease", arabicMeaning: "عَرَض / علامة مرضية", phonetic: "/ˈsɪmptəm/" },
      { word: "Prescribed", meaning: "Advised and authorized the use of a medicine or treatment", arabicMeaning: "وصف (علاجاً)", phonetic: "/prɪˈskraɪbd/" },
      { word: "Hydrated", meaning: "Cause to absorb water; supplied with sufficient fluids", arabicMeaning: "مرطب / مروي بالماء", phonetic: "/ˈhaɪdreɪtɪd/" }
    ]
  },
  {
    id: "b1-lesson-4",
    title: "Presenting Ideas at a Team Meeting",
    arabicTitle: "تقديم الأفكار في اجتماع الفريق",
    level: "B1",
    category: "Planning & Coherence",
    description: "Propose solutions, discuss project milestones, and coordinate tasks with coworkers.",
    arabicDescription: "اقتراح الحلول، مناقشة معالم المشروع الأساسية، وتنسيق المهام المشتركة مع زملائك في العمل.",
    durationEstimate: "4 mins",
    sentences: [
      "First of all, thank you all for attending this emergency planning meeting.",
      "I would like to suggest launching our new software trial next week.",
      "This strategy will allow us to gather essential feedback from early users.",
      "Then, we can address any technical errors before the official launch date.",
      "What do you think about this potential timeline?"
    ],
    arabicTranslations: [
      "بادئ ذي بدء، أشكركم جميعاً على حضور هذا الاجتماع التخطيطي الطارئ.",
      "أود أن أقترح إطلاق النسخة التجريبية لبرنامجنا الجديد الأسبوع المقبل.",
      "ستتيح لنا هذه الاستراتيجية جمع التعليقات الأساسية من المستخدمين الأوائل.",
      "بعد ذلك، يمكننا معالجة أي أخطاء فنية قبل تاريخ الإطلاق الرسمي.",
      "ما رأيكم في هذا الجدول الزمني المحتمل؟"
    ],
    vocabList: [
      { word: "Attend", meaning: "Be present at an event, meeting, or function", arabicMeaning: "يحضر", phonetic: "/əˈtɛnd/" },
      { word: "Essential", meaning: "Absolutely necessary; extremely important", arabicMeaning: "أساسي / جوهري", phonetic: "/ɪˈsɛnʃl/" },
      { word: "Timeline", meaning: "A schedule of events or milestone dates", arabicMeaning: "جدول زمني", phonetic: "/ˈtaɪmlaɪn/" }
    ]
  },
  {
    id: "b1-lesson-5",
    title: "Sharing Life Experiences & Dreams",
    arabicTitle: "مشاركة تجارب الحياة والأحلام",
    level: "B1",
    category: "Planning & Coherence",
    description: "Talk about your past achievements, challenges overcome, and future aspirations.",
    arabicDescription: "تحدث عن إنجازاتك السابقة، والتحديات التي تغلبت عليها، وطموحاتك المستقبلية.",
    durationEstimate: "3 mins",
    sentences: [
      "I have always dreamed of traveling around the entire world.",
      "Two years ago, I overcame my fear of swimming in deep water.",
      "That rewarding experience taught me that resilience leads to personal growth.",
      "In the future, I hope to open my own small business.",
      "With hard work and patience, any dream can become a reality."
    ],
    arabicTranslations: [
      "لقد حلمت دائماً بالسفر حول العالم بأسره.",
      "قبل عامين، تغلبت على خوفي من السباحة في المياه العميقة.",
      "علمتني تلك التجربة المجزية أن المرونة تؤدي إلى النمو الشخصي.",
      "في المستقبل، آمل أن أفتح مشروعي التجاري الصغير الخاص.",
      "بالعمل الجاد والصبر، يمكن لأي حلم أن يصبح حقيقة واقعة."
    ],
    vocabList: [
      { word: "Overcame", meaning: "Succeeded in dealing with a problem or difficulty", arabicMeaning: "تغلّب على", phonetic: "/ˌoʊvərˈkeɪm/" },
      { word: "Resilience", meaning: "The capacity to recover quickly from difficulties", arabicMeaning: "مرونة / قدرة التكيف", phonetic: "/rɪˈzɪliəns/" },
      { word: "Aspirations", meaning: "Hopes or ambitions of achieving something important", arabicMeaning: "طموحات / تطلعات", phonetic: "/ˌæspəˈreɪʃnz/" }
    ]
  },

  // B2 Upper-Intermediate
  {
    id: "b2-lesson-1",
    title: "Expressing Opinions on Climate Change",
    arabicTitle: "التعبير عن الآراء حول تغير المناخ",
    level: "B2",
    category: "Academic Smalltalk & Debate",
    description: "Formulate persuasive arguments, transition terms, and discuss planetary challenges.",
    arabicDescription: "صياغة حجج مقنعة واستخدام مصطلحات انتقالية لمناقشة التحديات الكوكبية الكبرى.",
    durationEstimate: "4 mins",
    sentences: [
      "In my opinion, climate change is the most urgent challenge of our century.",
      "Governments must implement stricter regulations on industrial carbon emissions.",
      "Furthermore, transition to renewable energy sources is no longer optional.",
      "Individual actions, such as recycling, are helpful but insufficient.",
      "We require massive systemic transformations to protect our planet's future."
    ],
    arabicTranslations: [
      "في رأيي، تغير المناخ هو التحدي الأكثر إلحاحاً في قرننا هذا.",
      "يجب على الحكومات فرض لوائح أكثر صرامة على انبعاثات الكربون الصناعية.",
      "علاوة على ذلك، فإن الانتقال إلى مصادر الطاقة المتجددة لم يعد اختيارياً.",
      "الإجراءات الفردية، مثل إعادة التدوير، مفيدة ولكنها غير كافية.",
      "نحن بحاجة إلى تحولات نظامية هائلة لحماية مستقبل كوكبنا."
    ],
    vocabList: [
      { word: "Urgent", meaning: "Requiring immediate action or attention", arabicMeaning: "عاجل / ملح", phonetic: "/ˈɜːrdʒənt/" },
      { word: "Furthermore", meaning: "In addition; besides (used to introduce a fresh point)", arabicMeaning: "علاوة على ذلك", phonetic: "/ˌfɜːrðərˈmɔːr/" },
      { word: "Systemic", meaning: "Relating to a system as a whole, rather than individual parts", arabicMeaning: "نظامي / هيكلي", phonetic: "/sɪˈstɛmɪk/" }
    ]
  },
  {
    id: "b2-lesson-2",
    title: "Job Interview Strategies",
    arabicTitle: "استراتيجيات مقابلات العمل",
    level: "B2",
    category: "Professional Development",
    description: "Synthesize corporate background details, highlight personal achievements, and build professional rapport.",
    arabicDescription: "تلخيص تفاصيل خلفيتك المهنية، تسليط الضوء على إنجازاتك، وبناء علاقة مهنية واثقة.",
    durationEstimate: "4 mins",
    sentences: [
      "When preparing for an interview, it is crucial to research the company's core values.",
      "Make sure to align your personal achievements with their long-term vision.",
      "During the discussion, present clear evidence of your problem-solving abilities.",
      "Do not hesitate to ask insightful questions about their work culture.",
      "Following up with a polite thank-you email shows professionalism and enthusiasm."
    ],
    arabicTranslations: [
      "عند التحضير للمقابلة، من الأهمية بمكان البحث في القيم الأساسية للشركة.",
      "تأكد من مواءمة إنجازاتك الشخصية مع رؤيتهم طويلة المدى.",
      "خلال المناقشة، قدم أدلة واضحة على قدراتك في حل المشكلات.",
      "لا تتردد في طرح أسئلة ثاقبة حول ثقافة العمل لديهم.",
      "المتابعة بريد الكتروني مهذب للشكر تظهر الاحترافية والحماس."
    ],
    vocabList: [
      { word: "Crucial", meaning: "Of great importance; decisive or critical", arabicMeaning: "حاسم / غاية في الأهمية", phonetic: "/ˈkruːʃl/" },
      { word: "Align", meaning: "Place or arrange in a straight line or close agreement", arabicMeaning: "يوازي / ينسجم مع", phonetic: "/əˈlaɪn/" },
      { word: "Insightful", meaning: "Showing a clear and deep understanding of complicated situations", arabicMeaning: "ثاقب / ذو بصيرة", phonetic: "/ˈɪnsaɪtfl/" }
    ]
  },
  {
    id: "b2-lesson-3",
    title: "Negotiating Salaries & Deals",
    arabicTitle: "التفاوض على الرواتب والصفقات",
    level: "B2",
    category: "Professional Development",
    description: "Formulate polite counter-offers and express professional value during negotiations.",
    arabicDescription: "صياغة عروض مضادة مهذبة والتعبير عن قيمتك المهنية بوضوح خلال جولات التفاوض.",
    durationEstimate: "4 mins",
    sentences: [
      "Thank you for this competitive offer; however, I would like to discuss the base salary.",
      "Given my extensive experience and track record, I was hoping for a slightly higher figure.",
      "Would it be possible to adjust the salary to align with standard industry benchmarks?",
      "In addition to remuneration, I am keen to discuss career development opportunities.",
      "I am confident that we can reach a mutually beneficial agreement today."
    ],
    arabicTranslations: [
      "شكراً لك على هذا العرض التنافسي؛ ومع ذلك، أود مناقشة الراتب الأساسي.",
      "نظراً لخبرتي الواسعة وسجلي الحافل، كنت آمل في الحصول على رقم أعلى قليلاً.",
      "هل من الممكن تعديل الراتب ليتماشى مع المعايير القياسية للقطاع؟",
      "بالإضافة إلى الأجر، أنا حريص على مناقشة فرص التطوير المهني.",
      "أنا واثق من أنه يمكننا التوصل إلى اتفاق متبادل المنفعة اليوم."
    ],
    vocabList: [
      { word: "Negotiation", meaning: "Discussion aimed at reaching an agreement", arabicMeaning: "تفاوض", phonetic: "/nɪˌɡoʊʃiˈeɪʃn/" },
      { word: "Benchmarks", meaning: "Standard points of reference against which things may be compared", arabicMeaning: "معايير مرجعية", phonetic: "/ˈbɛntʃmɑːrks/" },
      { word: "Remuneration", meaning: "Money paid for work or a service; salary and benefits", arabicMeaning: "أجر / مكافأة", phonetic: "/rɪˌmjuːnəˈreɪʃn/" }
    ]
  },
  {
    id: "b2-lesson-4",
    title: "Explaining Technology & Innovation",
    arabicTitle: "شرح التكنولوجيا والابتكار",
    level: "B2",
    category: "Academic Smalltalk & Debate",
    description: "Discuss how modern technical developments and automation affect our society.",
    arabicDescription: "ناقش كيف تؤثر التطورات التقنية الحديثة والأتمتة والذكاء الاصطناعي على مجتمعنا الحالي.",
    durationEstimate: "4 mins",
    sentences: [
      "The rapid rise of artificial intelligence has revolutionized multiple traditional industries.",
      "Many experts argue that automation will create new high-value jobs while displacing others.",
      "However, we must proactively address severe data privacy and cybersecurity threats.",
      "Continuous learning is essential to adapt to these ongoing technological shifts.",
      "Ultimately, technology should serve as an amplifier for human creativity and welfare."
    ],
    arabicTranslations: [
      "أدى الصعود السريع للذكاء الاصطناعي إلى إحداث ثورة في العديد من الصناعات التقليدية.",
      "يجادل العديد من الخبراء بأن الأتمتة ستخلق وظائف جديدة ذات قيمة عالية بينما تحل محل وظائف أخرى.",
      "ومع ذلك، يجب علينا معالجة التهديدات الشديدة لخصوصية البيانات والأمن السيبراني بشكل استباقي.",
      "التعلم المستمر ضروري للتكيف مع هذه التحولات التكنولوجية المستمرة.",
      "في نهاية المطاف، يجب أن تخدم التكنولوجيا كمضخم للإبداع والرفاهية البشرية."
    ],
    vocabList: [
      { word: "Automation", meaning: "The use of automatic equipment in manufacturing or services", arabicMeaning: "أتمتة / تشغيل آلي", phonetic: "/ˌɔːtəˈmeɪʃn/" },
      { word: "Displacing", meaning: "Taking over the place, role, or position of someone or something", arabicMeaning: "إزاحة / إحلال محل", phonetic: "/dɪsˈpleɪsɪŋ/" },
      { word: "Amplifier", meaning: "A thing that increases the strength or impact of something", arabicMeaning: "مضخم / معزز", phonetic: "/ˈæmplɪfaɪər/" }
    ]
  },
  {
    id: "b2-lesson-5",
    title: "Reading & Debating Current Events",
    arabicTitle: "قراءة ومناقشة الأحداث الجارية",
    level: "B2",
    category: "Academic Smalltalk & Debate",
    description: "Analyze headlines, identify media bias, and deliberate on political and economic news.",
    arabicDescription: "تحليل العناوين الرئيسية، وتحديد الانحياز الإعلامي، والتداول في الأخبار السياسية والاقتصادية.",
    durationEstimate: "4 mins",
    sentences: [
      "It is increasingly difficult to find objective news in today's polarized media landscape.",
      "A critical reader must cross-examine multiple independent sources to verify claims.",
      "Furthermore, economic indicators suggest that global trade routes are currently shifting.",
      "These changes could potentially trigger localized inflation in key consumer goods.",
      "We need to foster healthy public debates that prioritize scientific facts over emotional rhetoric."
    ],
    arabicTranslations: [
      "من الصعب بشكل متزايد العثور على أخبار موضوعية في المشهد الإعلامي المستقطب اليوم.",
      "يجب على القارئ الناقد استجواب ومقارنة مصادر مستقلة متعددة للتحقق من الادعاءات.",
      "علاوة على ذلك، تشير المؤشرات الاقتصادية إلى أن مسارات التجارة العالمية تتحول حالياً.",
      "قد تؤدي هذه التغييرات إلى إثارة تضخم محلي في السلع الاستهلاكية الأساسية.",
      "نحن بحاجة إلى رعاية نقاشات عامة صحية تعطي الأولوية للحقائق العلمية على البلاغة العاطفية."
    ],
    vocabList: [
      { word: "Polarized", meaning: "Divided into sharply contrasting groups or sets of opinions", arabicMeaning: "مستقطب", phonetic: "/ˈpoʊləraɪzd/" },
      { word: "Cross-examine", meaning: "Question closely and critically to check reliability", arabicMeaning: "يفحص بدقة / يستجوب مصادر مختلفة", phonetic: "/ˌkrɔːs ɪɡˈzæmɪn/" },
      { word: "Inflation", meaning: "A general increase in prices and fall in the purchasing value of money", arabicMeaning: "تضخم مالي", phonetic: "/ɪnˈfleɪʃn/" }
    ]
  },

  // C1 Advanced
  {
    id: "c1-lesson-1",
    title: "Business Presentation Pitching",
    arabicTitle: "تقديم العروض الترويجية للأعمال",
    level: "C1",
    category: "Corporate Leadership",
    description: "Learn high-level emphasis tools, cleft structures, and deliver compelling market forecasts.",
    arabicDescription: "تعلم أدوات التأكيد المتقدمة، الجمل المجزأة، وتقديم توقعات السوق والنمو بشكل مقنع.",
    durationEstimate: "4 mins",
    sentences: [
      "To capture your audience's attention, you must begin with a compelling narrative.",
      "What concerns our clients is the scalability of our software architecture.",
      "Consequently, we have engineered a highly versatile framework to mitigate latency.",
      "This innovative approach allows us to outpace our key competitors by tenfold.",
      "Let us now delve deeper into the fiscal projections for the upcoming quarter."
    ],
    arabicTranslations: [
      "لجذب انتباه جمهورك، يجب أن تبدأ بسرد قصصي مقنع.",
      "ما يثير قلق عملائنا هو قابلية التوسع لبنية برمجياتنا.",
      "بناءً على ذلك، قمنا بهندسة إطار عمل متعدد الاستخدامات للغاية لتقليل زمن الاستجابة.",
      "يتيح لنا هذا النهج المبتكر التفوق على منافسينا الرئيسيين بمقدار عشرة أضعاف.",
      "دعونا الآن نتعمق أكثر في التوقعات المالية للربع القادم."
    ],
    vocabList: [
      { word: "Compelling", meaning: "Evoking interest, attention, or admiration in a powerful way", arabicMeaning: "مقنع / جذاب جداً", phonetic: "/kəmˈpɛlɪŋ/" },
      { word: "Scalability", meaning: "The capacity to be changed in size or scale to meet growing needs", arabicMeaning: "قابليّة التوسع والنمو", phonetic: "/ˌskeɪləˈbɪləti/" },
      { word: "Consequently", meaning: "As a result; therefore", arabicMeaning: "بناء على ذلك / بالتالي", phonetic: "/ˈkɑːnsəkwɛntli/" }
    ]
  },
  {
    id: "c1-lesson-2",
    title: "Advanced Academic Writing Nuances",
    arabicTitle: "فروق الكتابة الأكاديمية المتقدمة",
    level: "C1",
    category: "Academic Grammar",
    description: "Understand inversion, precise conditional hypotheses, and maintain balanced scientific skepticism.",
    arabicDescription: "فهم صيغ الانعكاس النحوي، الفرضيات الشرطية الدقيقة، والحفاظ على الشك العلمي المتوازن.",
    durationEstimate: "4 mins",
    sentences: [
      "Hardly had the scientific community accepted the theory when new anomalies arose.",
      "It is imperative that researchers acknowledge the inherent limitations of their datasets.",
      "Such findings, although remarkable, do not conclusively validate the initial hypothesis.",
      "We must approach these speculative outcomes with a high degree of skepticism.",
      "Only by conducting rigorous double-blind studies can we establish a definitive causal link."
    ],
    arabicTranslations: [
      "لم يكد المجتمع العلمي يقبل النظرية حتى ظهرت شذوذات جديدة.",
      "من الضروري أن يدرك الباحثون القيود المتأصلة في مجموعات البيانات الخاصة بهم.",
      "مثل هذه النتائج، على الرغم من كونها لافتة للنظر، لا تثبت بشكل قاطع الفرضية الأولية.",
      "يجب أن نتعامل مع هذه النتائج التخمينية بدرجة عالية من الشك.",
      "فقط من خلال إجراء دراسات صارمة مزدوجة التعمية يمكننا إقامة صلة سببية حاسمة."
    ],
    vocabList: [
      { word: "Anomalies", meaning: "Something that deviates from what is standard, normal, or expected", arabicMeaning: "ظواهر شاذة / شذوذات", phonetic: "/əˈnɑːməliz/" },
      { word: "Speculative", meaning: "Based on conjecture or theory rather than absolute facts", arabicMeaning: "تخميني / غير مؤكد", phonetic: "/ˈspɛkjələtɪv/" },
      { word: "Rigorous", meaning: "Extremely thorough, exhaustive, or accurate", arabicMeaning: "صارم / دقيق للغاية", phonetic: "/ˈrɪɡərəs/" }
    ]
  },
  {
    id: "c1-lesson-3",
    title: "Conflict Resolution in Leadership",
    arabicTitle: "حل النزاعات في القيادة والإدارة",
    level: "C1",
    category: "Corporate Leadership",
    description: "Navigate interpersonal disputes, leverage diplomatic vocabulary, and align opposing corporate goals.",
    arabicDescription: "توجيه وحل الخلافات الشخصية والمهنية، واستثمار المفردات الدبلوماسية، ومواءمة الأهداف المؤسسية المتعارضة.",
    durationEstimate: "4 mins",
    sentences: [
      "As a leader, resolving deep systemic friction requires a combination of empathy and candor.",
      "We must avoid defensive postures and instead focus on establishing common ground.",
      "Let us systematically examine the underlying grievances without assigning premature blame.",
      "By implementing collaborative problem-solving frameworks, we can turn conflict into innovation.",
      "This cooperative path ensures that all stakeholders feel valued and aligned."
    ],
    arabicTranslations: [
      "كقائد، يتطلب حل الاحتكاك المنهجي العميق مزيجاً من التعاطف والصراحة.",
      "يجب أن نتجنب المواقف الدفاعية ونركز بدلاً من ذلك على إيجاد أرضية مشتركة.",
      "دعونا نفحص بشكل منهجي المظالم الكامنة دون إلقاء لوم متسرع.",
      "من خلال تطبيق أطر حل المشكلات التعاونية، يمكننا تحويل الصراع إلى ابتكار.",
      "هذا المسار التعاوني يضمن أن يشعر جميع أصحاب المصلحة بالتقدير والانسجام."
    ],
    vocabList: [
      { word: "Candor", meaning: "The quality of being open, sincere, and honest in expression", arabicMeaning: "صراحة / وضوح تام", phonetic: "/ˈkændər/" },
      { word: "Grievances", meaning: "Real or imagined wrongs or causes for complaint and protest", arabicMeaning: "مظالم / شكاوى", phonetic: "/ˈɡriːvənsɪz/" },
      { word: "Stakeholders", meaning: "People or groups with an interest or concern in something, especially a business", arabicMeaning: "أصحاب المصلحة / المعنيون", phonetic: "/ˈsteɪkhoʊldərz/" }
    ]
  },
  {
    id: "c1-lesson-4",
    title: "Masterclass in Public Speaking",
    arabicTitle: "حصة رئيسية في الخطابة العامة أمام الجمهور",
    level: "C1",
    category: "Corporate Leadership",
    description: "Harness rhetorical devices, vocal modulation, and robust body language for impactful delivery.",
    arabicDescription: "تسخير الأساليب البلاغية والتحكم بالنبرة الصوتية لتقديم عروض مؤثرة وقوية أمام الجماهير الكبيرة.",
    durationEstimate: "4 mins",
    sentences: [
      "To truly captivate a large audience, you must master the art of deliberate pauses.",
      "Rhetorical questions can provoke critical thinking and build instant intellectual rapport.",
      "Varying your pitch and cadence prevents monotony and underscores your key messages.",
      "Ensure your open gestures reflect authenticity and absolute confidence on the stage.",
      "The ultimate objective is not merely to transmit information, but to inspire actionable change."
    ],
    arabicTranslations: [
      "لتأسر جمهوراً كبيراً حقاً، يجب أن تتقن فن التوقفات المتعمدة أثناء الكلام.",
      "الأسئلة البلاغية يمكن أن تثير التفكير النقدي وتبني علاقة فكرية فورية مع الجمهور.",
      "تنويع نبرة صوتك وإيقاعك يمنع الرتابة ويؤكد على رسائلك الرئيسية.",
      "تأكد من أن إيماءاتك المفتوحة تعكس الأصالة والثقة المطلقة على المسرح.",
      "الهدف النهائي ليس مجرد نقل المعلومات، بل إلهام التغيير القابل للتطبيق."
    ],
    vocabList: [
      { word: "Captivate", meaning: "Attract and hold the interest and attention of; charm", arabicMeaning: "يأسر / يفتن", phonetic: "/ˈkæptɪveɪt/" },
      { word: "Monotony", meaning: "Lack of variety and interest; a tedious sameness", arabicMeaning: "رتابة / ملل", phonetic: "/məˈnɒtəni/" },
      { word: "Authenticity", meaning: "The quality of being genuine, real, and trustworthy", arabicMeaning: "أصالة / موثوقية", phonetic: "/ˌɔːθɛnˈtɪsəti/" }
    ]
  },
  {
    id: "c1-lesson-5",
    title: "Complex Problem Solving & Strategy",
    arabicTitle: "حل المشكلات المعقدة والتخطيط الاستراتيجي",
    level: "C1",
    category: "Academic Grammar",
    description: "Structure complex logical reasoning, establish clear causality, and manage risks systematically.",
    arabicDescription: "هيكلة التفكير المنطقي المعقد، وتحديد العلاقات السببية الواضحة، وإدارة المخاطر بشكل منهجي.",
    durationEstimate: "4 mins",
    sentences: [
      "Before formulating a solution, we must conduct a comprehensive root-cause analysis.",
      "Any overlooked variable could potentially compromise the efficacy of our entire operation.",
      "Consequently, we have devised robust contingency plans to mitigate foreseeable risks.",
      "This strategic approach guarantees absolute operational continuity under turbulent market conditions.",
      "Let us now objectively evaluate the qualitative and quantitative metrics of this proposal."
    ],
    arabicTranslations: [
      "قبل صياغة الحل، يجب علينا إجراء تحليل شامل للأسباب الجذرية.",
      "أي متغير يتم التغاضي عنه قد يهدد فعالية عمليتنا بأكملها.",
      "وبناءً على ذلك، فقد وضعنا خطط طوارئ قوية للتخفيف من المخاطر التي يمكن التنبؤ بها.",
      "يضمن هذا النهج الاستراتيجي استمرارية تشغيلية مطلقة في ظل ظروف السوق المضطربة.",
      "دعونا الآن نقيم بموضوعية المقاييس النوعية والكمية لهذا الاقتراح."
    ],
    vocabList: [
      { word: "Efficacy", meaning: "The ability to produce a desired or intended result", arabicMeaning: "فعالية / نجاعة", phonetic: "/ˈɛfɪkəsi/" },
      { word: "Contingency", meaning: "A provision for an unforeseen event or circumstance", arabicMeaning: "طوارئ / احتمالات بديلة", phonetic: "/kənˈtɪndʒənsi/" },
      { word: "Quantitative", meaning: "Relating to, measuring, or measured by the quantity of something", arabicMeaning: "كمي", phonetic: "/ˈkwɑːntəteɪtɪv/" }
    ]
  },

  // C2 Mastery
  {
    id: "c2-lesson-1",
    title: "Philosophical Discourse on Ethics",
    arabicTitle: "الخطاب الفلسفي حول الأخلاق",
    level: "C2",
    category: "Philosophical Inquiry",
    description: "Engage in highly sophisticated social and political debates, referencing complex abstract frameworks.",
    arabicDescription: "الانخراط في نقاشات اجتماعية وسياسية بالغة التعقيد، مع الإشارة إلى أطر مجردة متطورة.",
    durationEstimate: "5 mins",
    sentences: [
      "Philosophical inquiries into ethics frequently clash with contemporary utilitarian frameworks.",
      "We must ask whether moral obligations are absolute or merely culturally relative constructs.",
      "To assert a universal moral absolute requires reconciling deep ideological disparities.",
      "Thus, any coherent ethical system must grapple with the pluralism of human values.",
      "Ultimately, justice is not a static ideal but an ongoing societal negotiation."
    ],
    arabicTranslations: [
      "غالباً ما تصطدم الاستفسارات الفلسفية في الأخلاق مع الأطر النفعية المعاصرة.",
      "يجب أن نتساءل عما إذا كانت الالتزامات الأخلاقية مطلقة أم مجرد بنيات نسبية ثقافياً.",
      "لتأكيد حتمية أخلاقية عالمية يتطلب التوفيق بين الفروق الأيديولوجية العميقة.",
      "وبالتالي، فإن أي نظام أخلاقي متماسك يجب أن يتعامل مع تعددية القيم الإنسانية.",
      "في نهاية المطاف، العدالة ليست نموذجاً مثالياً ثابتاً بل هي تفاوض مجتمعي مستمر."
    ],
    vocabList: [
      { word: "Utilitarian", meaning: "Designed to be useful or practical rather than ethical or attractive", arabicMeaning: "منفعي", phonetic: "/juːˌtɪlɪˈteriən/" },
      { word: "Disparities", meaning: "Great differences or incongruities between entities", arabicMeaning: "fوارق / اختلافات شاسعة", phonetic: "/dɪˈspærətiz/" },
      { word: "Coherent", meaning: "Logical and consistent; forming a unified whole", arabicMeaning: "متماسك / متناسق", phonetic: "/koʊˈhɪrənt/" }
    ]
  },
  {
    id: "c2-lesson-2",
    title: "Diplomatic Discourse & Negotiation",
    arabicTitle: "الخطاب الدبلوماسي والمفاوضات",
    level: "C2",
    category: "International Relations",
    description: "Employ extreme registers of English to mediate delicate corporate or state disputes and reach agreements.",
    arabicDescription: "استخدام أقصى درجات اللباقة واللغة الرسمية للتوسط في النزاعات المعقدة والتوصل إلى اتفاقيات.",
    durationEstimate: "5 mins",
    sentences: [
      "Navigating geopolitical tensions demands a subtle blend of deterrence and compromise.",
      "The ambassador sought to defuse the brewing crisis through quiet, behind-the-scenes diplomacy.",
      "Any unilateral action at this delicate juncture could irreversibly jeopardize the peace talks.",
      "It is vital to establish mutually agreeable protocols to monitor compliance on both sides.",
      "Only through sustained, reciprocal goodwill can we build a durable framework for security."
    ],
    arabicTranslations: [
      "تتطلب إدارة التوترات الجيوسياسية مزيجاً دقيقاً من الردع والتسوية.",
      "سعى السفير إلى نزع فتيل الأزمة التي تلوح في الأفق من خلال دبلوماسية هادئة خلف الكواليس.",
      "أي إجراء أحادي الجانب في هذا المنعطف الدقيق قد يهدد محادثات السلام بشكل لا يمكن إصلاحه.",
      "من الأهمية بمكان وضع بروتوكولات مقبولة للطرفين لمراقبة الامتثال من كلا الجانبين.",
      "فقط من خلال حسن النية المتبادل والمستمر يمكننا بناء إطار متين للأمن."
    ],
    vocabList: [
      { word: "Deterrence", meaning: "The action of discouraging an action or event through instilling doubt or fear of consequences", arabicMeaning: "ردع / منع وقائي", phonetic: "/dɪˈtɜːrəns/" },
      { word: "Juncture", meaning: "A particular point of events or time, especially a highly critical one", arabicMeaning: "منعطف / لحظة حرجة", phonetic: "/ˈdʒʌŋktʃər/" },
      { word: "Reciprocal", meaning: "Given, felt, or done in return; mutual on both sides", arabicMeaning: "متبادل / متعاكس", phonetic: "/rɪˈsɪprəkl/" }
    ]
  },
  {
    id: "c2-lesson-3",
    title: "Geopolitical Analysis & Strategy",
    arabicTitle: "التحليل والبحث الجيوسياسي الاستراتيجي",
    level: "C2",
    category: "International Relations",
    description: "Deliberate on macroeconomic friction, sovereign strategic choices, and global multilateral institutions.",
    arabicDescription: "التداول والبحث المعمق في قضايا الاحتكاك الاقتصادي الكلي، والخيارات الاستراتيجية للدول السيادية، والمؤسسات متعددة الأطراف.",
    durationEstimate: "5 mins",
    sentences: [
      "The current geopolitical paradigm is characterized by multipolar alignment and localized mercantilism.",
      "Such structural transitions necessitate a reassessment of international trade treaties and defensive alliances.",
      "Failing to adapt to these systemic transformations could precipitously undermine long-term macroeconomic stability.",
      "Consequently, sovereign nations must formulate highly sophisticated contingency strategies to hedge against volatility.",
      "The path forward hinges on fostering nuanced bilateral engagements and mutual respect."
    ],
    arabicTranslations: [
      "يتميز النموذج الجيوسياسي الحالي بالتحالف متعدد الأقطاب والنزعة التجارية الحمائية المحلية.",
      "تتطلب مثل هذه التحولات الهيكلية إعادة تقييم المعاهدات التجارية الدولية والتحالفات الدفاعية.",
      "الفشل في التكيف مع هذه التحولات النظامية قد يقوض بشكل متسارع الاستقرار الاقتصادي الكلي طويل المدى.",
      "وبناءً على ذلك، يتعين على الدول السيادية صياغة استراتيجيات طوارئ متطورة للتحوط ضد التقلبات.",
      "السبيل إلى الأمام يرتكز على تعزيز المشاركات الثنائية الدقيقة والاحترام المتبادل."
    ],
    vocabList: [
      { word: "Mercantilism", meaning: "Belief in the benefits of profitable trading; commercialism associated with protectionism", arabicMeaning: "ميركانتيلية / النزعة التجارية الحمائية", phonetic: "/ˈmɜːrkəntɪlɪzəm/" },
      { word: "Precipitously", meaning: "Very steeply, rapidly, or hastily without deliberation", arabicMeaning: "بشكل متسارع ومفاجئ", phonetic: "/prɪˈsɪpɪtəsli/" },
      { word: "Hedges", meaning: "Investments or actions designed to mitigate potential future financial or strategic risks", arabicMeaning: "تحوطات / وسائل وقاية", phonetic: "/ˈhɛdʒɪz/" }
    ]
  },
  {
    id: "c2-lesson-4",
    title: "Epistemology & Scientific Method",
    arabicTitle: "نظرية المعرفة والمنهج العلمي الفلسفي",
    level: "C2",
    category: "Philosophical Inquiry",
    description: "Evaluate epistemic validity, discuss empirical falsifiability, and analyze cognitive biases.",
    arabicDescription: "تقييم الصلاحية المعرفية، ومناقشة قابلية التكذيب التجريبي، وتحليل الانحيازات المعرفية المتأصلة.",
    durationEstimate: "5 mins",
    sentences: [
      "Epistemological debates frequently grapple with the limits of empirical observation as a source of truth.",
      "Karl Popper argued that scientific theories must exhibit absolute falsifiability to be considered valid.",
      "Nevertheless, our cognitive biases often color our interpretation of supposedly objective datasets.",
      "Only through continuous replication and meticulous peer-review can we approach consensus.",
      "Ultimately, scientific progress is not linear but punctuated by paradigm-shattering breakthroughs."
    ],
    arabicTranslations: [
      "غالباً ما تتعامل النقاشات المعرفية مع حدود الملاحظة التجريبية كمصدر للحقيقة المطلقة.",
      "جادل كارل بوبر بأن النظريات العلمية يجب أن تظهر قابلية مطلقة للتكذيب لاعتبارها صالحة.",
      "ومع ذلك، فإن انحيازاتنا المعرفية غالباً ما تلون تفسيرنا لمجموعات البيانات التي يُفترض أنها موضوعية.",
      "فقط من خلال التكرار المستمر ومراجعة الأقران الدقيقة يمكننا الاقتراب من الإجماع العلمي.",
      "في نهاية المطاف، فإن التقدم العلمي ليس خطياً ولكنه يتخلله طفرات كبرى تحطم النماذج السابقة."
    ],
    vocabList: [
      { word: "Epistemological", meaning: "Relating to the theory of knowledge, especially with regard to its methods, validity, and scope", arabicMeaning: "معرفي / متصل بنظرية المعرفة", phonetic: "/ɪˌpɪstəməˈlɒdʒɪkl/" },
      { word: "Falsifiability", meaning: "The capacity for some hypothesis, theory, or statement to be proven wrong", arabicMeaning: "قابلية التكذيب والتفنيد", phonetic: "/ˌfɔːlsɪfaɪəˈbɪlɪti/" },
      { word: "Consensus", meaning: "A general agreement about a particular topic or theory among experts", arabicMeaning: "إجماع / توافق الآراء", phonetic: "/kənˈsɛnsəs/" }
    ]
  },
  {
    id: "c2-lesson-5",
    title: "Art, Aesthetics & Cultural Satire",
    arabicTitle: "الفن والجماليات والهجاء الثقافي النيّر",
    level: "C2",
    category: "Philosophical Inquiry",
    description: "Deconstruct artistic expressions, explain semiotic subversion, and discuss cultural paradigms.",
    arabicDescription: "تفكيك التعبيرات الفنية المعاصرة، وشرح التخريب السيميائي للرموز، ومناقشة النماذج الثقافية والجمالية.",
    durationEstimate: "5 mins",
    sentences: [
      "Contemporary aesthetics often subvert traditional artistic expectations through deliberate irony.",
      "By deconstructing iconic symbols, the artist invites us to contemplate the commodification of culture.",
      "This semiotic play challenges our preconceived notions of value, beauty, and absolute truth.",
      "Consequently, cultural satire has become a highly potent tool for political commentary.",
      "To engage with such works requires a deep appreciation of intertextuality and historic context."
    ],
    arabicTranslations: [
      "غالباً ما تقوض الجماليات المعاصرة التوقعات الفنية التقليدية من خلال السخرية المتعمدة.",
      "من خلال تفكيك الرموز الشهيرة، يدعونا الفنان إلى تأمل تسليع الثقافة وجعلها سلعة تجارية.",
      "يتحدى هذا اللعب السيميائي مفاهيمنا المسبقة عن القيمة والجمال والحقيقة المطلقة.",
      "وبناءً على ذلك، أصبح الهجاء الثقافي أداة قوية للغاية للتعليق السياسي والنقد المجتمعي.",
      "يتطلب التفاعل مع هذه الأعمال تقديراً عميقاً للتناص التاريخي والسياق الفني."
    ],
    vocabList: [
      { word: "Aesthetics", meaning: "A set of principles concerned with the nature and appreciation of beauty, especially in art", arabicMeaning: "علم الجمال / الجماليات", phonetic: "/iːsˈθɛtɪks/" },
      { word: "Semiotics", meaning: "The study of signs and symbols and their interpretation and use", arabicMeaning: "سيميائية / دراسة الرموز والعلامات", phonetic: "/ˌsɛmiˈɒtɪks/" },
      { word: "Intertextuality", meaning: "The relationship between texts, especially literary ones; how they reference each other", arabicMeaning: "تناص / تداخل النصوص", phonetic: "/ˌɪntərtɛkstʃuˈæləti/" }
    ]
  }
];
