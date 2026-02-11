import { useEffect, useState } from 'react';
import useAuthStore from '../stores/authStore';
import { checkSubscriptionStatus } from '../lib/stripe';
import type { Tables } from '../lib/supabase';

type Subscription = Tables<'subscriptions'>;

export function useSubscription() {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        // Super admin is always premium
        if (user.email === 'cam@dollen.com') {
          setSubscription({
            id: 'super-admin',
            user_id: user.id,
            plan: 'premium',
            status: 'active',
            stripe_customer_id: null,
            stripe_subscription_id: null,
            current_period_end: null,
            cancel_at_period_end: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setLoading(false);
          return;
        }

        const sub = await checkSubscriptionStatus(user.id);
        setSubscription(sub);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';
  
  return {
    subscription,
    loading,
    error,
    isPremium,
  };
}

export default useSubscription;