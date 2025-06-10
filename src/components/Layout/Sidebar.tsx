import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ArrowRightLeft, 
  Users, 
  LogOut,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();

  const navigationItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/', roles: ['Admin', 'Base Commander', 'Logistics Officer'] },
    { icon: ShoppingCart, label: 'Purchases', path: '/purchases', roles: ['Admin', 'Logistics Officer'] },
    { icon: ArrowRightLeft, label: 'Transfers', path: '/transfers', roles: ['Admin', 'Base Commander', 'Logistics Officer'] },
    { icon: Users, label: 'Assignments & Expenditures', path: '/assignments', roles: ['Admin', 'Base Commander', 'Logistics Officer'] }
  ];

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  return (
    <div className="bg-slate-800 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-green-400" />
          <div>
            <h1 className="text-lg font-bold">Military Asset</h1>
            <p className="text-sm text-slate-300">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="mb-4">
          <p className="text-sm text-slate-400">Logged in as</p>
          <p className="font-medium">{user?.full_name}</p>
          <p className="text-xs text-slate-400">
            {user?.roles.map(role => role.role_name).join(', ')}
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-2 w-full px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;