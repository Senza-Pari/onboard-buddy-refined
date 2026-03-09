import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';
import useFeatureStore, { FeatureKey } from '../stores/featureStore';

const Admin: React.FC = () => {
  const { features, toggleFeature } = useFeatureStore();
  const [confirmingCore, setConfirmingCore] = useState<FeatureKey | null>(null);

  const coreFeatures = Object.entries(features).filter(
    ([, config]) => config.category === 'core'
  ) as [FeatureKey, typeof features[FeatureKey]][];

  const addonFeatures = Object.entries(features).filter(
    ([, config]) => config.category === 'addon'
  ) as [FeatureKey, typeof features[FeatureKey]][];

  const handleToggle = (key: FeatureKey, category: string) => {
    if (category === 'core' && features[key].enabled) {
      setConfirmingCore(key);
    } else {
      toggleFeature(key);
      setConfirmingCore(null);
    }
  };

  const confirmDisableCore = () => {
    if (confirmingCore) {
      toggleFeature(confirmingCore);
      setConfirmingCore(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield size={28} className="text-primary-500" />
          Admin — Feature Control
        </h1>
        <p className="text-neutral-600 mt-2">
          Toggle features on or off. Core features are essential to the onboarding experience.
        </p>
      </header>

      {/* Core warning dialog */}
      {confirmingCore && (
        <motion.div
          className="mb-6 p-4 rounded-xl border-2 border-amber-300 bg-amber-50 flex items-start gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle size={22} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800">
              Disable "{features[confirmingCore].label}"?
            </p>
            <p className="text-sm text-amber-700 mt-1">
              This is a core feature. Disabling it will hide it from navigation and the dashboard.
            </p>
            <div className="flex gap-3 mt-3">
              <button
                onClick={confirmDisableCore}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
              >
                Yes, disable it
              </button>
              <button
                onClick={() => setConfirmingCore(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Core Features */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 text-primary-700">
            Core
          </span>
          Core Features
        </h2>
        <div className="grid gap-3">
          {coreFeatures.map(([key, config]) => (
            <FeatureRow
              key={key}
              featureKey={key}
              config={config}
              onToggle={() => handleToggle(key, 'core')}
            />
          ))}
        </div>
      </section>

      {/* Add-on Features */}
      <section>
        <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
            Add-on
          </span>
          Add-on Features
        </h2>
        <div className="grid gap-3">
          {addonFeatures.map(([key, config]) => (
            <FeatureRow
              key={key}
              featureKey={key}
              config={config}
              onToggle={() => handleToggle(key, 'addon')}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

interface FeatureRowProps {
  featureKey: string;
  config: { enabled: boolean; label: string; category: string; description: string };
  onToggle: () => void;
}

const FeatureRow: React.FC<FeatureRowProps> = ({ featureKey, config, onToggle }) => (
  <motion.div
    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
      config.enabled
        ? 'bg-white border-neutral-200'
        : 'bg-neutral-50 border-neutral-100 opacity-70'
    }`}
    layout
  >
    <div className="flex-1 min-w-0 mr-4">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-neutral-900">{config.label}</span>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            config.category === 'core'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-indigo-100 text-indigo-700'
          }`}
        >
          {config.category === 'core' ? 'Core' : 'Add-on'}
        </span>
      </div>
      <p className="text-sm text-neutral-500 mt-0.5">{config.description}</p>
    </div>
    <button
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        config.enabled ? 'bg-primary-500' : 'bg-neutral-300'
      }`}
      role="switch"
      aria-checked={config.enabled}
      aria-label={`Toggle ${config.label}`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg transform ring-0 transition duration-200 ease-in-out ${
          config.enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </motion.div>
);

export default Admin;
