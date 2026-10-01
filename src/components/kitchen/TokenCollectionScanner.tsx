import React, { useState } from 'react';
import { X, ScanLine, CheckCircle2, ShieldAlert, AlertTriangle, QrCode, Camera } from 'lucide-react';
import { Order } from '../../types';
import { storageService } from '../../services/storageService';
import { soundService } from '../../services/soundService';
import { useToast } from '../common/Toast';

interface TokenCollectionScannerProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const TokenCollectionScanner: React.FC<TokenCollectionScannerProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  const { showToast } = useToast();
  const [tokenInput, setTokenInput] = useState('');
  const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);
  const [statusAlert, setStatusAlert] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'cancelled' | 'collected' | 'not_ready'>('collected');
  const [isScanningQR, setIsScanningQR] = useState(false);

  if (!isOpen) return null;

  const handleLookupToken = (targetToken: string) => {
    setStatusAlert(null);
    setVerifiedOrder(null);

    const cleaned = targetToken.trim().toUpperCase();
    if (!cleaned) return;

    const order = orders.find(
      (o) => o.tokenNumber.toUpperCase() === cleaned || o.id === targetToken
    );

    if (!order) {
      showToast(`Token "${targetToken}" not found in database.`, 'error');
      return;
    }

    // 1. REJECT CANCELLED OR VOID TOKENS
    if (order.orderStatus === 'Cancelled' || order.orderStatus === 'Rejected') {
      setStatusAlert(`VOID TOKEN REJECTED: Order ${order.tokenNumber} was cancelled. Food must NOT be released!`);
      setAlertType('cancelled');
      soundService.playWarning();
      setVerifiedOrder(order);
      return;
    }

    // 2. PREVENT DOUBLE COLLECTION
    if (order.orderStatus === 'Collected' || order.orderStatus === 'Completed') {
      const timeStr = order.collectedAt
        ? new Date(order.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'earlier';
      setStatusAlert(`DUPLICATE COLLECTION BLOCKED: Token ${order.tokenNumber} was ALREADY COLLECTED at ${timeStr}. Food must not be released again!`);
      setAlertType('collected');
      soundService.playWarning();
      setVerifiedOrder(order);
      return;
    }

    // 3. CHECK IF NOT READY YET
    if (order.orderStatus !== 'Ready') {
      setStatusAlert(`Order ${order.tokenNumber} is currently in "${order.orderStatus}" stage, not marked Ready yet.`);
      setAlertType('not_ready');
      soundService.playWarning();
      setVerifiedOrder(order);
      return;
    }

    setVerifiedOrder(order);
  };

  const handleConfirmHandover = () => {
    if (!verifiedOrder) return;
    try {
      storageService.collectOrder(verifiedOrder.tokenNumber, 'Chef Bilal (Counter #1)');
      soundService.playOrderPlaced();
      showToast(`Token ${verifiedOrder.tokenNumber} verified & food collected successfully!`, 'success');
      setVerifiedOrder(null);
      setTokenInput('');
      setStatusAlert(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error confirming handover';
      showToast(msg, 'error');
    }
  };

  const handleSimulateQRScan = () => {
    setIsScanningQR(true);
    // Find the next ready or pending order to simulate scanning
    setTimeout(() => {
      const candidate = orders.find((o) => o.orderStatus === 'Ready') || orders[0];
      setIsScanningQR(false);
      if (candidate) {
        setTokenInput(candidate.tokenNumber);
        handleLookupToken(candidate.tokenNumber);
        showToast(`QR Code Scanned: Token ${candidate.tokenNumber}`, 'info');
      } else {
        showToast('No active token detected in camera frame.', 'info');
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#25282D] text-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF7A00] text-white shadow-md shadow-orange-500/20">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Verify & Collect
              </h3>
              <p className="text-xs text-slate-400">
                Single Counter Pickup Station • Verify Token or QR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Token Search Input & QR Scan Option */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookupToken(tokenInput);
          }}
          className="space-y-3"
        >
          <label className="block text-xs font-bold text-slate-300">
            Type Token (e.g. C-021) or Scan Customer QR:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. C-021"
              autoFocus
              className="flex-1 p-3 rounded-2xl bg-black/40 border border-white/20 text-white font-mono font-bold text-base placeholder:text-slate-500 uppercase focus:ring-2 focus:ring-[#FF7A00] focus:outline-hidden"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-[#FF7A00] hover:bg-[#e66e00] font-heading font-bold text-xs text-white transition-all shadow-md shadow-orange-500/20 cursor-pointer"
            >
              Verify
            </button>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSimulateQRScan}
              disabled={isScanningQR}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#FF7A00]" />
              <span>{isScanningQR ? 'Scanning Optical QR...' : 'Scan Customer QR Code'}</span>
            </button>
          </div>
        </form>

        {/* Status Alerts: Double Collection or Cancelled/Void Token */}
        {statusAlert && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
              alertType === 'cancelled'
                ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                : alertType === 'collected'
                ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                : 'bg-blue-500/20 border-blue-500 text-blue-200'
            }`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-xs uppercase tracking-wider">
                {alertType === 'cancelled'
                  ? 'Void Token Warning'
                  : alertType === 'collected'
                  ? 'Duplicate Collection Warning'
                  : 'Stage Notice'}
              </h4>
              <p className="leading-relaxed">{statusAlert}</p>
            </div>
          </div>
        )}

        {/* Order Details Preview */}
        {verifiedOrder && (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div>
                <span className="font-heading font-extrabold text-2xl text-[#FF7A00]">
                  {verifiedOrder.tokenNumber}
                </span>
                <p className="text-xs text-slate-300 font-semibold">{verifiedOrder.customerName}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  verifiedOrder.orderStatus === 'Ready'
                    ? 'bg-emerald-500 text-white'
                    : verifiedOrder.orderStatus === 'Cancelled'
                    ? 'bg-rose-600 text-white'
                    : verifiedOrder.orderStatus === 'Completed' || verifiedOrder.orderStatus === 'Collected'
                    ? 'bg-blue-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {verifiedOrder.orderStatus.toUpperCase()}
              </span>
            </div>

            {/* Items in ticket */}
            <div className="space-y-1 text-xs">
              <p className="text-[11px] text-slate-400 font-bold uppercase">Items on Tray:</p>
              {verifiedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-200">
                  <span>
                    {item.quantity}x {item.name}
                    {item.specialInstruction && (
                      <span className="text-[10px] text-amber-300 block">
                        Note: {item.specialInstruction}
                      </span>
                    )}
                  </span>
                  <span className="text-slate-400">Rs. {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-bold">
              <span>Total Bill ({verifiedOrder.paymentMethod.toUpperCase()})</span>
              <span className="text-emerald-400">Rs. {verifiedOrder.totalAmount}</span>
            </div>

            {/* Handover Action button */}
            {verifiedOrder.orderStatus === 'Ready' && (
              <button
                onClick={handleConfirmHandover}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Food Handover & Mark Collected</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
