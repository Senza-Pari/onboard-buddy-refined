import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthLayout: React.FC = () => {
  return (
    <motion.div 
      className="min-h-screen bg-neutral-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </motion.div>
  );
};

export default AuthLayout;