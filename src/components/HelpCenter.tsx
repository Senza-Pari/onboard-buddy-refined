import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, Search, Book, HelpCircle, FileText, Settings, Users, Calendar } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'tasks' | 'missions' | 'gallery' | 'people';
}

const faqs: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'What is Onboard Buddy?',
    answer: 'Onboard Buddy is your personal onboarding companion that helps track your progress, manage tasks, complete missions, and document your journey through your first weeks at the company.'
  },
  {
    id: 'faq-2',
    category: 'tasks',
    question: 'How do I create a new task?',
    answer: 'Click the "Add New Task" button on the Tasks page. Fill in the task details including title, description, due date, and any relevant tags. You can also attach files and set priority levels.'
  },
  {
    id: 'faq-3',
    category: 'missions',
    question: 'What are missions?',
    answer: 'Missions are goal-oriented activities that help you explore different aspects of your role and company. Each mission has specific requirements and rewards upon completion.'
  },
  {
    id: 'faq-4',
    category: 'gallery',
    question: 'How do I add items to the gallery?',
    answer: 'In the Gallery section, click "Add Item" and choose between adding a photo or note. You can add tags, location information, and set sharing permissions for each item.'
  },
  {
    id: 'faq-5',
    category: 'people',
    question: 'How do I manage my contacts?',
    answer: 'Use the People & Notes section to add important contacts, schedule meetings, and keep notes about your interactions. You can also track follow-up items for each contact.'
  }
];

const helpTopics = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    content: `
      Welcome to Onboard Buddy! Here's how to get started:
      
      1. Complete your profile setup
      2. Review your assigned tasks
      3. Start your first mission
      4. Connect with team members
      5. Document your journey in the gallery
    `
  },
  {
    id: 'task-management',
    title: 'Task Management',
    icon: Calendar,
    content: `
      Effectively manage your tasks:
      
      • View all tasks in the Tasks dashboard
      • Filter tasks by category and status
      • Set due dates and priorities
      • Track completion progress
      • Add notes and attachments
    `
  },
  {
    id: 'missions-guide',
    title: 'Missions Guide',
    icon: FileText,
    content: `
      Complete missions to enhance your onboarding:
      
      • Browse available missions
      • Understand requirements and rewards
      • Track progress automatically
      • Submit evidence through the gallery
      • Earn rewards upon completion
    `
  },
  {
    id: 'people-networking',
    title: 'People & Networking',
    icon: Users,
    content: `
      Build your professional network:
      
      • Add important contacts
      • Schedule meet & greets
      • Take meeting notes
      • Set follow-up reminders
      • Track interactions
    `
  },
  {
    id: 'customization',
    title: 'Customization & Settings',
    icon: Settings,
    content: `
      Personalize your experience:
      
      • Customize your dashboard
      • Set notification preferences
      • Manage tags and categories
      • Configure display options
      • Set up integrations
    `
  }
];

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [openFaqs, setOpenFaqs] = useState<string[]>([]);

  const toggleFaq = (id: string) => {
    setOpenFaqs(prev => 
      prev.includes(id) ? prev.filter(faqId => faqId !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTopics = helpTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <HelpCircle className="text-primary-500" />
                  Help Center
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                <input
                  type="text"
                  placeholder="Search help topics and FAQs..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="divide-y">
              {/* Help Topics */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Help Topics</h3>
                <div className="grid gap-4">
                  {filteredTopics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedTopic === topic.id
                          ? 'bg-primary-50 border-2 border-primary-200'
                          : 'bg-neutral-50 hover:bg-neutral-100'
                      }`}
                      onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <topic.icon className="text-primary-500" size={20} />
                        <h4 className="font-medium">{topic.title}</h4>
                      </div>
                      {selectedTopic === topic.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-neutral-600 mt-2 whitespace-pre-line"
                        >
                          {topic.content}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  {filteredFaqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <button
                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-neutral-50"
                        onClick={() => toggleFaq(faq.id)}
                      >
                        <span className="font-medium">{faq.question}</span>
                        <ChevronDown
                          className={`transform transition-transform ${
                            openFaqs.includes(faq.id) ? 'rotate-180' : ''
                          }`}
                          size={20}
                        />
                      </button>
                      <AnimatePresence>
                        {openFaqs.includes(faq.id) && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-3 bg-neutral-50 text-neutral-600">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HelpCenter;