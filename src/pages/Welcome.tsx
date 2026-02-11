import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import useImageStore from '../stores/imageStore';

const Welcome: React.FC = () => {
  const { welcomeBackground } = useImageStore();
  
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${welcomeBackground})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Transform Your Onboarding Experience
          </motion.h1>
          
          <motion.p
            className="text-lg md:text-xl text-neutral-100 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Create seamless onboarding journeys for your team. Track progress, connect with 
            colleagues, and make every new hire's first days memorable.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link 
              to="/signup" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Sign Up Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center px-8 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
            >
              Sign In
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;