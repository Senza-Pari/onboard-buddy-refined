import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare,
  Trophy,
  Users, 
  FileText, 
  Image, 
  Menu, 
  X,
  LogOut,
  Settings,
  HelpCircle,
  Share2,
  Layout,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSettingsStore from '../stores/settingsStore';
import { useSubscription } from '../hooks/useSubscription';
import SettingsPanel from '../components/SettingsPanel';
import HelpCenter from '../components/HelpCenter';
import ShareWorkflowDialog from '../components/ShareWorkflowDialog';
import PremiumBanner from '../components/PremiumBanner';
import PremiumFeatureTooltip from '../components/PremiumFeatureTooltip';
import useAuthStore from '../stores/authStore';

const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const navigate = useNavigate();
  const { layout } = useSettingsStore();
  const { user } = useAuthStore();
  const { isPremium } = useSubscription();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    navigate('/');
  };

  // Helper function to check if user has a valid UUID
  const isValidUUID = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/tasks', icon: <CheckSquare size={20} />, label: 'Tasks' },
    { path: '/missions', icon: <Trophy size={20} />, label: 'Missions' },
    { path: '/people', icon: <Users size={20} />, label: 'People' },
    { path: '/gallery', icon: <Image size={20} />, label: 'Gallery' },
    { path: '/export', icon: <FileText size={20} />, label: 'Export' },
  ];

  // Always show Templates tab, but with different styling for non-premium users
  const templatesNavItem = {
    path: '/templates',
    icon: <Layout size={20} />,
    label: 'Templates',
    isPremium: true
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <PremiumBanner />
      
      <div className="flex flex-1">
        {/* Mobile sidebar toggle */}
        <div className="fixed top-4 left-4 z-30 md:hidden">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full bg-white shadow-soft"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar */}
        <motion.div 
          className={`fixed inset-0 z-20 bg-black bg-opacity-50 md:relative md:bg-transparent ${
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
                        ${isActive 
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

                {/* Templates Navigation Item */}
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
                    {!isPremium && (
                      <PremiumFeatureTooltip
                        title="Premium Templates"
                        description="Access our full template library and customization tools"
                        benefits={[
                          'Pre-built industry templates',
                          'Custom template builder',
                          'Advanced customization',
                          'Team deployment tools'
                        ]}
                        className="ml-auto"
                      >
                        <Crown size={16} className="text-yellow-500" />
                      </PremiumFeatureTooltip>
                    )}
                  </NavLink>
                </li>

                {(isPremium || user?.email === 'cam@dollen.com') && user && isValidUUID(user.id) && (
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
        <main className="flex-1 p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-12 md:pt-0"
            style={{ maxWidth: layout.contentMaxWidth }}
          >
            <Outlet />
          </motion.div>
        </main>

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