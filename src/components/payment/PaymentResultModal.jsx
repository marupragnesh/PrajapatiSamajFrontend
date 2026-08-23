import { useNavigate } from 'react-router-dom';

/**
 * PaymentResultModal — Dedicated modal popup for payment success or failure feedback.
 *
 * Props:
 *   - isOpen (boolean): controls visibility
 *   - isSuccess (boolean): true for payment success, false for failure
 *   - title (string): custom header title
 *   - message (string): summary message
 *   - details (object): { paymentId, orderId, amount, feature }
 *   - onClose (function): callback when modal is closed
 *   - onSuccessAction (function): optional custom action when user clicks primary button
 */
const PaymentResultModal = ({
  isOpen,
  isSuccess = true,
  title,
  message,
  details = {},
  onClose,
  onSuccessAction,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const defaultTitle = isSuccess ? '🎉 Payment Successful!' : '❌ Payment Failed';
  const defaultMsg = isSuccess
    ? 'Congratulations! Your transaction was verified successfully and your feature is now unlocked.'
    : 'We could not complete your transaction. No money was charged, or your payment is being processed by your bank.';

  const handlePrimaryClick = () => {
    if (onClose) onClose();
    if (isSuccess && onSuccessAction) {
      onSuccessAction();
    } else if (isSuccess) {
      if (details?.feature === 'BIODATA_DOWNLOAD') {
        navigate('/biodata');
      } else {
        navigate('/discover');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-3xl shadow-2xl border border-border dark:border-gray-700 overflow-hidden transform transition-all duration-300 scale-100">
        
        {/* Top Decorative Header Banner */}
        <div
          className={`py-6 px-6 text-center space-y-2 relative ${
            isSuccess
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
              : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto text-3xl shadow-inner border border-white/30">
            {isSuccess ? '✅' : '⚠️'}
          </div>
          <h2 className="text-xl font-black tracking-wide">
            {title || defaultTitle}
          </h2>
          {details?.amount && (
            <p className="text-2xl font-extrabold bg-white/10 inline-block px-4 py-0.5 rounded-full border border-white/20">
              ₹{(details.amount / 100).toFixed(0)} INR
            </p>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed font-medium">
            {message || defaultMsg}
          </p>

          {/* Transaction Metadata Details Card */}
          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 border border-border/70 dark:border-gray-700 space-y-2.5 text-xs">
            {details?.feature && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 dark:text-gray-500 font-medium">Feature:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {details.feature === 'SINGLE_PROFILE_UNLOCK' && '🔓 Single Profile Unlock (₹9)'}
                  {details.feature === 'CONTACT_UNLOCK' && '📞 Contact & Search Filters Pass (₹49)'}
                  {details.feature === 'BIODATA_DOWNLOAD' && '🌟 All-in-One + Biodata Pass (₹99)'}
                  {details.feature === 'DISCOVER_FILTERS' && '🔍 Discover Search Filters (₹49)'}
                </span>
              </div>
            )}

            {details?.paymentId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 dark:text-gray-500 font-medium">Payment ID:</span>
                <span className="font-mono text-[11px] text-gray-700 dark:text-gray-300 font-semibold truncate max-w-[190px]">
                  {details.paymentId}
                </span>
              </div>
            )}

            {details?.orderId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 dark:text-gray-500 font-medium">Order ID:</span>
                <span className="font-mono text-[11px] text-gray-700 dark:text-gray-300 font-semibold truncate max-w-[190px]">
                  {details.orderId}
                </span>
              </div>
            )}

            {isSuccess && (
              <div className="flex justify-between items-center border-t border-border/50 pt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Status &amp; Validity:</span>
                <span>Active (6 Months)</span>
              </div>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handlePrimaryClick}
              className={`w-full py-3 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2 ${
                isSuccess
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isSuccess ? (
                <>
                  <span>✨</span>
                  <span>{onSuccessAction ? 'View Unlocked Contact' : 'Continue'}</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Try Again</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl border border-border dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PaymentResultModal;
