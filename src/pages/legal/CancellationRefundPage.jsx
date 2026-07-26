import Navbar from '../../components/common/Navbar';

/**
 * CancellationRefundPage — Copied from Razorpay-site cancellation-refund-policy.html
 */
const CancellationRefundPage = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-10 shadow-md border border-border space-y-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Legal</span>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">Cancellation &amp; Refund Policy</h1>
            <p className="text-xs text-gray-400 mt-1">Last updated: July 2026</p>
          </div>

          <div className="prose dark:prose-invert text-sm text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed border-t border-border pt-6">
            <p>
              This policy explains how project cancellations and refunds are handled for services booked through pragneshmaru.online.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Cancelling a Project</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Before work begins:</strong> If you cancel before any work has started, you receive a full refund of any advance paid.
              </li>
              <li>
                <strong>After work has started:</strong> If you cancel after work has begun, the refund is calculated based on the work already completed. You are charged only for the portion of the project delivered, and the remaining advance is refunded.
              </li>
              <li>
                <strong>Completed milestones:</strong> Work that has already been delivered and approved by you is non-refundable.
              </li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Refund Timelines</h2>
            <p>
              Once a refund is approved, it is processed within <strong>5–7 business days</strong> to the original payment method used.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">How to Request a Cancellation or Refund</h2>
            <p>
              Email{' '}
              <a href="mailto:pragneshmaru12112001@gmail.com" className="text-primary font-semibold hover:underline">
                pragneshmaru12112001@gmail.com
              </a>{' '}
              with your project details and the reason for cancellation. I'll confirm the refund amount, if any, within 2 business days.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Non-Refundable Items</h2>
            <p>
              Third-party costs already incurred on your behalf (such as domain names, licenses, or paid services purchased specifically for your project) are non-refundable once spent.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Contact</h2>
            <p>
              Questions about this policy can be sent to{' '}
              <a href="mailto:pragneshmaru12112001@gmail.com" className="text-primary font-semibold hover:underline">
                pragneshmaru12112001@gmail.com
              </a>.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-border">
        &copy; 2026 Pragnesh Maru. All rights reserved.
      </footer>
    </div>
  );
};

export default CancellationRefundPage;
