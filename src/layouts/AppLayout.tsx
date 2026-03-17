import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare,
  Trophy,
  Users, 
  FileText, 
  BookOpen, 
  Menu, 
  X,
  LogOut,
  Settings,
  HelpCircle,
  Share2,
  Layout,
  Sparkles,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSettingsStore from '../stores/settingsStore';
import SettingsPanel from '../components/SettingsPanel';
import HelpCenter from '../components/HelpCenter';
import ShareWorkflowDialog from '../components/ShareWorkflowDialog';
import useAuthStore from '../stores/authStore';
import BottomNav from '../components/BottomNav';
import DemoTour from '../components/DemoTour';
import BuddyChat from '../components/BuddyChat';
import useDemoTourStore from '../stores/demoTourStore';
import useDemoStore from '../stores/demoStore';
import useFeatureStore, { FeatureKey } from '../stores/featureStore';

const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const navigate = useNavigate();
  const { layout } = useSettingsStore();
  const { user, hasRole } = useAuthStore();
  const isGuest = user?.id === 'demo-user';
  const { isActive: isTourActive } = useDemoTourStore();
  const { isEnabled } = useFeatureStore();

  // Listen for custom events from mobile More menu
  useEffect(() => {
    const openSettings = () => setIsSettingsOpen(true);
    const openHelp = () => setIsHelpOpen(true);
    window.addEventListener('open-settings', openSettings);
    window.addEventListener('open-help', openHelp);
    return () => {
      window.removeEventListener('open-settings', openSettings);
      window.removeEventListener('open-help', openHelp);
    };
  }, []);

  const handleReplayTour = () => {
    useDemoStore.getState().reset();
    useDemoTourStore.getState().start();
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const { logout } = useAuthStore();
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isValidUUID = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const allNavItems: { path: string; icon: React.ReactNode; label: string; featureKey?: FeatureKey }[] = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/tasks', icon: <CheckSquare size={20} />, label: 'Tasks', featureKey: 'tasks' },
    { path: '/missions', icon: <Trophy size={20} />, label: 'Missions', featureKey: 'missions' },
    { path: '/people', icon: <Users size={20} />, label: 'People', featureKey: 'people' },
    { path: '/gallery', icon: <BookOpen size={20} />, label: 'Journal', featureKey: 'journal' },
    { path: '/export', icon: <FileText size={20} />, label: 'Export', featureKey: 'export' },
  ];

  const navItems = allNavItems.filter(item => !item.featureKey || isEnabled(item.featureKey));

  const templatesNavItem = {
    path: '/templates',
    icon: <Layout size={20} />,
    label: 'Templates',
    isPremium: true
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <div className="flex flex-1">
        {/* Mobile sidebar toggle - hidden when bottom nav is shown */}
        <div className="fixed top-4 left-4 z-30 hidden">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full bg-white shadow-soft min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar - desktop only */}
        <motion.div 
          className={`fixed inset-0 z-20 bg-black/50 md:relative md:bg-transparent ${
            isSidebarOpen ? 'block' : 'hidden md:block'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsSidebarOpen(false)}
        >
          <motion.aside 
            className="w-64 h-full bg-white shadow-medium flex flex-col"
            style={{ width: layout.sidebarWidth }}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900">Onboard Buddy</h2>
            </div>
            
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `
                        flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2
                        ${isActive && isTourActive
                          ? 'bg-primary-200 text-primary-700 tour-glow'
                          : isActive 
                            ? 'bg-primary-100 text-primary-700' 
                            : 'text-neutral-700 hover:bg-neutral-100'
                        }
                      `}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  </li>
                ))}

                {isEnabled('templates') && (
                  <li>
                    <NavLink
                      to={templatesNavItem.path}
                      className={({ isActive }) => `
                        flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 relative
                        ${isActive 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'text-neutral-700 hover:bg-neutral-100'
                        }
                      `}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <span className="mr-3">{templatesNavItem.icon}</span>
                      {templatesNavItem.label}
                    </NavLink>
                  </li>
                )}

                {isEnabled('shareJourney') && user && isValidUUID(user.id) && (
                  <li>
                    <button
                      onClick={() => setIsShareOpen(true)}
                      className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 text-neutral-700 hover:bg-neutral-100"
                    >
                      <Share2 size={20} className="mr-3" />
                      Share
                    </button>
                  </li>
                )}
              </ul>
            </nav>
            
            <div className="p-4 border-t border-neutral-100 space-y-2">
              {hasRole('admin') && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `
                    flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg
                    ${isActive ? 'bg-primary-100 text-primary-700' : 'text-neutral-700 hover:bg-neutral-100'}
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Shield size={20} className="mr-3" />
                  Admin
                </NavLink>
              )}
              <button 
                onClick={() => setIsHelpOpen(true)}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <HelpCircle size={20} className="mr-3" />
                Help Center
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <Settings size={20} className="mr-3" />
                Settings
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <LogOut size={20} className="mr-3" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        </motion.div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ maxWidth: layout.contentMaxWidth }}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Bottom Navigation - mobile only */}
        <BottomNav />

        {/* Demo Tour */}
        <DemoTour />

        {/* Buddy AI Chat */}
        <BuddyChat />

        {/* Replay Tour FAB for guest users */}
        {isGuest && !isTourActive && (
          <motion.button
            onClick={handleReplayTour}
            className="fixed bottom-36 right-4 md:bottom-20 md:right-6 z-40 w-12 h-12 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 flex items-center justify-center transition-colors"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Replay Tour"
          >
            <Sparkles size={22} />
          </motion.button>
        )}

        {/* Settings Panel */}
        <AnimatePresence>
          {isSettingsOpen && (
            <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
          )}
        </AnimatePresence>

        {/* Help Center */}
        <AnimatePresence>
          {isHelpOpen && (
            <HelpCenter isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
          )}
        </AnimatePresence>

        {/* Share Dialog */}
        <AnimatePresence>
          {isShareOpen && user && isValidUUID(user.id) && (
            <ShareWorkflowDialog 
              isOpen={isShareOpen} 
              onClose={() => setIsShareOpen(false)}
              userId={user.id}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppLayout;
