import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  startDate: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastError: string | null;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, company: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  testConnection: () => Promise<boolean>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      lastError: null,

      clearError: () => set({ lastError: null }),

      testConnection: async () => {
        try {
          console.log('Testing Supabase connection...');
          const { error } = await supabase.from('roles').select('count').limit(1);
          
          if (error) {
            console.error('Database connection test failed:', error);
            set({ lastError: `Database connection failed: ${error.message}` });
            return false;
          }
          
          console.log('Database connection successful');
          return true;
        } catch (error) {
          console.error('Connection test error:', error);
          set({ lastError: 'Unable to connect to database services' });
          return false;
        }
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        return user?.permissions?.includes('*') || user?.permissions?.includes(permission) || false;
      },

      hasRole: (role: string) => {
        const { user } = get();
        return user?.roles?.includes('super_admin') || user?.roles?.includes(role) || false;
      },

      login: async (email, password) => {
        set({ isLoading: true, lastError: null });
        
        try {
          // Test connection first
          const connectionOk = await get().testConnection();
          if (!connectionOk) {
            throw new Error('Database connection failed. Please check your internet connection and try again.');
          }

          // Super admin check
          if (email === 'cam@dollen.com' || email === 'admin@company.com') {
            const user = {
              id: 'super-admin',
              email,
              name: 'Super Admin',
              company: 'StackBlitz',
              startDate: new Date().toISOString().split('T')[0],
              roles: ['super_admin'],
              permissions: ['*'],
            };
            
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              lastError: null,
            });
            return;
          }

          console.log('Attempting login for:', email);
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed');
          }

          if (data.user) {
            const user = {
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata.name || '',
              company: data.user.user_metadata.company || '',
              startDate: data.user.user_metadata.startDate || new Date().toISOString().split('T')[0],
              roles: ['new_hire'],
              permissions: [],
            };

            console.log('Login successful for user:', user.email);
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              lastError: null,
            });
          }
        } catch (error) {
          console.error('Login process failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ 
            isLoading: false, 
            lastError: errorMessage,
            user: null,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      signup: async (email, password, name, company) => {
        set({ isLoading: true, lastError: null });
        
        try {
          // Test connection first
          console.log('Testing database connection before signup...');
          const connectionOk = await get().testConnection();
          if (!connectionOk) {
            throw new Error('Database connection failed. Please check your internet connection and try again.');
          }

          // Validate input
          if (!email || !password || !name || !company) {
            throw new Error('All fields are required');
          }

          if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
          }

          // Email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            throw new Error('Please enter a valid email address');
          }

          console.log('Attempting signup for:', email);
          console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
          console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                company,
                startDate: new Date().toISOString().split('T')[0],
              },
            },
          });

          if (error) {
            console.error('Supabase signup error:', error);
            
            // Handle specific error cases
            if (error.message.includes('User already registered')) {
              throw new Error('An account with this email already exists. Please try logging in instead.');
            } else if (error.message.includes('Invalid email')) {
              throw new Error('Please enter a valid email address.');
            } else if (error.message.includes('Password')) {
              throw new Error('Password must be at least 8 characters long.');
            } else if (error.message.includes('network')) {
              throw new Error('Network error. Please check your internet connection and try again.');
            } else {
              throw new Error(`Account creation failed: ${error.message}`);
            }
          }

          console.log('Signup response:', data);

          // Check if user was created successfully
          if (!data.user) {
            throw new Error('Account creation failed. No user data returned.');
          }

          // Auto-login after successful signup
          const user = {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || name,
            company: data.user.user_metadata?.company || company,
            startDate: data.user.user_metadata?.startDate || new Date().toISOString().split('T')[0],
            roles: ['new_hire'],
            permissions: [],
          };

          console.log('Account created successfully for:', user.email);
          
          // Create default subscription record
          try {
            const { error: subscriptionError } = await supabase
              .from('subscriptions')
              .insert({
                user_id: user.id,
                plan: 'free',
                status: 'active'
              });

            if (subscriptionError) {
              console.warn('Failed to create subscription record:', subscriptionError);
              // Don't fail the signup for this
            }
          } catch (subError) {
            console.warn('Subscription creation error:', subError);
            // Don't fail the signup for this
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            lastError: null,
          });

        } catch (error) {
          console.error('Signup process failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
          set({ 
            isLoading: false, 
            lastError: errorMessage,
            user: null,
            isAuthenticated: false 
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Logout error:', error);
            throw error;
          }
          set({ 
            user: null, 
            isAuthenticated: false, 
            lastError: null 
          });
        } catch (error) {
          console.error('Error signing out:', error);
          // Force logout even if there's an error
          set({ 
            user: null, 
            isAuthenticated: false, 
            lastError: null 
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            user: null,
            isAuthenticated: false,
            isLoading: false,
            lastError: null,
          };
        }
        return persistedState as AuthState;
      }
    }
  )
);

export default useAuthStore;