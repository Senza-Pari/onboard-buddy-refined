import { create } from 'zustand';

interface DemoTourState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  end: () => void;
}

const useDemoTourStore = create<DemoTourState>()((set, get) => ({
  isActive: false,
  currentStep: 0,
  totalSteps: 6,

  start: () => set({ isActive: true, currentStep: 0 }),

  next: () => {
    const { currentStep, totalSteps } = get();
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 });
    } else {
      set({ isActive: false, currentStep: 0 });
    }
  },

  prev: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  skip: () => set({ isActive: false, currentStep: 0 }),
  end: () => set({ isActive: false, currentStep: 0 }),
}));

export default useDemoTourStore;
