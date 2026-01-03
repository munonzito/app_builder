export const BUILDER_SUGGESTIONS = [
  'Todo app with categories',
  'Weather app with location',
  'Notes app with sync',
  'Expense tracker',
] as const;

export type BuilderSuggestion = (typeof BUILDER_SUGGESTIONS)[number];
