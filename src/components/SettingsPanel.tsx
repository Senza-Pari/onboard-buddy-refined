import React from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, Crown } from 'lucide-react';
import useSettingsStore from '../stores/settingsStore';
import useAuthStore from '../stores/authStore';
import CoverImageSettings from './CoverImageSettings';
import { Link } from 'react-router-dom';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const {
    theme,
    layout,
    notifications,
    preferences,
    updateTheme,
    updateLayout,
    updateNotifications,
    updatePreferences,
    resetToDefault,
  } = useSettingsStore();

  const { user } = useAuthStore();
  const isPremium = user?.roles.includes('company_admin');

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-lg"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-64px)]">
          <section className="bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Account Type</h3>
              {isPremium ? (
                <span className="flex items-center gap-1 text-primary-600">
                  <Crown size={16} />
                  Premium
                </span>
              ) : (
                <Link 
                  to="/pricing"
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Upgrade to Premium
                </Link>
              )}
            </div>
            <p className="text-sm text-neutral-600">
              {isPremium 
                ? 'You have access to all premium features'
                : 'Upgrade to customize for your team'}
            </p>
          </section>

          <CoverImageSettings />

          <section>
            <h3 className="text-sm font-medium text-neutral-700 mb-3">Theme</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Primary Color</label>
                <input
                  type="color"
                  value={theme.primary}
                  onChange={(e) => updateTheme({ primary: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-neutral-700 mb-3">Layout</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Sidebar Width</label>
                <input
                  type="range"
                  min="200"
                  max="400"
                  value={layout.sidebarWidth}
                  onChange={(e) =>
                    updateLayout({ sidebarWidth: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-neutral-700 mb-3">
              Notifications
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifications.enabled}
                  onChange={(e) =>
                    updateNotifications({ enabled: e.target.checked })
                  }
                  className="rounded border-neutral-300"
                />
                <span className="text-sm">Enable Notifications</span>
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-neutral-700 mb-3">
              Preferences
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.autoSave}
                  onChange={(e) =>
                    updatePreferences({ autoSave: e.target.checked })
                  }
                  className="rounded border-neutral-300"
                />
                <span className="text-sm">Auto-save Changes</span>
              </label>
            </div>
          </section>

          <div className="pt-4 border-t">
            <button
              onClick={resetToDefault}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg w-full"
            >
              <RefreshCw size={16} />
              Reset to Default
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPanel;