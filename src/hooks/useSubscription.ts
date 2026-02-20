export function useSubscription() {
  return {
    subscription: null,
    loading: false,
    error: null,
    isPremium: true,
  };
}

export default useSubscription;