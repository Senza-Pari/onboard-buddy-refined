import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/authStore';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const navigate = useNavigate();
  const { signup, testConnection, lastError, clearError } = useAuthStore();

  // Test connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking');
      const isConnected = await testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    };
    
    checkConnection();
  }, [testConnection]);

  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (error || lastError) {
      setError(null);
      clearError();
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return 'Full name is required';
    }
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    if (!formData.password) {
      return 'Password is required';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!formData.company.trim()) {
      return 'Company name is required';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    clearError();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check connection before attempting signup
    if (connectionStatus === 'disconnected') {
      setError('No database connection. Please check your internet connection and try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      await signup(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.company.trim()
      );
      
      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
      
      // Check if the error indicates user already exists
      if (errorMessage.includes('User already registered') || 
          errorMessage.includes('already exists') ||
          errorMessage.includes('user_already_exists')) {
        // Redirect to login page with the email pre-filled
        navigate('/login', { state: { email: formData.email.trim() } });
        return;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const retryConnection = async () => {
    setConnectionStatus('checking');
    const isConnected = await testConnection();
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  };

  const displayError = error || lastError;

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-neutral-700 hover:text-neutral-900">
          <ArrowLeft size={20} className="mr-2" />
          Back to Welcome
        </Link>
      </div>
      
      <motion.div 
        className="max-w-md mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold mb-6">Create your account</h1>
        
        {/* Connection Status */}
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
          connectionStatus === 'connected' ? 'bg-green-50 text-green-700' :
          connectionStatus === 'disconnected' ? 'bg-red-50 text-red-700' :
          'bg-yellow-50 text-yellow-700'
        }`}>
          {connectionStatus === 'connected' && <CheckCircle size={16} />}
          {connectionStatus === 'disconnected' && <WifiOff size={16} />}
          {connectionStatus === 'checking' && <Wifi size={16} className="animate-pulse" />}
          
          <span>
            {connectionStatus === 'connected' && 'Database connection established'}
            {connectionStatus === 'disconnected' && 'Database connection failed'}
            {connectionStatus === 'checking' && 'Checking database connection...'}
          </span>
          
          {connectionStatus === 'disconnected' && (
            <button
              onClick={retryConnection}
              className="ml-auto text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="input-field"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input-field"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-neutral-500">
              Must be at least 8 characters
            </p>
          </div>
          
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-neutral-700 mb-1">
              Company Name
            </label>
            <input
              id="company"
              name="company"
              type="text"
              required
              className="input-field"
              placeholder="Acme Inc."
              value={formData.company}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          {displayError && (
            <motion.div
              className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Account Creation Failed</p>
                <p>{displayError}</p>
              </div>
            </motion.div>
          )}
          
          <button 
            type="submit" 
            className="btn-primary mt-6 relative"
            disabled={isLoading || connectionStatus === 'disconnected'}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Creating account...
              </>
            ) : 'Create Account'}
          </button>

          {connectionStatus === 'disconnected' && (
            <p className="text-xs text-red-600 text-center">
              Account creation is disabled due to connection issues
            </p>
          )}
        </form>
        
        <p className="mt-6 text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Log in
          </Link>
        </p>

        {/* Debug Information (only in development) */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-neutral-100 rounded-lg text-xs">
            <h4 className="font-medium mb-2">Debug Information:</h4>
            <ul className="space-y-1 text-neutral-600">
              <li>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</li>
              <li>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</li>
              <li>Connection Status: {connectionStatus}</li>
              <li>Last Error: {lastError || 'None'}</li>
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SignUp;