import Navbar from '../../components/common/Navbar';

/**
 * DisclaimerPage — Copied from Razorpay-site disclaimer.html
 */
const DisclaimerPage = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-10 shadow-md border border-border space-y-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Legal</span>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">Disclaimer</h1>
            <p className="text-xs text-gray-400 mt-1">Last updated: July 2026</p>
          </div>

          <div className="prose dark:prose-invert text-sm text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed border-t border-border pt-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">General Information</h2>
            <p>
              The content on this website is provided for general informational purposes about my services. It is not a guarantee of specific outcomes, timelines, or results for any project.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">No Professional Guarantee</h2>
            <p>
              Any services I provide are subject to the specific written agreement made with you for that project. Nothing on this website constitutes a binding offer or contract on its own.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">External Links</h2>
            <p>
              This website may link to third-party websites or tools. I am not responsible for the content, accuracy, or practices of those external sites.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Limitation of Liability</h2>
            <p>
              While I make reasonable efforts to keep the information on this site accurate and up to date, I make no warranties about its completeness and am not liable for any loss arising from reliance on it.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Contact</h2>
            <p>
              Questions about this disclaimer can be sent to{' '}
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

export default DisclaimerPage;
