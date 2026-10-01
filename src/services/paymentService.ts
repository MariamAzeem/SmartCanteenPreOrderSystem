import { PaymentMethod, PaymentStatus } from '../types';

export interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  phone?: string;
  otp?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolder?: string;
  idempotencyKey: string;
}

export interface PaymentResult {
  success: boolean;
  status: PaymentStatus;
  transactionReference?: string;
  error?: string;
}

export interface PaymentProvider {
  processPayment(details: PaymentDetails): Promise<PaymentResult>;
  refundPayment(reference: string, amount: number): Promise<boolean>;
}

// Helper: Luhn Algorithm Validation
export function validateLuhn(cardNumber: string): boolean {
  const sanitized = cardNumber.replace(/\D/g, '');
  if (sanitized.length < 13 || sanitized.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function detectCardBrand(number: string): 'visa' | 'mastercard' | 'paypak' | 'unknown' {
  const sanitized = number.replace(/\s+/g, '');
  if (/^4/.test(sanitized)) return 'visa';
  if (/^5[1-5]/.test(sanitized) || /^2[2-7]/.test(sanitized)) return 'mastercard';
  if (/^(5081|6011|62)/.test(sanitized)) return 'paypak';
  return 'unknown';
}

class SandboxPaymentService implements PaymentProvider {
  async processPayment(details: PaymentDetails): Promise<PaymentResult> {
    // 1. Cash on Pickup is always approved with "pending" payment status
    if (details.method === 'cash') {
      return {
        success: true,
        status: 'pending',
        transactionReference: `CASH-${Date.now().toString(36).toUpperCase()}`,
      };
    }

    // 2. Mobile Wallets (Easypaisa / JazzCash)
    if (details.method === 'easypaisa' || details.method === 'jazzcash') {
      if (!details.phone || details.phone.replace(/\D/g, '').length < 10) {
        return {
          success: false,
          status: 'failed',
          error: 'Please enter a valid 11-digit mobile wallet number.',
        };
      }

      if (details.otp && details.otp !== '1234' && details.otp.length !== 4) {
        return {
          success: false,
          status: 'failed',
          error: 'Invalid wallet OTP. (Demo sandbox pin is 1234 or any 4 digits).',
        };
      }

      // Simulate network latency
      await new Promise((r) => setTimeout(r, 600));

      const prefix = details.method === 'easypaisa' ? 'EP' : 'JC';
      return {
        success: true,
        status: 'paid',
        transactionReference: `${prefix}-${Math.floor(1000000 + Math.random() * 9000000)}`,
      };
    }

    // 3. Card Payment
    if (details.method === 'card') {
      const cleanNum = (details.cardNumber || '').replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        return {
          success: false,
          status: 'failed',
          error: 'Please enter a valid 16-digit card number.',
        };
      }

      if (!details.cardCvv || details.cardCvv.length < 3) {
        return {
          success: false,
          status: 'failed',
          error: 'Invalid CVV security code.',
        };
      }

      await new Promise((r) => setTimeout(r, 700));

      return {
        success: true,
        status: 'paid',
        transactionReference: `CARD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      };
    }

    return {
      success: false,
      status: 'failed',
      error: 'Unsupported payment method',
    };
  }

  async refundPayment(reference: string, amount: number): Promise<boolean> {
    console.log(`[Payment Refund] Refunding Rs. ${amount} for txn ${reference}`);
    return true;
  }
}

export const paymentService = new SandboxPaymentService();
