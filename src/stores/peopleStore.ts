import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Person {
  id: number;
  name: string;
  role: string;
  department: string;
  meetingDate: string;
  meetingTime: string;
  topics: string[];
  notes: string;
  followUp: string;
  photoUrl: string;
}

interface PeopleState {
  people: Person[];
  addPerson: (person: Omit<Person, 'id'>) => void;
  updatePerson: (id: number, updates: Partial<Person>) => void;
  deletePerson: (id: number) => void;
  setPeople: (people: Person[]) => void;
}

const initialPeople: Person[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Team Lead',
    department: 'Engineering',
    meetingDate: '2025-04-14',
    meetingTime: '10:00 AM',
    topics: ['Team structure', 'Current projects', 'Expectations'],
    notes: 'Sarah has been with the company for 5 years. She oversees three project teams and will be my direct manager.',
    followUp: 'Schedule a follow-up meeting to go over my first week progress.',
    photoUrl: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Product Manager',
    department: 'Product',
    meetingDate: '2025-04-16',
    meetingTime: '2:00 PM',
    topics: ['Product roadmap', 'User research', 'Upcoming releases'],
    notes: 'Michael leads the product strategy for our core platform. He works closely with engineering and design teams.',
    followUp: 'Review product documentation before our meeting.',
    photoUrl: 'https://images.pexels.com/photos/874158/pexels-photo-874158.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    department: 'Design',
    meetingDate: '2025-04-18',
    meetingTime: '11:30 AM',
    topics: ['Design system', 'User flows', 'Collaboration processes'],
    notes: '',
    followUp: '',
    photoUrl: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
];

const usePeopleStore = create<PeopleState>()(
  persist(
    (set, get) => ({
      people: initialPeople,

      addPerson: (person) => {
        const maxId = get().people.reduce((max, p) => Math.max(max, p.id), 0);
        set((state) => ({
          people: [...state.people, { ...person, id: maxId + 1 }],
        }));
      },

      updatePerson: (id, updates) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deletePerson: (id) => {
        set((state) => ({
          people: state.people.filter((p) => p.id !== id),
        }));
      },

      setPeople: (people) => {
        set({
          people: people.map((p, i) => ({ ...p, id: p.id || i + 1 })),
        });
      },
    }),
    {
      name: 'onboard-buddy-people',
      version: 1,
    }
  )
);

export default usePeopleStore;
