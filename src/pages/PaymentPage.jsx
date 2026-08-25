import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import PaymentResultModal from '../components/payment/PaymentResultModal';
import { createOrder, verifyPayment, getPaymentStatus } from '../api/paymentApi';
import { getMyProfile } from '../api/profileApi';
import logger from '../utils/logger';

/**
 * PaymentPage — Dedicated 2-Month Premium Membership Page.
 */
const PaymentPage = () => {
  const [status, setStatus] = useState({
    contactUnlocked: false,
    filtersUnlocked: false,
    biodataUnlocked: false,
    daysRemaining: null,
    isFirstWeekOffer: true,
    contactPrice: 49,
    biodataPrice: 99,
    offerDaysRemaining: null,
  });
  const [profile, setProfile] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [processingFeature, setProcessingFeature] = useState(null);

  const [modalState, setModalState] = useState({
    isOpen: false,
    isSuccess: true,
    title: '',
    message: '',
    details: {},
  });

  const fetchData = async () => {
    try {
      const [statusData, profileData] = await Promise.all([
        getPaymentStatus(),
        getMyProfile().catch(() => null),
      ]);
      setStatus(statusData);
      setProfile(profileData);
    } catch (error) {
      logger.error('Failed to fetch payment status', error);
      toast.error('Could not load payment status.');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const contactPrice = status.contactPrice || 49;
  const biodataPrice = status.biodataPrice || 99;

  const handlePay = async (featureName) => {
    setProcessingFeature(featureName);
    try {
      const order = await createOrder(featureName);

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Prajapati Samaj',
        description: featureName === 'CONTACT_UNLOCK'
          ? `2-Month Contact & Search Filter Pass (₹${contactPrice} Incl. 18% GST)`
          : `2-Month All-in-One + Biodata Pass (₹${biodataPrice} Incl. 18% GST)`,
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (result.success) {
              toast.success('Congratulations! Membership Activated!');
              await fetchData();
              setModalState({
                isOpen: true,
                isSuccess: true,
                title: '🎉 Premium Membership Activated!',
                message: featureName === 'BIODATA_DOWNLOAD'
                  ? 'Your All-in-One + Biodata Pass is active for 60 days (2 Months)! All mobile numbers, search filters, and A4 Biodata PDF downloads are unlocked.'
                  : 'Your Contact & Search Filters Pass is active for 60 days (2 Months)! All mobile numbers and advanced discover filters are unlocked.',
                details: {
                  feature: featureName,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  amount: order.amount,
                },
              });
            } else {
              toast.error(result.message || 'Payment verification failed.');
              setModalState({
                isOpen: true,
                isSuccess: false,
                title: '❌ Verification Failed',
                message: result.message || 'Could not verify payment signature. Contact support if money was deducted.',
                details: { feature: featureName, orderId: response.razorpay_order_id, amount: order.amount },
              });
            }
          } catch (error) {
            logger.error('Payment verification failed', error.response?.data);
            toast.error('Payment verification error. Contact support if deducted.');
            setModalState({
              isOpen: true,
              isSuccess: false,
              title: '❌ Payment Error',
              message: 'Server error during payment verification. If money was deducted, please contact support.',
              details: { feature: featureName, orderId: order.orderId, amount: order.amount },
            });
          } finally {
            setProcessingFeature(null);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingFeature(null);
          },
        },
        theme: { color: '#B5451B' },
      };

      if (!window.Razorpay) {
        toast.error('Payment gateway unavailable. Please refresh and try again.');
        setProcessingFeature(null);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (resp) => {
        toast.error('Payment failed. Please try again.');
        setModalState({
          isOpen: true,
          isSuccess: false,
          title: '❌ Payment Failed',
          message: resp?.error?.description || 'Transaction declined or cancelled. Please try again.',
          details: { feature: featureName, orderId: order.orderId, amount: order.amount },
        });
        setProcessingFeature(null);
      });
      razorpay.open();
    } catch (error) {
      logger.error('Payment initialization failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not initiate payment.');
      setProcessingFeature(null);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary">💎 Choose Your Premium Membership</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Select the membership plan that best fits your search needs. Plans include full 2-month access.
          </p>
        </div>

        {/* 1-Week Introductory Offer Banner */}
        {status.isFirstWeekOffer && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white rounded-2xl p-4 md:p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-amber-300/40">
            <div className="flex items-center gap-3 text-center md:text-left">
              <span className="text-3xl">🔥</span>
              <div>
                <h3 className="font-extrabold text-base md:text-lg tracking-wide">
                  Special Introductory Offer — Valid for 1 Week Only!
                </h3>
                <p className="text-xs md:text-sm text-amber-100 font-medium">
                  Unlock plans now at special offer prices (₹49 &amp; ₹99). Prices increase to ₹69 &amp; ₹129 after your first week!
                </p>
              </div>
            </div>
            {status.offerDaysRemaining !== null && status.offerDaysRemaining !== undefined && (
              <span className="px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-extrabold text-xs whitespace-nowrap border border-white/30">
                ⏳ {status.offerDaysRemaining} day{status.offerDaysRemaining !== 1 ? 's' : ''} remaining
              </span>
            )}
          </div>
        )}

        {loadingStatus ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* 3 Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              
              {/* PLAN 0: ₹9 Single Profile Pass */}
              <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-lg border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between space-y-5 relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-border/60 dark:border-gray-700 pb-4">
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        🔓 Single Profile Pass
                      </span>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">
                        Unlock 1 Profile Contact
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">₹9</p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">Incl. 18% GST</p>
                      <p className="text-xs text-gray-400 font-medium">Per Profile</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-200">
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </span>
                      <span><strong>Instant Contact Reveal:</strong> Pay only for the exact profile you are interested in.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </span>
                      <span><strong>Permanent Access:</strong> Once unlocked, view their mobile number anytime.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </span>
                      <span><strong>Easy Direct Button:</strong> Available directly on any user's profile page.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <Link
                    to="/discover"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow cursor-pointer text-center block"
                  >
                    Browse Profiles &amp; Unlock for ₹9
                  </Link>
                </div>
              </div>

              {/* PLAN 1: Contact Pass (₹49 or ₹69) */}
              <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-lg border border-border/80 dark:border-gray-700 flex flex-col justify-between space-y-5 relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-border/60 dark:border-gray-700 pb-4">
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        📞 All Contacts Pass
                      </span>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">
                        All Contacts &amp; Filters
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">₹{contactPrice}</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">Incl. 18% GST</p>
                      <p className="text-xs text-gray-400 font-medium">Valid for 2 Months</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-200">
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </span>
                      <span><strong>Unlock All Mobile Numbers:</strong> See phone numbers &amp; addresses account-wide.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </span>
                      <span><strong>Advanced Search Filters:</strong> Filter by Age, Diet, Marital Status &amp; Surname.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </span>
                      <span><strong>2 Months Validity:</strong> 60 days uninterrupted access.</span>
                    </li>
                  </ul>
                </div>

                <div>
                  {status.contactUnlocked ? (
                    <div className="w-full py-2.5 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-bold text-center text-xs flex flex-col items-center justify-center gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span>✅</span> All Contacts Unlocked
                      </div>
                      {status.daysRemaining !== null && status.daysRemaining !== undefined && !status.biodataUnlocked && (
                        <span className="text-[11px] font-semibold text-green-600 dark:text-green-400">
                          ({status.daysRemaining} days remaining)
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePay('CONTACT_UNLOCK')}
                      disabled={processingFeature !== null}
                      className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-60"
                    >
                      {processingFeature === 'CONTACT_UNLOCK' ? <Spinner size="sm" /> : `Pay & Unlock All Contacts (₹${contactPrice} Incl. GST)`}
                    </button>
                  )}
                </div>
              </div>

              {/* PLAN 2: All-in-One Pass (₹99 or ₹129) */}
              <div className="bg-white dark:bg-card-dark rounded-3xl p-6 shadow-xl border-2 border-primary/60 dark:border-primary/80 flex flex-col justify-between space-y-5 relative overflow-hidden ring-4 ring-primary/10">
                <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-extrabold uppercase px-3 py-0.5 rounded-bl-lg tracking-wider">
                  MOST POPULAR
                </div>

                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-border/60 dark:border-gray-700 pb-4">
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                        🌟 All-in-One + Biodata
                      </span>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-2">
                        Full Pass &amp; Biodata PDF
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-extrabold text-primary">₹{biodataPrice}</p>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Incl. 18% GST</p>
                      <p className="text-xs text-gray-400 font-medium">Valid for 2 Months</p>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-200">
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </span>
                      <span><strong>Unlock All Mobile Numbers:</strong> Full phone &amp; address access account-wide.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </span>
                      <span><strong>Advanced Discover Filters:</strong> Filter by Age, Diet, Marital Status &amp; Surname.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-[10px]">
                        ★
                      </span>
                      <span><strong>Marriage Biodata PDF Download:</strong> Download un-watermarked A4 PDF in all 6 traditional themes!</span>
                    </li>
                    {status.contactUnlocked && !status.biodataUnlocked && (
                      <li className="flex items-center gap-2 text-primary font-bold">
                        <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px]">
                          ⚡
                        </span>
                        <span>Upgrade: Resets your membership to fresh 60 days!</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  {status.biodataUnlocked ? (
                    <div className="w-full py-2.5 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 font-bold text-center text-xs flex flex-col items-center justify-center gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span>✅</span> Full All-in-One Pass Active
                      </div>
                      {status.daysRemaining !== null && status.daysRemaining !== undefined && (
                        <span className="text-[11px] font-semibold text-green-600 dark:text-green-400">
                          ({status.daysRemaining} days remaining)
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePay('BIODATA_DOWNLOAD')}
                      disabled={processingFeature !== null}
                      className="w-full py-3 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-light transition flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-60"
                    >
                      {processingFeature === 'BIODATA_DOWNLOAD' ? (
                        <Spinner size="sm" />
                      ) : status.contactUnlocked ? (
                        `Upgrade to All-in-One Pass (₹${biodataPrice}) (Resets 2 Months)`
                      ) : (
                        `Pay & Unlock All-in-One Pass (₹${biodataPrice} Incl. GST)`
                      )}
                    </button>
                  )}
                </div>

              </div>
            </div>
          </>
        )}
      </div>

      {/* Dedicated Payment Result Modal Popup */}
      <PaymentResultModal
        isOpen={modalState.isOpen}
        isSuccess={modalState.isSuccess}
        title={modalState.title}
        message={modalState.message}
        details={modalState.details}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};


export default PaymentPage;
