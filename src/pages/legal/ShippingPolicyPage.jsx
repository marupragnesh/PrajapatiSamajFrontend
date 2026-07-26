import Navbar from '../../components/common/Navbar';

/**
 * ShippingPolicyPage — Copied from Razorpay-site shipping-policy.html
 */
const ShippingPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-10 shadow-md border border-border space-y-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Legal</span>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">Shipping Policy</h1>
            <p className="text-xs text-gray-400 mt-1">Last updated: July 2026</p>
          </div>

          <div className="prose dark:prose-invert text-sm text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed border-t border-border pt-6">
            <p>
              All services offered through pragneshmaru.online are digital and delivered remotely — including source code, documentation, and deployed applications. This business does not sell or ship any physical goods, so a traditional shipping policy does not apply.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Delivery of Digital Work</h2>
            <p>
              Delivery timelines for project work are agreed individually per project and outlined in the project scope or agreement. Completed work is typically delivered via email, a code repository, or a live deployment link, as appropriate for the project.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Contact</h2>
            <p>
              Questions about delivery of a project can be sent to{' '}
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

export default ShippingPolicyPage;
