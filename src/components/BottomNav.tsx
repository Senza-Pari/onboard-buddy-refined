import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Trophy, Users, BookOpen, MessageCircle } from 'lucide-react';
import useDemoTourStore from '../stores/demoTourStore';
import BuddyChatDrawer from './BuddyChatDrawer';
import useFeatureStore, { FeatureKey } from '../stores/featureStore';

const allNavItems: { path: string; icon: typeof LayoutDashboard; label: string; featureKey?: FeatureKey }[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks', featureKey: 'tasks' },
  { path: '/missions', icon: Trophy, label: 'Missions', featureKey: 'missions' },
  { path: '/people', icon: Users, label: 'People', featureKey: 'people' },
  { path: '/gallery', icon: BookOpen, label: 'Journal', featureKey: 'journal' },
];

const BottomNav: React.FC = () => {
  const { isActive: isTourActive } = useDemoTourStore();
  const [isBuddyOpen, setIsBuddyOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-200 md:hidden bottom-nav-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
                  isActive && isTourActive
                    ? 'text-primary-600 tour-glow'
                    : isActive
                      ? 'text-primary-600'
                      : 'text-neutral-500 hover:text-neutral-700'
                }`
              }
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium mt-0.5">{label}</span>
            </NavLink>
          ))}
          <button
            onClick={() => setIsBuddyOpen(true)}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-colors text-primary-500 hover:text-primary-700"
          >
            <MessageCircle size={22} />
            <span className="text-[10px] font-medium mt-0.5">Buddy</span>
          </button>
        </div>
      </nav>

      <BuddyChatDrawer isOpen={isBuddyOpen} onClose={() => setIsBuddyOpen(false)} />
    </>
  );
};

export default BottomNav;
