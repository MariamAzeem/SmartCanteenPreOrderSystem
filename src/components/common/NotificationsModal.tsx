import React from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Clock, Info } from 'lucide-react';
import { NotificationItem } from '../../types';
import { storageService } from '../../services/storageService';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onSelectToken?: (token: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onSelectToken,
}) => {
  if (!isOpen) return null;

  const handleMarkRead = (id: string, token?: string) => {
    storageService.markNotificationRead(id);
    if (token && onSelectToken) {
      onSelectToken(token);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-100 text-[#FF7A00]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">Notifications & Alerts</h3>
              <p className="text-xs text-slate-500">Live canteen queue updates and token statuses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-medium text-sm">No new notifications</p>
              <p className="text-xs mt-1">You will receive alerts when your food is preparing or ready.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id, n.tokenNumber)}
                className={`py-3.5 px-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3.5 ${
                  !n.read ? 'bg-orange-50/60 hover:bg-orange-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5">
                  {n.type === 'order_status' ? (
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : n.type === 'alert' ? (
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                      <Info className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  {n.tokenNumber && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[10px] font-bold">
                      Token {n.tokenNumber}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
