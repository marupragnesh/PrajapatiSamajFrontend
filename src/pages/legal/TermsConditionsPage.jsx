import Navbar from '../../components/common/Navbar';

/**
 * TermsConditionsPage — Copied from Razorpay-site terms-and-conditions.html
 */
const TermsConditionsPage = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-10 shadow-md border border-border space-y-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Legal</span>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">Terms &amp; Conditions</h1>
            <p className="text-xs text-gray-400 mt-1">Last updated: July 2026</p>
          </div>

          <div className="prose dark:prose-invert text-sm text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed border-t border-border pt-6">
            <p>
              These Terms &amp; Conditions govern your use of pragneshmaru.online and any services engaged through it. By contacting me for a project, you agree to these terms.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Services</h2>
            <p>
              I offer freelance web and software development services, including custom web applications, backend systems, and ongoing maintenance. Exact scope, deliverables, and timelines for a project are agreed in writing before work begins.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Use of This Website</h2>
            <p>
              This website is provided for informational purposes, to help you understand my services and get in touch. You agree not to misuse the site, attempt to interfere with its operation, or use it for any unlawful purpose.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Intellectual Property</h2>
            <p>
              All content on this website — text, design, and code — belongs to Pragnesh Maru unless otherwise stated. For client projects, ownership of the final delivered work transfers to the client upon full payment, as specified in the individual project agreement.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Client Responsibilities</h2>
            <p>
              You agree to provide accurate project requirements, timely feedback, and any content or access needed to complete the work. Delays in providing these may affect project timelines.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Payment Terms</h2>
            <p>
              Payment terms are agreed per project and outlined in the quote or invoice. See the Cancellation &amp; Refund Policy for cancellation terms.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Limitation of Liability</h2>
            <p>
              While I take care to deliver reliable, well-tested software, I am not liable for indirect or consequential losses arising from the use of delivered work, to the fullest extent permitted by law.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Governing Law</h2>
            <p>
              These terms are governed by the laws of India.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Changes to These Terms</h2>
            <p>
              These terms may be updated from time to time. Continued use of this website after changes means you accept the updated terms.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Contact</h2>
            <p>
              Questions about these terms can be sent to{' '}
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

export default TermsConditionsPage;
