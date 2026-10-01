import React from 'react';
import {
  UtensilsCrossed,
  Clock,
  History,
  User as UserIcon,
  ChefHat,
  ScanLine,
  Layers,
  LayoutDashboard,
  Eye,
  Calendar,
  Users,
  ShieldCheck,
  BarChart3,
  Server,
  FolderTree,
} from 'lucide-react';
import { User, Role } from '../../types';

interface BottomNavProps {
  currentUser: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeOrdersCount: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  activeOrdersCount,
}) => {
  let navItems: NavItem[] = [];

  if (currentUser.role === 'customer') {
    navItems = [
      { id: 'menu', label: 'Menu & Order', icon: UtensilsCrossed },
      { id: 'tracking', label: 'Live Tracking', icon: Clock, badge: activeOrdersCount },
      { id: 'history', label: 'Order History', icon: History },
      { id: 'profile', label: 'My Account', icon: UserIcon },
    ];
  } else if (currentUser.role === 'staff') {
    navItems = [
      { id: 'kitchen', label: 'Kitchen KDS', icon: ChefHat },
      { id: 'collection', label: 'Verify & Collect', icon: ScanLine },
      { id: 'quick_stock', label: 'Stock Toggles', icon: Layers },
    ];
  } else if (currentUser.role === 'manager') {
    navItems = [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'queue_monitor', label: 'Queue Monitor', icon: Eye },
      { id: 'menu_stock', label: 'Menu & Stock', icon: Layers },
      { id: 'slots_limits', label: 'Slots & Limits', icon: Calendar },
      { id: 'staff', label: 'Staff Accounts', icon: Users },
    ];
  } else if (currentUser.role === 'admin') {
    navItems = [
      { id: 'admin_overview', label: 'System Overview', icon: Server },
      { id: 'admin_users', label: 'Users', icon: Users },
      { id: 'admin_permissions', label: 'Canteen Accounts', icon: ShieldCheck },
      { id: 'admin_categories', label: 'Categories', icon: FolderTree },
      { id: 'admin_reports', label: 'Reports', icon: BarChart3 },
    ];
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around h-16 sm:h-18">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 px-1 transition-all cursor-pointer select-none group ${
                  isActive ? 'text-[#FF7A00]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <div
                    className={`p-1.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-orange-50 text-[#FF7A00] scale-105'
                        : 'group-hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#FF7A00] text-white shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-medium mt-0.5 tracking-tight truncate max-w-[80px] sm:max-w-none ${
                    isActive ? 'font-bold text-[#FF7A00]' : 'text-slate-600'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-1 w-8 h-0.5 bg-[#FF7A00] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
