import { useState } from 'react';
import toast from 'react-hot-toast';
import Spinner from '../common/Spinner';
import PaymentResultModal from './PaymentResultModal';
import { createOrder, verifyPayment } from '../../api/paymentApi';
import logger from '../../utils/logger';

/**
 * UnlockContactButton — pay-once button that unlocks full mobile numbers
 * account-wide (CONTACT_UNLOCK feature, ₹99). Shown in place of a masked
 * mobile number whenever ProfileResponse.isMobileUnlocked is false.
 *
 * Flow:
 *   1. Create a Razorpay order (amount is decided server-side, never trusted
 *      from this component).
 *   2. Open the Razorpay checkout modal (window.Razorpay — loaded globally
 *      via the checkout.js script tag in index.html).
 *   3. On the modal's success handler, send the three returned fields to the
 *      backend for signature verification.
 *   4. Only call onUnlocked() when the backend responds success: true.
 *      Closing the modal, a dismissed payment, or a failed verification must
 *      NOT be treated as success.
 *
 * Props:
 *   onUnlocked — callback fired after the backend confirms the payment.
 *                Parent page should use this to refresh the profile so the
 *                real mobile number appears without a full page reload.
 */
const UnlockContactButton = ({ targetProfileId = null, feature = 'SINGLE_PROFILE_UNLOCK', label = null, onUnlocked, customClass = "" }) => {
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    isSuccess: true,
    title: '',
    message: '',
    details: {},
  });

  const handleUnlock = async () => {
    setLoading(true);
    try {
      // Step 1: create the order — amount comes back from the backend
      const order = await createOrder(feature, targetProfileId);

      // Step 2: open Razorpay checkout modal
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Prajapati Samaj',
        description: feature === 'SINGLE_PROFILE_UNLOCK' ? 'Unlock single profile contact' : 'Unlock all contact numbers',
        handler: async (response) => {
          // Step 3: verify the payment signature on the backend
          try {
            const result = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            // Step 4: only treat as unlocked if the backend genuinely confirms it
            if (result.success) {
              toast.success(result.message || 'Contact details unlocked!');
              setModalState({
                isOpen: true,
                isSuccess: true,
                title: '🎉 Payment Successful!',
                message: 'You have successfully unlocked the contact details! Mobile number and address are now revealed.',
                details: {
                  feature,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  amount: order.amount,
                },
              });
              if (onUnlocked) onUnlocked();
            } else {
              toast.error(result.message || 'Payment verification failed.');
              setModalState({
                isOpen: true,
                isSuccess: false,
                title: '❌ Verification Failed',
                message: result.message || 'Could not verify payment signature. Please contact support if money was deducted.',
                details: {
                  feature,
                  orderId: response.razorpay_order_id,
                  amount: order.amount,
                },
              });
            }
          } catch (error) {
            logger.error('Payment verification failed', error.response?.data);
            toast.error('Could not verify payment. Please contact support if money was deducted.');
            setModalState({
              isOpen: true,
              isSuccess: false,
              title: '❌ Payment Error',
              message: 'Server error during payment verification. If money was deducted, please contact support.',
              details: { feature, orderId: order.orderId, amount: order.amount },
            });
          } finally {
            setLoading(false);
          }
        },
        // User closed the modal without paying — not an error, just reset the button
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        theme: { color: '#e11d48' },
      };

      if (!window.Razorpay) {
        toast.error('Payment system is not ready. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay(options);

      // Payment failed inside the modal (e.g. card declined) — Razorpay fires
      // this itself, separate from the success handler above.
      razorpay.on('payment.failed', (resp) => {
        toast.error('Payment failed. Please try again.');
        setModalState({
          isOpen: true,
          isSuccess: false,
          title: '❌ Payment Failed',
          message: resp?.error?.description || 'Payment was declined or cancelled. Please try again.',
          details: { feature, orderId: order.orderId, amount: order.amount },
        });
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      logger.error('Could not create payment order', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not start payment. Please try again.');
      setLoading(false);
    }
  };

  const defaultText = feature === 'SINGLE_PROFILE_UNLOCK' 
    ? '🔓 Unlock Profile for ₹9' 
    : '🔓 Unlock Contact Number (₹49)';

  return (
    <>
      <button
        onClick={handleUnlock}
        disabled={loading}
        className={customClass || "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold shadow-md transition disabled:opacity-60 cursor-pointer"}
      >
        {loading ? <Spinner /> : null}
        <span>{loading ? 'Processing...' : (label || defaultText)}</span>
      </button>

      {/* Dedicated Payment Result Modal Popup */}
      <PaymentResultModal
        isOpen={modalState.isOpen}
        isSuccess={modalState.isSuccess}
        title={modalState.title}
        message={modalState.message}
        details={modalState.details}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};

export default UnlockContactButton;
