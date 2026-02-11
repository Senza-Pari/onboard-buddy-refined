import React from 'react';
import { motion } from 'framer-motion';
import { Check, Users, Building2, Building as Buildings, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for individual new hires',
    features: [
      'Personal onboarding tracking',
      'Basic task management',
      'Gallery access',
      'Community support'
    ],
    icon: Users,
    color: 'bg-neutral-100',
    textColor: 'text-neutral-900'
  },
  {
    name: 'Small Team',
    price: 49,
    description: 'Great for small teams up to 20 people',
    features: [
      'Everything in Free, plus:',
      'Admin dashboard',
      'Custom onboarding flows',
      'Team analytics',
      'Priority support',
      'Up to 20 team members'
    ],
    icon: Building2,
    color: 'bg-primary-500',
    textColor: 'text-white',
    popular: true
  },
  {
    name: 'Large Team',
    price: 99,
    description: 'Perfect for growing organizations',
    features: [
      'Everything in Small Team, plus:',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'Dedicated success manager',
      'Up to 100 team members'
    ],
    icon: Buildings,
    color: 'bg-indigo-500',
    textColor: 'text-white'
  },
  {
    name: 'Enterprise',
    price: null,
    description: 'Custom solutions for large organizations',
    features: [
      'Everything in Large Team, plus:',
      'Custom integrations',
      'On-premise deployment option',
      'SLA guarantees',
      'Unlimited team members',
      '24/7 phone support'
    ],
    icon: Phone,
    color: 'bg-neutral-900',
    textColor: 'text-white'
  }
];

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Choose Your Plan
          </motion.h1>
          <motion.p 
            className="text-lg text-neutral-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Select the perfect plan for your team's onboarding needs. All plans include our core features with additional capabilities as you scale.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`rounded-2xl overflow-hidden ${plan.popular ? 'ring-2 ring-primary-500' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`p-8 ${plan.color} ${plan.textColor}`}>
                <div className="flex items-center justify-between mb-4">
                  <plan.icon size={24} />
                  {plan.popular && (
                    <span className="px-3 py-1 text-xs bg-white/20 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  {plan.price === null ? (
                    <span className="text-3xl font-bold">Custom</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="opacity-80">/month</span>
                    </>
                  )}
                </div>
                <p className="opacity-80">{plan.description}</p>
              </div>
              
              <div className="bg-white p-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check size={20} className="text-primary-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8">
                  {plan.price === null ? (
                    <Link
                      to="/contact"
                      className="block w-full py-3 px-6 text-center rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                    >
                      Contact Sales
                    </Link>
                  ) : (
                    <Link
                      to="/signup"
                      state={{ plan: plan.name }}
                      className={`block w-full py-3 px-6 text-center rounded-lg
                        ${plan.popular 
                          ? 'bg-primary-500 text-white hover:bg-primary-600' 
                          : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                        } transition-colors`}
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-neutral-600">
            Need help choosing? <a href="/contact" className="text-primary-600 hover:text-primary-700">Talk to our team</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;