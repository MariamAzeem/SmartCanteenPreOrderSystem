import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { Header } from './components/common/Header';
import { DemoModeBar } from './components/common/DemoModeBar';
import { NotificationsModal } from './components/common/NotificationsModal';
import { AuthPage } from './components/auth/AuthPage';
import { MenuCatalog } from './components/customer/MenuCatalog';
import { CartDrawer } from './components/customer/CartDrawer';
import { OrderTrackingView } from './components/customer/OrderTrackingView';
import { OrderHistoryView } from './components/customer/OrderHistoryView';
import { CustomerProfile } from './components/customer/CustomerProfile';
import { KitchenDisplay } from './components/kitchen/KitchenDisplay';
import { TokenCollectionScanner } from './components/kitchen/TokenCollectionScanner';
import { QuickStockToggleModal } from './components/kitchen/QuickStockToggleModal';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { MenuEditor } from './components/manager/MenuEditor';
import { PickupSlotsEditor } from './components/manager/PickupSlotsEditor';
import { AdminUserManagement } from './components/admin/AdminUserManagement';
import { SystemActivityLogs } from './components/admin/SystemActivityLogs';
import { storageService } from './services/storageService';
import { MenuItem, User } from './types';
import { ShieldAlert, ArrowLeft, RotateCcw } from 'lucide-react';

function MainCanteenApp() {
  const { showToast } = useToast();

  // Authentication State: Retrieved strictly from database/storage
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getAuthenticatedUser());

  // URL / Route path synchronization
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/customer';
    }
    return '/customer';
  });

  // Core synchronized application state
  const [menuItems, setMenuItems] = useState<MenuItem[]>(storageService.getMenuItems());
  const [orders, setOrders] = useState(storageService.getOrders());
  const [slots, setSlots] = useState(storageService.getPickupSlots());
  const [limits, setLimits] = useState(storageService.getOrderLimits());
  const [logs, setLogs] = useState(storageService.getLogs());
  const [notifications, setNotifications] = useState(
    currentUser ? storageService.getNotifications(currentUser.id) : []
  );

  // Tab inside role view
  const [activeTab, setActiveTab] = useState<string>('menu');

  // Customer Cart state: { [itemId]: quantity } and { [itemId]: specialInstruction }
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [cartInstructions, setCartInstructions] = useState<{ [itemId: string]: string }>({});

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQuickStockOpen, setIsQuickStockOpen] = useState(false);
  const [focusedToken, setFocusedToken] = useState<string | undefined>(undefined);

  // Sync route helper
  const navigateTo = useCallback((path: string, defaultTab?: string) => {
    setCurrentPath(path);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, []);

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Reactive subscription to storage service
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      const authUser = storageService.getAuthenticatedUser();
      setCurrentUser(authUser);
      setMenuItems(storageService.getMenuItems());
      setOrders(storageService.getOrders());
      setSlots(storageService.getPickupSlots());
      setLimits(storageService.getOrderLimits());
      setLogs(storageService.getLogs());
      if (authUser) {
        setNotifications(storageService.getNotifications(authUser.id));
      }
    });
    return unsubscribe;
  }, []);

  // Set default route and tab when currentUser logs in or changes
  useEffect(() => {
    if (!currentUser) return;
    setNotifications(storageService.getNotifications(currentUser.id));

    // Redirect to that role's own path if currently on generic root or /login
    if (currentPath === '/' || currentPath === '/login') {
      if (currentUser.role === 'customer') {
        navigateTo('/customer', 'menu');
      } else if (currentUser.role === 'staff') {
        navigateTo('/kitchen', 'kitchen');
      } else if (currentUser.role === 'manager') {
        navigateTo('/manager', 'dashboard');
      } else if (currentUser.role === 'admin') {
        navigateTo('/admin', 'admin_users');
      }
    }
  }, [currentUser, currentPath, navigateTo]);

  // Handle Login success
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'customer') {
      navigateTo('/customer', 'menu');
    } else if (user.role === 'staff') {
      navigateTo('/kitchen', 'kitchen');
    } else if (user.role === 'manager') {
      navigateTo('/manager', 'dashboard');
    } else if (user.role === 'admin') {
      navigateTo('/admin', 'admin_users');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setCart({});
    setCartInstructions({});
    navigateTo('/login');
    showToast('You have been logged out securely.', 'info');
  };

  // Cart operations
  const handleAddToCart = (item: MenuItem, instruction?: string) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
    if (instruction) {
      setCartInstructions((prev) => ({
        ...prev,
        [item.id]: instruction,
      }));
    }
    showToast(`Added "${item.name}" to your tray!`, 'success');
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const cur = prev[itemId] || 0;
      const next = cur + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
    setCartInstructions((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const handleClearCart = () => {
    setCart({});
    setCartInstructions({});
  };

  // End-to-end Reorder from past order or order details: Rebuilds cart and opens drawer
  const handleReorder = (
    itemsToAdd: { [itemId: string]: number },
    instructionsToAdd?: { [itemId: string]: string }
  ) => {
    setCart(itemsToAdd);
    if (instructionsToAdd) {
      setCartInstructions(instructionsToAdd);
    } else {
      setCartInstructions({});
    }
    setIsCartOpen(true);
  };

  // Order success transition
  const handleOrderSuccess = (tokenNumber: string) => {
    setFocusedToken(tokenNumber);
    setActiveTab('tracking');
    if (currentPath !== '/customer') {
      navigateTo('/customer', 'tracking');
    }
  };

  // If user is not authenticated, render Login / Register page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F3F6FA]">
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // --- ROUTE GUARDING ---
  // Check if current user is authorized to access the current URL path
  const isCustomerPath = currentPath.startsWith('/customer');
  const isKitchenPath = currentPath.startsWith('/kitchen');
  const isManagerPath = currentPath.startsWith('/manager');
  const isAdminPath = currentPath.startsWith('/admin');

  let isForbidden = false;
  let forbiddenMessage = '';

  if (isCustomerPath && currentUser.role !== 'customer') {
    isForbidden = true;
    forbiddenMessage = `You are currently logged in as a ${currentUser.role.toUpperCase()}. The /customer portal is reserved for students and campus customers.`;
  } else if (isKitchenPath && currentUser.role !== 'staff' && currentUser.role !== 'manager' && currentUser.role !== 'admin') {
    isForbidden = true;
    forbiddenMessage = 'Access Denied (403): The Kitchen Display System (KDS) is restricted to Kitchen Staff and Canteen Management.';
  } else if (isManagerPath && currentUser.role !== 'manager' && currentUser.role !== 'admin') {
    isForbidden = true;
    forbiddenMessage = 'Access Denied (403): The Canteen Management Dashboard is restricted to Canteen Managers.';
  } else if (isAdminPath && currentUser.role !== 'admin') {
    isForbidden = true;
    forbiddenMessage = 'Access Denied (403): System Administration and Audit Logs are restricted to System Administrators.';
  }

  // Active customer orders (CRITICAL PRIVACY: Customers see ONLY their own orders!)
  const customerOrders = orders.filter((o) => o.customerId === currentUser.id);
  const activeCustomerOrders = customerOrders.filter((o) =>
    ['Placed', 'Accepted', 'Preparing', 'Ready'].includes(o.orderStatus)
  );
  const cartTotalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6FA] text-[#25282D]">
      {/* 1. Hackathon Demonstration Bar (Simulations only, role switcher removed) */}
      <DemoModeBar />

      {/* 2. Top Header Navigation (Role-specific layout with Logout button) */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'collection') {
            setIsScannerOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotifsOpen(true)}
        unreadNotifsCount={unreadNotifsCount}
        activeOrdersCount={activeCustomerOrders.length}
      />

      {/* 3. Main Dynamic Content Body with Route Guarding */}
      <main className="flex-1">
        {/* ACCESS DENIED (403) GUARD */}
        {isForbidden ? (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-slate-900">
              403 Forbidden: Access Denied
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto">
              {forbiddenMessage}
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  if (currentUser.role === 'customer') navigateTo('/customer', 'menu');
                  else if (currentUser.role === 'staff') navigateTo('/kitchen', 'kitchen');
                  else if (currentUser.role === 'manager') navigateTo('/manager', 'dashboard');
                  else if (currentUser.role === 'admin') navigateTo('/admin', 'admin_users');
                }}
                className="px-6 py-3 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] text-white font-heading font-bold text-xs shadow-lg shadow-orange-500/25 cursor-pointer transition-all inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to My {currentUser.role.toUpperCase()} Portal
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ---------------- CUSTOMER ROLE PORTAL (/customer) ---------------- */}
            {currentUser.role === 'customer' && (
              <>
                {activeTab === 'menu' && (
                  <MenuCatalog
                    items={menuItems}
                    cart={cart}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onOpenCart={() => setIsCartOpen(true)}
                  />
                )}

                {activeTab === 'tracking' && (
                  <OrderTrackingView
                    orders={customerOrders}
                    onGoToMenu={() => setActiveTab('menu')}
                    selectedToken={focusedToken}
                    onReorder={handleReorder}
                  />
                )}

                {activeTab === 'history' && (
                  <OrderHistoryView
                    orders={customerOrders}
                    menuItems={menuItems}
                    onReorder={handleReorder}
                    onViewToken={(token) => {
                      setFocusedToken(token);
                      setActiveTab('tracking');
                    }}
                  />
                )}

                {activeTab === 'profile' && (
                  <CustomerProfile
                    currentUser={currentUser}
                    onUpdateUser={(updated) => {
                      storageService.updateUserProfile({ id: currentUser.id, ...updated });
                    }}
                  />
                )}
              </>
            )}

            {/* ---------------- KITCHEN STAFF ROLE PORTAL (/kitchen) ---------------- */}
            {currentUser.role === 'staff' && (
              <KitchenDisplay
                orders={orders}
                onOpenScanner={() => setIsScannerOpen(true)}
                onOpenQuickStock={() => setIsQuickStockOpen(true)}
              />
            )}

            {/* ---------------- CANTEEN MANAGER ROLE PORTAL (/manager) ---------------- */}
            {currentUser.role === 'manager' && (
              <>
                {activeTab === 'dashboard' && (
                  <ManagerDashboard
                    currentUser={currentUser}
                    users={storageService.getUsers()}
                    analytics={storageService.getAnalytics()}
                    menuItems={menuItems}
                    orders={orders}
                    pickupSlots={slots}
                    limits={limits}
                  />
                )}

                {activeTab === 'menu_manage' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <MenuEditor menuItems={menuItems} />
                  </div>
                )}

                {activeTab === 'slots_manage' && (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <PickupSlotsEditor slots={slots} limits={limits} />
                  </div>
                )}

                {activeTab === 'kitchen' && (
                  <KitchenDisplay
                    orders={orders}
                    onOpenScanner={() => setIsScannerOpen(true)}
                    onOpenQuickStock={() => setIsQuickStockOpen(true)}
                  />
                )}
              </>
            )}

            {/* ---------------- SYSTEM ADMINISTRATOR ROLE PORTAL (/admin) ---------------- */}
            {currentUser.role === 'admin' && (
              <>
                {activeTab === 'admin_users' && (
                  <AdminUserManagement
                    users={storageService.getUsers()}
                    currentUserId={currentUser.id}
                  />
                )}

                {activeTab === 'admin_logs' && (
                  <SystemActivityLogs logs={logs} />
                )}

                {activeTab === 'dashboard' && (
                  <ManagerDashboard
                    currentUser={currentUser}
                    users={storageService.getUsers()}
                    analytics={storageService.getAnalytics()}
                    menuItems={menuItems}
                    orders={orders}
                    pickupSlots={slots}
                    limits={limits}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* 4. Global Modals & Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        instructions={cartInstructions}
        menuItems={menuItems}
        pickupSlots={slots}
        currentUser={currentUser}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOrderSuccess={handleOrderSuccess}
      />

      <NotificationsModal
        isOpen={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        notifications={notifications}
        onSelectToken={(token) => {
          setFocusedToken(token);
          setActiveTab('tracking');
        }}
      />

      <TokenCollectionScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        orders={orders}
      />

      <QuickStockToggleModal
        isOpen={isQuickStockOpen}
        onClose={() => setIsQuickStockOpen(false)}
        menuItems={menuItems}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainCanteenApp />
    </ToastProvider>
  );
}
