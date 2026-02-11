import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { verifyActivationCode } from '../lib/activation';
import useAuthStore from '../stores/authStore';

const ActivateAccount: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activationCode, setActivationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const email = searchParams.get('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isValid = await verifyActivationCode(email, activationCode);
      
      if (isValid) {
        navigate('/dashboard');
      } else {
        setError('Invalid or expired activation code');
      }
    } catch (err) {
      setError('Failed to verify activation code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center text-neutral-700 hover:text-neutral-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Welcome
        </button>
      </div>

      <motion.div 
        className="max-w-md mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold mb-6">Activate Your Account</h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Activation Code
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="Enter your activation code"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
              pattern="[A-Z0-9-]+"
            />
            <p className="mt-1 text-sm text-neutral-500">
              Enter the activation code sent to your email
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary relative"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 size={24} className="mr-2 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              <span>Activate Account</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ActivateAccount;