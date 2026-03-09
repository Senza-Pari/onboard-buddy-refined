import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Trophy, Users, BookOpen, MessageCircle, MoreHorizontal, FileText, Layout, Shield, Settings, HelpCircle, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useDemoTourStore from '../stores/demoTourStore';
import BuddyChatDrawer from './BuddyChatDrawer';
import useFeatureStore, { FeatureKey } from '../stores/featureStore';
import useAuthStore from '../stores/authStore';

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
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { isEnabled } = useFeatureStore();
  const navigate = useNavigate();

  const moreItems: { icon: typeof FileText; label: string; path?: string; action?: () => void; featureKey?: FeatureKey }[] = [
    ...(isEnabled('export') ? [{ icon: FileText, label: 'Export', path: '/export' }] : []),
    ...(isEnabled('templates') ? [{ icon: Layout, label: 'Templates', path: '/templates' }] : []),
    { icon: Shield, label: 'Admin', path: '/admin' },
    { icon: Settings, label: 'Settings', action: () => {} },
    { icon: HelpCircle, label: 'Help Center', action: () => {} },
    { icon: LogOut, label: 'Sign Out', action: () => navigate('/') },
  ];

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
          {showBuddy && (
            <button
              onClick={() => setIsBuddyOpen(true)}
              className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-colors text-primary-500 hover:text-primary-700"
            >
              <MessageCircle size={22} />
              <span className="text-[10px] font-medium mt-0.5">Buddy</span>
            </button>
          )}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-colors text-neutral-500 hover:text-neutral-700"
          >
            <MoreHorizontal size={22} />
            <span className="text-[10px] font-medium mt-0.5">More</span>
          </button>
        </div>
      </nav>

      {/* More menu drawer */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-lg md:hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <h3 className="text-sm font-semibold text-neutral-900">More</h3>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 rounded-full hover:bg-neutral-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X size={18} className="text-neutral-500" />
                </button>
              </div>
              <div className="p-2 pb-safe">
                {moreItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setIsMoreOpen(false);
                      if (item.path) {
                        navigate(item.path);
                      } else if (item.action) {
                        item.action();
                      }
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-neutral-700 rounded-lg hover:bg-neutral-100 min-h-[44px] transition-colors"
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BuddyChatDrawer isOpen={isBuddyOpen} onClose={() => setIsBuddyOpen(false)} />
    </>
  );
};

export default BottomNav;
