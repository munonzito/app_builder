export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  Builder: { projectId: string; initialPrompt?: string };
  Projects: undefined;
  Templates: undefined;
  Settings: undefined;
  RuntimePreview: { projectId: string };
};
