import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import useNotificationStore from '../stores/notificationStore';
import type { Notification } from '../stores/notificationStore';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'success':
      return <Check className="text-green-500" size={18} />;
    case 'warning':
      return <AlertTriangle className="text-yellow-500" size={18} />;
    case 'error':
      return <AlertCircle className="text-red-500" size={18} />;
    default:
      return <Info className="text-primary-500" size={18} />;
  }
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    unreadCount,
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotificationStore();

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="absolute right-4 top-16 w-96 bg-white rounded-lg shadow-lg overflow-hidden"
        initial={{ opacity: 0, y: -20, x: 20 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: -20, x: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={20} />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button onClick={onClose}>
              <X size={20} className="text-neutral-500 hover:text-neutral-700" />
            </button>
          </div>
        </div>

        {notifications.length > 0 ? (
          <>
            <div className="max-h-[400px] overflow-y-auto">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 ${
                      !notification.read ? 'bg-neutral-50' : ''
                    }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <NotificationIcon type={notification.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{notification.title}</h3>
                            <p className="text-sm text-neutral-600 mt-1">
                              {notification.message}
                            </p>
                            {notification.link && (
                              <Link
                                to={notification.link}
                                className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block"
                                onClick={() => {
                                  markAsRead(notification.id);
                                  onClose();
                                }}
                              >
                                View details
                              </Link>
                            )}
                          </div>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-neutral-400 hover:text-neutral-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-primary-600 hover:text-primary-700 mt-2"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex justify-between">
              <button
                onClick={markAllAsRead}
                className="text-sm text-neutral-600 hover:text-neutral-800"
              >
                Mark all as read
              </button>
              <button
                onClick={clearAll}
                className="text-sm text-neutral-600 hover:text-neutral-800"
              >
                Clear all
              </button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-neutral-500">
            <Bell size={24} className="mx-auto mb-2 text-neutral-400" />
            <p>No notifications</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default NotificationCenter;