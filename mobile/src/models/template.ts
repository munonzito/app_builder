export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  tags: string[];
}

export const templates: AppTemplate[] = [
  {
    id: 'todo',
    name: 'Todo App',
    description: 'A simple task management app with categories and due dates',
    icon: 'check-circle',
    prompt: 'Create a todo app with the following features: task list with checkboxes, ability to add new tasks, categories/tags for tasks, due dates, and a clean dark theme UI.',
    tags: ['productivity', 'tasks'],
  },
  {
    id: 'notes',
    name: 'Notes App',
    description: 'A note-taking app with rich text and folders',
    icon: 'note',
    prompt: 'Create a notes app with: a list of notes, ability to create/edit/delete notes, folder organization, search functionality, and a modern dark theme.',
    tags: ['productivity', 'notes'],
  },
  {
    id: 'weather',
    name: 'Weather App',
    description: 'A weather app showing current conditions and forecast',
    icon: 'cloud',
    prompt: 'Create a weather app that shows: current weather with temperature and conditions, 5-day forecast, location-based weather (mock data for now), and beautiful weather icons.',
    tags: ['utility', 'weather'],
  },
  {
    id: 'expense',
    name: 'Expense Tracker',
    description: 'Track your spending with categories and charts',
    icon: 'attach-money',
    prompt: 'Create an expense tracker with: ability to add expenses with amount and category, list of recent expenses, monthly summary, simple pie chart showing spending by category.',
    tags: ['finance', 'budget'],
  },
  {
    id: 'timer',
    name: 'Pomodoro Timer',
    description: 'A focus timer with work/break intervals',
    icon: 'timer',
    prompt: 'Create a pomodoro timer app with: 25-minute work sessions, 5-minute breaks, visual countdown timer, start/pause/reset controls, and session tracking.',
    tags: ['productivity', 'focus'],
  },
  {
    id: 'habit',
    name: 'Habit Tracker',
    description: 'Build and track daily habits',
    icon: 'trending-up',
    prompt: 'Create a habit tracker app with: list of habits to track, daily check-off, streak counter for each habit, weekly progress view, and motivational messages.',
    tags: ['health', 'habits'],
  },
];
