export enum QuestionType {
  Text = 'TEXT',
  Likert = 'LIKERT', // 1-5 scale
  MultipleChoice = 'MULTIPLE_CHOICE',
  Date = 'DATE'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For MultipleChoice
  description?: string; // Additional context/examples
  category: 'Personal' | 'Social' | 'Religious' | 'Family' | 'Future' | 'Honesty' | 'General' | 'Sexual' | 'Financial' | 'Intellectual';
}

export interface UserAnswer {
  questionId: string;
  answer: string | number;
}

export interface UserProfile {
  id: string; // Unique ID
  name: string;
  gender: 'male' | 'female';
  age?: number; // Added
  religion?: string; // Added
  dominantTrait?: string; // Added
  dateCreated: string;
  answers: UserAnswer[];
  analysis?: AnalysisReport;
  profileImage?: string; // Stored Base64 image
}

// Sub-section detailed analysis interface
export interface DimensionDetail {
  title: string;
  score: number; // 0-100
  analysis: string[]; // List of detailed points (min 10 items)
  rootCause: string; // "Root Cause" or "Resheh Yabi"
  strengths: string[];
  weaknesses: string[];
}

export interface AnalysisReport {
  summary: string; // Must be very detailed (10+ paragraphs)
  
  // 1. Individual Dimension (Fardi) - 7 Sub-dimensions
  individual: {
    identity: DimensionDetail; // 1. Identity & Self-knowledge
    emotionalRegulation: DimensionDetail; // 2. Emotion Regulation
    impulseControl: DimensionDetail; // 3. Impulse Control
    willpower: DimensionDetail; // 4. Willpower & Motivation
    rationality: DimensionDetail; // 5. Rationality & Thinking
    mentalHealth: DimensionDetail; // 6. Mental Health
    physicalHealth: DimensionDetail; // 7. Physical Health
  };

  // 2. Social Dimension (Ejtemaei) - 6 Sub-dimensions
  social: {
    communication: DimensionDetail; // 8. Interpersonal Communication
    family: DimensionDetail; // 9. Family
    friendship: DimensionDetail; // 10. Friendship & Social Belonging
    socialEthics: DimensionDetail; // 11. Social Ethics
    lawAbidance: DimensionDetail; // 12. Law Abidance
    socialRole: DimensionDetail; // 13. Social Role
  };

  // 3. Material Dimension (Madi) - 5 Sub-dimensions
  material: {
    financial: DimensionDetail; // 14. Individual Economy
    education: DimensionDetail; // 15. Education & Skills
    careerFuture: DimensionDetail; // 16. Job & Future
    lifestyle: DimensionDetail; // 17. Lifestyle
    appearance: DimensionDetail; // 18. Physicality & Appearance
  };

  // 4. Spiritual Dimension (Manavi) - 6 Sub-dimensions
  spiritual: {
    beliefs: DimensionDetail; // 19. Fundamental Beliefs
    connectionWithGod: DimensionDetail; // 20. Connection with God
    innerEthics: DimensionDetail; // 21. Inner Ethics
    sufferingMeaning: DimensionDetail; // 22. Meaning of Suffering
    divineResponsibility: DimensionDetail; // 23. Divine Responsibility
    ultimateGoal: DimensionDetail; // 24. Ultimate Goal
  };

  // 5. Strategic Green Sections
  divineGrowthMap: string[]; // طراحی نقشه رشد الهی نوجوان
  personalityProfile: string; // ساخت پروفایل شخصیتی خروجی
  interventionPriorities: string[]; // اولویت‌بندی ابعاد «قابل مداخله فوری»

  // Radar Chart Scores
  scores: {
    individualism: number;
    social: number;
    religious: number;
    materialism: number;
    honesty: number;
    sexualHealth: number;
    patience: number;
    thinking: number;
    conceptDistinction: number;
    lieProbability: number;
  };

  // Specific Scenarios
  scenarios: {
    scenario: string; 
    prediction: string; 
    analysis: string; 
  }[];

  detectedLies: string[];
  visualSelfPrompt: string;
}

export enum AppState {
  Dashboard,
  Questionnaire,
  Analyzing,
  Report,
  Chat
}