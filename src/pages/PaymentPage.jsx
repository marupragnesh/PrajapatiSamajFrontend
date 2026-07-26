import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import { createOrder, verifyPayment, getPaymentStatus } from '../api/paymentApi';
import logger from '../utils/logger';

/**
 * PaymentPage — Dedicated 6-Month Premium Membership Page.
 *
 * Single All-in-One Card (₹99 for 6 months):
 *   - Unlocks full mobile numbers account-wide
 *   - Unlocks premium Discover search filters
 */
const PaymentPage = () => {
  const [status, setStatus] = useState({ contactUnlocked: false, filtersUnlocked: false });
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [processing, setProcessing] = useState(false);

  const isUnlocked = status.contactUnlocked || status.filtersUnlocked;

  const fetchStatus = async () => {
    try {
      const data = await getPaymentStatus();
      setStatus(data);
    } catch (error) {
      logger.error('Failed to fetch payment status', error);
      toast.error('Could not load payment status.');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handlePay = async () => {
    setProcessing(true);
    try {
      // Create order for CONTACT_UNLOCK feature (₹99)
      const order = await createOrder('CONTACT_UNLOCK');

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Prajapati Samaj',
        description: '6 Months All-in-One Premium Membership',
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (result.success) {
              toast.success('Congratulations! 6-Month Premium Membership Activated!');
              await fetchStatus();
            } else {
              toast.error(result.message || 'Payment verification failed.');
            }
          } catch (error) {
            logger.error('Payment verification failed', error.response?.data);
            toast.error('Payment verification error. Contact support if deducted.');
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
        theme: { color: '#B5451B' },
      };

      if (!window.Razorpay) {
        toast.error('Payment gateway unavailable. Please refresh and try again.');
        setProcessing(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setProcessing(false);
      });
      razorpay.open();
    } catch (error) {
      logger.error('Payment initialization failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not initiate payment.');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-primary">💎 Premium Membership</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Get complete access to contact details and advanced search filters for 6 months.
          </p>
        </div>

        {loadingStatus ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="bg-white dark:bg-card-dark rounded-3xl p-8 shadow-xl border border-border/80 dark:border-gray-700 space-y-6">
            {/* Header Badge & Price */}
            <div className="flex items-start justify-between border-b border-border/60 dark:border-gray-700 pb-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  🌟 All-in-One Pass
                </span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  6-Month Premium Access
                </h2>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-primary">₹99</p>
                <p className="text-xs text-gray-400 font-medium">Valid for 6 Months</p>
              </div>
            </div>

            {/* Included Benefits */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Included Benefits:</p>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                  <span><strong>Unlock All Contact Numbers:</strong> View full mobile numbers for every profile account-wide.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                  <span><strong>Premium Discover Filters:</strong> Filter candidates by Age, Height, Diet, Marital Status & Surname.</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-xs">
                    ✓
                  </span>
                  <span><strong>6 Months Validity:</strong> Enjoy full access for 6 complete months.</span>
                </li>
              </ul>
            </div>

            {/* Status & CTA Button */}
            <div className="pt-2">
              {isUnlocked ? (
                <div className="w-full py-3.5 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-bold text-center text-sm flex items-center justify-center gap-2">
                  <span>✅</span> Active 6-Month Premium Pass
                </div>
              ) : (
                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-base hover:bg-primary-light transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-60"
                >
                  {processing ? <Spinner size="sm" /> : 'Pay & Activate Premium (₹99 for 6 Months)'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
