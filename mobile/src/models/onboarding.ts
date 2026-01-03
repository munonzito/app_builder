export interface QuizStep {
  question: string;
  options: string[];
  reinforcementTitleTemplate: string;
  visualType: 'appBuilder' | 'experience' | 'platform';
}

export const onboardingSteps: QuizStep[] = [
  {
    question: "What kind of app do you want to build?",
    options: ["E-commerce", "Social Network", "Marketplace", "SaaS Tool"],
    reinforcementTitleTemplate: "Perfect! With App Builder you can build {answer} apps easily!",
    visualType: 'appBuilder',
  },
  {
    question: "What's your experience building mobile apps?",
    options: ["None", "Beginner", "Experienced", "Expert"],
    reinforcementTitleTemplate: "With App Builder you don't need experience! Our AI guides you.",
    visualType: 'experience',
  },
  {
    question: "What type of apps do you want to build?",
    options: ["iOS", "Android", "Both"],
    reinforcementTitleTemplate: "iOS or Android we got you covered. One codebase, two apps.",
    visualType: 'platform',
  },
];
