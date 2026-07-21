import axiosInstance from './axiosInstance';
import logger from '../utils/logger';

/**
 * paymentApi — Razorpay payment endpoints.
 *
 * Two-step flow used by UnlockContactButton:
 *   1. createOrder(feature)   → backend creates a Razorpay order, amount is
 *      decided server-side from `feature` (never trusted from this file).
 *   2. verifyPayment({...})   → after the Razorpay checkout modal succeeds,
 *      send back the three fields it returns so the backend can verify the
 *      HMAC-SHA256 signature. Only a `success: true` response means the
 *      payment is genuinely confirmed — never assume success just because
 *      the checkout modal closed.
 */

/**
 * POST /api/payments/create-order — create a Razorpay order for a feature.
 * @param {string} feature - one of the PaymentFeature enum values (e.g. 'CONTACT_UNLOCK')
 * @returns {Promise<{orderId, amount, currency, keyId}>}
 */
export const createOrder = async (feature) => {
  logger.api('POST', '/api/payments/create-order');
  const response = await axiosInstance.post('/api/payments/create-order', { feature });
  logger.response('/api/payments/create-order', response.data);
  return response.data;
};

/**
 * POST /api/payments/verify — verify a completed payment's signature.
 * @param {{razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string}} payload
 *        These three fields come directly from the Razorpay checkout success handler.
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const verifyPayment = async (payload) => {
  logger.api('POST', '/api/payments/verify');
  const response = await axiosInstance.post('/api/payments/verify', payload);
  logger.response('/api/payments/verify', response.data);
  return response.data;
};
