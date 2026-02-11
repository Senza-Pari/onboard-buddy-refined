import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface EditScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  title: string;
  hasUnsavedChanges?: boolean;
  children: React.ReactNode;
}

const EditScreen: React.FC<EditScreenProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  hasUnsavedChanges = false,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (hasUnsavedChanges) {
          const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
          if (confirmed) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, hasUnsavedChanges, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!contentRef.current) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - startY.current;
    
    // Only allow dragging down
    if (deltaY < 0) return;
    
    currentY.current = touch.clientY;
    contentRef.current.style.transform = `translateY(${deltaY}px)`;
  };

  const handleTouchEnd = () => {
    if (!contentRef.current) return;
    
    const deltaY = currentY.current - startY.current;
    const threshold = window.innerHeight * 0.2; // 20% of screen height
    
    if (deltaY > threshold) {
      if (hasUnsavedChanges) {
        const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
        if (confirmed) {
          onClose();
        } else {
          // Reset position if user cancels
          contentRef.current.style.transform = 'translateY(0)';
        }
      } else {
        onClose();
      }
    } else {
      // Reset position if not dragged enough
      contentRef.current.style.transform = 'translateY(0)';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          className="fixed inset-0 z-50 bg-black/50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === containerRef.current) {
              if (hasUnsavedChanges) {
                const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
                if (confirmed) onClose();
              } else {
                onClose();
              }
            }
          }}
        >
          <motion.div
            ref={contentRef}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl flex flex-col max-h-[90vh]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex-shrink-0 px-4 py-3 border-b flex items-center justify-between bg-white">
              <div className="absolute left-1/2 -translate-x-1/2 w-12 h-1 -top-6 bg-white rounded-full opacity-75" />
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
                    if (confirmed) onClose();
                  } else {
                    onClose();
                  }
                }}
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {children}
            </div>

            {onSave && (
              <div className="flex-shrink-0 bg-white border-t p-4">
                <button
                  onClick={onSave}
                  className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
                >
                  Save Changes
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditScreen;