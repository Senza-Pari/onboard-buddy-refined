import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, ArrowRight, Plus, Crown, Lock, Eye, Settings, Zap, BarChart3, Palette } from 'lucide-react';
import useSubscription from '../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import PremiumFeatureTooltip from '../components/PremiumFeatureTooltip';
import PremiumUpgradeModal from '../components/PremiumUpgradeModal';

interface TemplateOption {
  id: string;
  title: string;
  description: string;
  type: 'remote' | 'onsite' | 'hybrid' | 'custom';
  icon: typeof Users;
  taskCount: number;
  missionCount: number;
  peopleCount: number;
  features: string[];
  isPremium?: boolean;
}

const preBuiltTemplates: TemplateOption[] = [
  {
    id: 'remote',
    title: 'Remote Hire Template',
    description: 'Perfect for teams with remote employees, focusing on virtual onboarding and digital collaboration.',
    type: 'remote',
    icon: Users,
    taskCount: 12,
    missionCount: 4,
    peopleCount: 6,
    features: ['Virtual workspace setup', 'Digital tool training', 'Remote team integration', 'Communication protocols']
  },
  {
    id: 'onsite',
    title: 'Onsite Hire Template',
    description: 'Ideal for traditional office environments with in-person onboarding processes.',
    type: 'onsite',
    icon: Building2,
    taskCount: 15,
    missionCount: 5,
    peopleCount: 8,
    features: ['Office tour & facilities', 'In-person introductions', 'Workspace setup', 'Security & access']
  },
  {
    id: 'hybrid',
    title: 'Hybrid Hire Template',
    description: 'Balanced approach combining both remote and onsite elements for flexible work arrangements.',
    type: 'hybrid',
    icon: Users,
    taskCount: 18,
    missionCount: 6,
    peopleCount: 10,
    features: ['Flexible workspace setup', 'Hybrid communication', 'Schedule coordination', 'Tool integration']
  }
];

const premiumFeatures = [
  {
    icon: Settings,
    title: 'Advanced Customization',
    description: 'Fully customize templates with your branding, colors, and company-specific content.',
    benefits: ['Custom branding', 'Company colors', 'Logo integration', 'Personalized messaging']
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Automate task assignments, reminders, and progress tracking for seamless onboarding.',
    benefits: ['Auto task assignment', 'Smart reminders', 'Progress tracking', 'Conditional workflows']
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Track completion rates, identify bottlenecks, and optimize your onboarding process.',
    benefits: ['Completion analytics', 'Time tracking', 'Bottleneck identification', 'Performance insights']
  },
  {
    icon: Palette,
    title: 'Template Library',
    description: 'Access our growing library of industry-specific templates and best practices.',
    benefits: ['Industry templates', 'Best practice guides', 'Regular updates', 'Expert recommendations']
  }
];

const Templates: React.FC = () => {
  const { isPremium } = useSubscription();
  const navigate = useNavigate();
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    feature: string;
    context?: string;
  }>({
    isOpen: false,
    feature: '',
    context: ''
  });

  const handleTemplateSelect = (templateType: string) => {
    if (isPremium) {
      navigate(`/templates/${templateType}`);
    } else {
      setUpgradeModal({
        isOpen: true,
        feature: 'Template Builder',
        context: 'Template building and customization requires a Premium subscription to unlock full functionality.'
      });
    }
  };

  const handlePremiumFeatureClick = (featureName: string) => {
    setUpgradeModal({
      isOpen: true,
      feature: featureName,
      context: `${featureName} is a premium feature that helps you create more effective onboarding experiences.`
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Onboarding Templates</h1>
        <p className="text-neutral-700 max-w-2xl mx-auto">
          Choose from our professionally designed templates or create your own custom workflow. 
          {!isPremium && (
            <span className="text-primary-600 font-medium"> Upgrade to Premium to unlock full customization.</span>
          )}
        </p>
      </header>

      {/* Premium Banner for Non-Premium Users */}
      {!isPremium && (
        <motion.div
          className="mb-8 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                <Crown size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary-900">
                  You're viewing templates in preview mode
                </h3>
                <p className="text-primary-700">
                  Upgrade to Premium to build, customize, and deploy these templates for your team.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Upgrade Now
            </button>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Pre-built templates section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Pre-built Templates</h2>
              <p className="text-neutral-600">
                Professional templates designed for specific work arrangements and industries.
              </p>
            </div>
            {!isPremium && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Eye size={16} />
                Preview Mode
              </div>
            )}
          </div>

          <div className="grid gap-6">
            {preBuiltTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                className={`relative p-6 rounded-xl border-2 transition-all ${
                  isPremium 
                    ? 'border-neutral-200 hover:border-primary-200 hover:bg-primary-50 cursor-pointer' 
                    : 'border-neutral-200 bg-neutral-50/50'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleTemplateSelect(template.type)}
              >
                {!isPremium && (
                  <div className="absolute top-4 right-4">
                    <PremiumFeatureTooltip
                      title="Premium Template"
                      description="Full template customization and deployment requires Premium"
                      benefits={[
                        'Complete template access',
                        'Full customization options',
                        'Deploy to your team',
                        'Track progress & analytics'
                      ]}
                    >
                      <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                        <Crown size={16} className="text-white" />
                      </div>
                    </PremiumFeatureTooltip>
                  </div>
                )}

                <div className="flex items-start gap-6">
                  <div className={`p-4 rounded-xl ${isPremium ? 'bg-primary-100' : 'bg-neutral-200'}`}>
                    <template.icon className={`w-8 h-8 ${isPremium ? 'text-primary-600' : 'text-neutral-500'}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className={`text-xl font-semibold mb-2 ${!isPremium ? 'text-neutral-600' : ''}`}>
                          {template.title}
                        </h3>
                        <p className={`${!isPremium ? 'text-neutral-500' : 'text-neutral-600'}`}>
                          {template.description}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 ${isPremium ? 'text-primary-600' : 'text-neutral-400'}`}>
                        {!isPremium && <Lock size={16} />}
                        <ArrowRight size={20} />
                      </div>
                    </div>

                    {/* Template Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className={`text-center p-3 rounded-lg ${isPremium ? 'bg-neutral-50' : 'bg-neutral-100'}`}>
                        <div className={`text-lg font-bold ${!isPremium ? 'text-neutral-500' : 'text-neutral-900'}`}>
                          {template.taskCount}
                        </div>
                        <div className={`text-xs ${!isPremium ? 'text-neutral-400' : 'text-neutral-600'}`}>
                          Tasks
                        </div>
                      </div>
                      <div className={`text-center p-3 rounded-lg ${isPremium ? 'bg-neutral-50' : 'bg-neutral-100'}`}>
                        <div className={`text-lg font-bold ${!isPremium ? 'text-neutral-500' : 'text-neutral-900'}`}>
                          {template.missionCount}
                        </div>
                        <div className={`text-xs ${!isPremium ? 'text-neutral-400' : 'text-neutral-600'}`}>
                          Missions
                        </div>
                      </div>
                      <div className={`text-center p-3 rounded-lg ${isPremium ? 'bg-neutral-50' : 'bg-neutral-100'}`}>
                        <div className={`text-lg font-bold ${!isPremium ? 'text-neutral-500' : 'text-neutral-900'}`}>
                          {template.peopleCount}
                        </div>
                        <div className={`text-xs ${!isPremium ? 'text-neutral-400' : 'text-neutral-600'}`}>
                          Key People
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {template.features.map((feature, featureIndex) => (
                        <span
                          key={featureIndex}
                          className={`px-3 py-1 rounded-full text-sm ${
                            isPremium 
                              ? 'bg-primary-100 text-primary-700' 
                              : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-neutral-200"></div>
          <span className="text-neutral-500 font-medium">OR</span>
          <div className="flex-1 h-px bg-neutral-200"></div>
        </div>

        {/* Custom Template Builder */}
        <div className={`rounded-xl border-2 p-6 ${
          isPremium 
            ? 'bg-gradient-to-r from-neutral-50 to-neutral-100 border-neutral-200' 
            : 'bg-gradient-to-r from-neutral-100 to-neutral-200 border-neutral-300'
        }`}>
          <motion.div
            className={`transition-all ${isPremium ? 'cursor-pointer hover:scale-[1.01]' : ''}`}
            onClick={() => handleTemplateSelect('custom')}
            whileHover={isPremium ? { scale: 1.01 } : {}}
          >
            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-xl ${isPremium ? 'bg-primary-200 text-primary-700' : 'bg-neutral-300 text-neutral-600'}`}>
                <Plus className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold mb-2 ${!isPremium ? 'text-neutral-600' : 'text-neutral-900'}`}>
                      Custom Template Builder
                      {!isPremium && (
                        <PremiumFeatureTooltip
                          title="Custom Template Builder"
                          description="Create completely custom onboarding workflows from scratch"
                          benefits={[
                            'Unlimited customization',
                            'Company-specific workflows',
                            'Advanced automation',
                            'Team collaboration tools'
                          ]}
                          className="inline-block ml-2"
                        >
                          <Crown size={20} className="text-yellow-500" />
                        </PremiumFeatureTooltip>
                      )}
                    </h3>
                    <p className={`${!isPremium ? 'text-neutral-500' : 'text-neutral-700'} mb-4`}>
                      Build a completely custom onboarding template with no pre-populated fields. 
                      Perfect for organizations with unique workflows and specific requirements.
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 ${isPremium ? 'text-primary-600' : 'text-neutral-400'}`}>
                    {!isPremium && <Lock size={16} />}
                    <ArrowRight size={20} />
                  </div>
                </div>

                <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${!isPremium ? 'opacity-60' : ''}`}>
                  {[
                    'Unlimited tasks',
                    'Custom missions',
                    'Team integration',
                    'Progress tracking'
                  ].map((feature, index) => (
                    <div key={index} className={`flex items-center gap-2 text-sm ${!isPremium ? 'text-neutral-500' : 'text-neutral-700'}`}>
                      <div className={`w-2 h-2 rounded-full ${isPremium ? 'bg-primary-500' : 'bg-neutral-400'}`} />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Premium Features Showcase */}
        {!isPremium && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Unlock Premium Features</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Take your onboarding to the next level with advanced customization, 
                automation, and analytics designed for growing teams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {premiumFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="p-6 border border-neutral-200 rounded-xl hover:border-primary-200 hover:bg-primary-50 transition-all cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handlePremiumFeatureClick(feature.title)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gradient-to-r from-primary-100 to-primary-200 rounded-xl">
                      <feature.icon size={24} className="text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                      <p className="text-neutral-600 text-sm mb-3">{feature.description}</p>
                      <div className="flex items-center gap-2 text-primary-600 text-sm font-medium">
                        <span>Learn more</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Final CTA */}
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Start Your Premium Trial
              </button>
              <p className="text-sm text-neutral-500 mt-2">
                14-day free trial • No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ isOpen: false, feature: '', context: '' })}
        feature={upgradeModal.feature}
        context={upgradeModal.context}
      />
    </div>
  );
};

export default Templates;