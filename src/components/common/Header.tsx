import React from 'react';
import { UtensilsCrossed, Bell, ShoppingBag, Flame, LogOut } from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  activeOrdersCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  cartCount,
  onOpenCart,
  onOpenNotifications,
  unreadNotifsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand ONLY (No top nav options) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#FF7A00] to-[#FFB36B] flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <UtensilsCrossed className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg sm:text-xl text-[#25282D] tracking-tight">
                  Smart<span className="text-[#FF7A00]">Canteen</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
                  <Flame className="w-3 h-3 mr-0.5" /> LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Pre-Order & Token System</p>
            </div>
          </div>

          {/* Right Action Icons: Notification bell, Customer Cart, Profile Menu & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Cart Icon (Customer Only) */}
            {currentUser.role === 'customer' && (
              <button
                onClick={onOpenCart}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-semibold text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Tray</span>
                {cartCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-[#FF7A00] text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile Menu & Role Badge */}
            <div className="flex items-center pl-2 sm:border-l sm:border-slate-200 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#25282D] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[9px] font-bold text-[#FF7A00] uppercase tracking-wider mt-0.5">
                    {currentUser.role}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1"
                title="Log out of session"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
