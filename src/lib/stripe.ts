// Subscription plans
export const PLANS = {
  FREE: 'free',
  PREMIUM: 'premium'
} as const;

export const PLAN_FEATURES = {
  [PLANS.FREE]: {
    name: 'Free',
    price: 0,
    features: [
      'Basic onboarding template creation',
      'Limited customization options',
      'Preview functionality',
      'Single user access'
    ]
  },
  [PLANS.PREMIUM]: {
    name: 'Premium',
    price: 49,
    features: [
      'Everything in Free, plus:',
      'Full template customization',
      'Multiple templates',
      'Admin dashboard',
      'Secure sharing with access codes',
      'Email integration',
      'Progress tracking',
      'Template sharing between admins',
      'Real-time updates',
      'Comment system'
    ]
  }
};

// Check subscription status
export const checkSubscriptionStatus = async (userId: string) => {
  try {
    // Return a default free subscription for now
    return {
      id: userId,
      plan: PLANS.FREE,
      status: 'active',
      current_period_end: null,
      cancel_at_period_end: false
    };
  } catch (err) {
    console.error('Error checking subscription status:', err);
    throw err;
  }
};