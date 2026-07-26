import Navbar from '../../components/common/Navbar';

/**
 * PrivacyPolicyPage — Copied from Razorpay-site privacy-policy.html
 */
const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-10 shadow-md border border-border space-y-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Legal</span>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">Privacy Policy</h1>
            <p className="text-xs text-gray-400 mt-1">Last updated: July 2026</p>
          </div>

          <div className="prose dark:prose-invert text-sm text-gray-700 dark:text-gray-300 space-y-4 leading-relaxed border-t border-border pt-6">
            <p>
              This Privacy Policy explains how Pragnesh Maru ("I", "me") collects, uses, and protects information when you visit pragneshmaru.online or contact me about a project.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Information I Collect</h2>
            <p>
              I only collect information you choose to give me — for example, when you email me or call about a project. This may include your name, email address, phone number, and any project details you share.
            </p>
            <p>
              This website does not use tracking cookies or third-party advertising scripts, and does not automatically collect personal data through forms, since there are no data-collecting forms on this site.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">How I Use Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To respond to your enquiry and discuss your project</li>
              <li>To prepare quotes, proposals, and project communication</li>
              <li>To deliver agreed-upon work and provide support</li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Data Sharing</h2>
            <p>
              I do not sell, rent, or trade your personal information. Information is not shared with third parties except where required by law, or where a project explicitly requires sharing details with a service you've asked me to integrate with.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Data Security</h2>
            <p>
              I take reasonable steps to protect any information you share with me, including keeping project communication and files in secure, access-controlled locations.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Your Rights</h2>
            <p>
              You can ask me at any time what information I hold about you, and request that it be corrected or deleted, subject to any legal or contractual obligations that require me to retain it.
            </p>

            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 pt-2">Changes to This Policy</h2>
            <p>
              This policy may be updated from time to time. Changes will be posted on this page with an updated date.
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

export default PrivacyPolicyPage;
