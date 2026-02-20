import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Trophy, Users, Image } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/missions', icon: Trophy, label: 'Missions' },
  { path: '/people', icon: Users, label: 'People' },
  { path: '/gallery', icon: Image, label: 'Gallery' },
];

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-neutral-200 md:hidden bottom-nav-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium mt-0.5">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
