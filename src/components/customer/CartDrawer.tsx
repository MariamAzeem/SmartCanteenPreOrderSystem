import React, { useState } from 'react';
import { X, Trash2, Clock, Calendar, ShieldCheck, CreditCard, Wallet, Banknote, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MenuItem, PickupSlot, PaymentMethod, User } from '../../types';
import { storageService } from '../../services/storageService';
import { paymentService, validateLuhn, detectCardBrand } from '../../services/paymentService';
import { queueEngine } from '../../services/queueEngine';
import { soundService } from '../../services/soundService';
import { useToast } from '../common/Toast';

interface CartItemData {
  item: MenuItem;
  quantity: number;
  specialInstruction?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { [itemId: string]: number };
  instructions: { [itemId: string]: string };
  menuItems: MenuItem[];
  pickupSlots: PickupSlot[];
  currentUser: User;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onOrderSuccess: (tokenNumber: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  instructions,
  menuItems,
  pickupSlots,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
}) => {
  const { showToast } = useToast();

  const [pickupType, setPickupType] = useState<'immediate' | 'scheduled'>('immediate');
  const [selectedSlot, setSelectedSlot] = useState<string>(pickupSlots.find((s) => s.status !== 'Full')?.timeWindow || '12:30 PM - 12:45 PM');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('easypaisa');

  // Payment form states
  const [walletPhone, setWalletPhone] = useState(currentUser.phone || '03001234567');
  const [walletOtp, setWalletOtp] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser.name || 'Ali Khan');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );

  // CRITICAL FIX: Generate fresh unique idempotency key every time the checkout drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setIdempotencyKey(
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build items array
  const cartEntries: CartItemData[] = Object.entries(cart)
    .map(([itemId, quantity]) => {
      const item = menuItems.find((m) => m.id === itemId);
      if (!item) return null;
      return {
        item,
        quantity,
        specialInstruction: instructions[itemId],
      };
    })
    .filter(Boolean) as CartItemData[];

  const subtotal = cartEntries.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0);

  // Calculate live ETA preview
  const limits = storageService.getOrderLimits();
  const activeOrders = storageService.getOrders().filter((o) => ['Placed', 'Accepted', 'Preparing'].includes(o.orderStatus));
  const etaCalculation = queueEngine.calculateETA(
    cartEntries.map((c) => ({
      id: c.item.id,
      itemId: c.item.id,
      name: c.item.name,
      price: c.item.price,
      quantity: c.quantity,
      preparationTime: c.item.preparationTime,
    })),
    activeOrders.length,
    limits
  );

  const cardBrand = detectCardBrand(cardNumber);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartEntries.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    // Validation
    if (paymentMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s+/g, '').length < 15) {
        showToast('Please enter a valid 16-digit card number.', 'error');
        return;
      }
      if (!validateLuhn(cardNumber)) {
        showToast('Card number failed Luhn validation checksum.', 'error');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        showToast('Please enter a 3-digit CVV.', 'error');
        return;
      }
    } else if (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') {
      if (!walletPhone || walletPhone.length < 10) {
        showToast('Please enter an 11-digit mobile wallet number.', 'error');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Process payment via provider
      const payResult = await paymentService.processPayment({
        method: paymentMethod,
        amount: subtotal,
        phone: walletPhone,
        otp: walletOtp || '1234',
        cardNumber,
        cardExpiry,
        cardCvv,
        cardHolder,
        idempotencyKey,
      });

      if (!payResult.success) {
        throw new Error(payResult.error || 'Payment failed. Please try again.');
      }

      // 2. Atomically place order in storage & reserve stock
      const order = storageService.placeOrder({
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone || walletPhone,
        items: cartEntries.map((c) => ({
          itemId: c.item.id,
          quantity: c.quantity,
          specialInstruction: c.specialInstruction,
        })),
        pickupTime: pickupType === 'scheduled' ? selectedSlot : 'Immediate',
        paymentMethod,
        paymentStatus: payResult.status,
        paymentReference: payResult.transactionReference,
        idempotencyKey,
      });

      // 3. Trigger confetti celebration & sound
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF7A00', '#FFB36B', '#10B981'],
      });
      soundService.playOrderPlaced();

      showToast(`🎉 Order confirmed! Token ${order.tokenNumber} issued.`, 'success');
      setIdempotencyKey(
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      );
      onClearCart();
      onClose();
      onOrderSuccess(order.tokenNumber);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fade-in">
      <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="font-heading font-extrabold text-lg text-slate-900">Your Canteen Tray</h2>
            <p className="text-xs text-slate-500">
              {cartEntries.length} items • Estimated Prep: ~{etaCalculation.estimatedPrepMinutes} mins
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cartEntries.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Banknote className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-heading font-bold text-slate-700 text-sm">Your tray is empty</p>
              <p className="text-xs text-slate-400">Add food items from the menu to schedule pre-orders.</p>
            </div>
          ) : (
            <>
              {/* Item list */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Order Items</h3>
                <div className="divide-y divide-slate-100">
                  {cartEntries.map(({ item, quantity, specialInstruction }) => (
                    <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-2xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between">
                          <h4 className="font-heading font-bold text-xs text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <span className="font-bold text-xs text-[#FF7A00] ml-2">
                            Rs. {item.price * quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[11px] text-slate-500">Rs. {item.price} each</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#FF7A00]" /> ⏱ {item.preparationTime} min
                          </span>
                        </div>

                        {specialInstruction && (
                          <p className="text-[10px] text-amber-700 bg-amber-50 rounded-md px-1.5 py-0.5 mt-1 inline-block">
                            Note: "{specialInstruction}"
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="font-bold text-xs">{quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            disabled={quantity >= item.availableQuantity}
                            className="w-6 h-6 rounded-lg bg-[#FF7A00] text-white text-xs font-bold flex items-center justify-center disabled:opacity-40"
                          >
                            +
                          </button>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="ml-auto text-slate-400 hover:text-rose-500 p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup Time Option */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#FF7A00]" /> Pickup Scheduling
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPickupType('immediate')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      pickupType === 'immediate'
                        ? 'border-[#FF7A00] bg-orange-50/50 ring-1 ring-[#FF7A00]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Clock className="w-3.5 h-3.5 text-[#FF7A00]" /> Immediate
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Cook immediately (~{etaCalculation.estimatedPrepMinutes}m)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPickupType('scheduled')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      pickupType === 'scheduled'
                        ? 'border-[#FF7A00] bg-orange-50/50 ring-1 ring-[#FF7A00]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Calendar className="w-3.5 h-3.5 text-[#FF7A00]" /> Pre-Order Slot
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Schedule for lunch break</p>
                  </button>
                </div>

                {pickupType === 'scheduled' && (
                  <div className="space-y-2 mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 animate-fade-in">
                    <label className="block text-xs font-semibold text-slate-700">
                      Select 15-Minute Pickup Slot:
                    </label>
                    <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {pickupSlots.map((slot) => {
                        const isFull = slot.status === 'Full';
                        return (
                          <div
                            key={slot.id}
                            onClick={() => !isFull && setSelectedSlot(slot.timeWindow)}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-all ${
                              selectedSlot === slot.timeWindow && !isFull
                                ? 'bg-orange-100 border-[#FF7A00] text-slate-900 font-bold'
                                : isFull
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <span>{slot.timeWindow}</span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                slot.status === 'Full'
                                  ? 'bg-rose-100 text-rose-700'
                                  : slot.status === 'Filling'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {slot.status} ({slot.currentBooked}/{slot.maxCapacity})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Payment Method
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('easypaisa')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'easypaisa'
                        ? 'border-[#FF7A00] bg-orange-50 ring-1 ring-[#FF7A00]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">Easypaisa</span>
                    <span className="text-[10px] text-slate-500">Mobile Wallet OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('jazzcash')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'jazzcash'
                        ? 'border-[#FF7A00] bg-orange-50 ring-1 ring-[#FF7A00]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">JazzCash</span>
                    <span className="text-[10px] text-slate-500">Mobile Wallet OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-[#FF7A00] bg-orange-50 ring-1 ring-[#FF7A00]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">Cash on Pickup</span>
                    <span className="text-[10px] text-slate-500">Pay at counter tray</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#FF7A00] bg-orange-50 ring-1 ring-[#FF7A00]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs text-slate-900 block">Credit/Debit Card</span>
                    <span className="text-[10px] text-slate-500">Visa / Mastercard / PayPak</span>
                  </button>
                </div>

                {/* Sub-form for Mobile Wallet */}
                {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-fade-in text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Registered {paymentMethod === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value)}
                        placeholder="03001234567"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#FF7A00] focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Sandbox Wallet PIN / OTP (Enter 1234)
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={walletOtp}
                        onChange={(e) => setWalletOtp(e.target.value)}
                        placeholder="1234"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono tracking-widest text-center"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-form for Card */}
                {paymentMethod === 'card' && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-fade-in text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Ali Khan"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-slate-700 font-semibold">Card Number</label>
                        <span className="text-[10px] font-bold uppercase text-[#FF7A00]">{cardBrand}</span>
                      </div>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 8765 4321 0987"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Expiry MM/YY</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="891"
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Bottom Actions */}
        {cartEntries.length > 0 && (
          <div className="p-5 border-t border-slate-200 bg-white space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-xs text-slate-800 bg-orange-50 p-2.5 rounded-xl border border-orange-200/60 font-semibold mb-2">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Clock className="w-4 h-4 text-[#FF7A00]" /> Total Estimated Prep:
                </span>
                <span className="text-[#FF7A00] font-bold">
                  ~{etaCalculation.estimatedPrepMinutes} mins • Ready by {new Date(etaCalculation.estimatedReadyTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Service Fee & Tax</span>
                <span className="text-emerald-600 font-medium">Rs. 0 (Free Campus Rate)</span>
              </div>
              <div className="flex justify-between font-heading font-extrabold text-base text-slate-900 pt-1 border-t border-slate-100">
                <span>Total Payable</span>
                <span className="text-[#FF7A00]">Rs. {subtotal}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] active:scale-98 text-white font-heading font-bold text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Generating Token & Locking Stock...</span>
              ) : (
                <>
                  <span>Confirm Pre-Order (Rs. {subtotal})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400">
              Protected by idempotency constraint. Stock locked atomically upon confirmation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
