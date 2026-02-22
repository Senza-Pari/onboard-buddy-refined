export interface TourStep {
  route: string;
  title: string;
  body: string;
  actionHint?: string;
  interactive?: boolean;
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: '/dashboard',
    title: 'Welcome to Onboard Buddy! 👋',
    body: 'This is your command center. See your task completion, mission progress, and what\'s coming up — all at a glance.',
  },
  {
    route: '/tasks',
    title: 'Your Onboarding Checklist ✅',
    body: 'Tasks are organized by department (HR, IT, Manager). Check items off as you complete them and watch your progress grow!',
    actionHint: 'Try checking off a task right now!',
    interactive: true,
  },
  {
    route: '/missions',
    title: 'Missions & Achievements 🏆',
    body: 'Missions are bigger goals that span multiple tasks. They track automatically as you add notes and photos to your Journal.',
  },
  {
    route: '/people',
    title: 'Your People Directory 👥',
    body: 'Track your meet & greet schedule. Add notes, discussion topics, and follow-up actions from every introduction.',
  },
  {
    route: '/gallery',
    title: 'Your Onboarding Journal 📷',
    body: 'Capture notes, key learnings, and photos. Tag them to unlock mission progress and build your onboarding story!',
  },
  {
    route: '/export',
    title: 'Export Everything 📄',
    body: 'When you\'re done, export your tasks, missions, and notes as a PDF to share with your manager or keep as a record.',
  },
];
