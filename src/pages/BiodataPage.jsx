import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import BiodataPreview from '../components/biodata/BiodataPreview';
import { createOrder, verifyPayment, getPaymentStatus } from '../api/paymentApi';
import { getMyProfile } from '../api/profileApi';
import logger from '../utils/logger';

/**
 * BiodataPage — Dedicated Marriage Biodata Studio Page.
 * Accessible from Navbar /biodata.
 * Allows users to choose from 6 traditional themes, preview auto-filled biodata, and download PDF.
 */
const BiodataPage = () => {
  const [status, setStatus] = useState({ contactUnlocked: false, filtersUnlocked: false, biodataUnlocked: false });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPay, setProcessingPay] = useState(false);

  // ONLY ₹99 Pass (status.biodataUnlocked) unlocks Marriage Biodata PDF Download
  const isUnlocked = Boolean(status.biodataUnlocked);

  const fetchData = async () => {
    try {
      const [statusData, profileData] = await Promise.all([
        getPaymentStatus(),
        getMyProfile().catch(() => null),
      ]);
      setStatus(statusData);
      setProfile(profileData);
    } catch (error) {
      logger.error('Failed to load Biodata Studio data', error);
      toast.error('Could not load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePay = async () => {
    setProcessingPay(true);
    try {
      const order = await createOrder('LEVEL_1');

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Prajapati Samaj',
        description: '2-Month Level 1 Membership (₹99 - Biodata PDF Download & All Profiles)',
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (result.success) {
              toast.success('Congratulations! Level 1 Membership Activated!');
              await fetchData();
            } else {
              toast.error(result.message || 'Payment verification failed.');
            }
          } catch (error) {
            logger.error('Payment verification failed', error.response?.data);
            toast.error('Payment verification error. Contact support if deducted.');
          } finally {
            setProcessingPay(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPay(false);
          },
        },
        theme: { color: '#B5451B' },
      };

      if (!window.Razorpay) {
        toast.error('Payment gateway unavailable. Please refresh and try again.');
        setProcessingPay(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setProcessingPay(false);
      });
      razorpay.open();
    } catch (error) {
      logger.error('Payment initialization failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not initiate payment.');
      setProcessingPay(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Page Banner */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            🌸 Traditional Marriage Biodata Generator
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary">📜 Marriage Biodata Studio</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Create and download clean, elegant single-page Marriage Biodata auto-filled with your registered profile details &amp; active DP photo.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <BiodataPreview
            profile={profile}
            isUnlocked={isUnlocked}
            onPayNow={handlePay}
            userEmail={profile?.email}
          />
        )}
      </div>
    </div>
  );
};

export default BiodataPage;
