import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import { getTodayRegistrationsCount } from '../api/profileApi';
import logger from '../utils/logger';

/**
 * AboutDeveloperPage — Developer Bio, Daily Registration Stats & Legal links.
 *
 * Features:
 *   - Shows count of user profiles created today with a live Refresh button
 *   - Direct contact info via email: pragneshmaru12112001@gmail.com
 *   - Developer description & core principles
 *   - Project idea proposal card
 *   - Links to all 5 Legal policies copied from Razorpay site
 */
const AboutDeveloperPage = () => {
  const [totalUsers, setTotalUsers]   = useState(null);
  const [todayCount, setTodayCount]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [ideaText, setIdeaText]       = useState('');

  const fetchTodayCount = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      logger.api('GET', '/api/stats/today-registrations');
      const res = await getTodayRegistrationsCount();
      logger.response('/api/stats/today-registrations', res);
      setTotalUsers(res?.totalUsersCount ?? res?.data?.totalUsersCount ?? 0);
      setTodayCount(res?.todayRegistrationsCount ?? res?.data?.todayRegistrationsCount ?? 0);
      if (isManualRefresh) {
        toast.success('Registration counts updated!');
      }
    } catch (error) {
      logger.error('Failed to fetch registration counts', error);
      toast.error('Could not load registration counts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodayCount();
  }, []);

  const handleSendIdea = (e) => {
    e.preventDefault();
    if (!ideaText.trim()) {
      toast.error('Please enter your project idea before sending.');
      return;
    }
    const mailtoUrl = `mailto:pragneshmaru12112001@gmail.com?subject=Project%20Idea%20Proposal&body=${encodeURIComponent(ideaText)}`;
    window.location.href = mailtoUrl;
    toast.success('Opening your email client to send project idea!');
    setIdeaText('');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 space-y-8">
        
        {/* ── Top Hero Banner ── */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-8 shadow-md border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary dark:bg-primary/20">
              Developer &amp; Platform Stats
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              Hi, I'm Pragnesh Maru 👋
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl">
              Full-Stack Java Spring Boot &amp; Web Developer building community platforms, robust backend systems, and clean web applications.
            </p>
          </div>
          
          <a
            href="mailto:pragneshmaru12112001@gmail.com"
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-light transition shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <span>✉️</span> Get in Touch
          </a>
        </div>

        {/* ── Platform Stats Counter (Total Users & Today New Users) ── */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 dark:to-card-dark border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 w-full sm:w-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Live Community Growth
            </p>
            <div className="flex flex-wrap items-center gap-6">
              {/* Total Users */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  👥
                </div>
                <div>
                  <div className="text-2xl font-black text-primary">
                    {loading ? <Spinner size="sm" /> : (totalUsers !== null ? totalUsers : 0)}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Total Registered Users
                  </div>
                </div>
              </div>

              {/* Today Users */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl font-bold">
                  🚀
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {loading ? <Spinner size="sm" /> : (todayCount !== null ? todayCount : 0)}
                  </div>
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Created Today
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => fetchTodayCount(true)}
            disabled={refreshing || loading}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-border dark:border-gray-600 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 shrink-0 self-stretch sm:self-auto justify-center"
          >
            {refreshing ? <Spinner size="sm" /> : <span>🔄</span>}
            {refreshing ? 'Refreshing...' : 'Refresh Count'}
          </button>
        </div>

        {/* ── Project Idea Proposal Box (Placed UP for easy access) ── */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-8 shadow-md border border-border space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
              💡
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Have an idea for a project you want developed?
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tell me about your project or features you'd like to build together!
              </p>
            </div>
          </div>

          <form onSubmit={handleSendIdea} className="space-y-3">
            <textarea
              rows={4}
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="Describe your project idea, custom web app requirements, or feature requests here..."
              className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-gray-400">
                Direct Email: <a href="mailto:pragneshmaru12112001@gmail.com" className="text-primary hover:underline font-semibold">pragneshmaru12112001@gmail.com</a>
              </p>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-light transition cursor-pointer shadow-md flex items-center gap-2"
              >
                <span>🚀</span> Send Project Idea
              </button>
            </div>
          </form>
        </div>

        {/* ── About Me & Engineering Philosophy (Placed AFTER Project Idea) ── */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-8 shadow-md border border-border space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 border-b border-border pb-3 flex items-center gap-2">
            <span>💻</span> About Me &amp; Engineering Philosophy
          </h2>
          <div className="prose dark:prose-invert text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-3">
            <p>
              I care about clean architecture as much as I care about the finished product — code that's organized into clear layers, easy to test, and easy for someone else (or future me) to pick up without a long explanation.
            </p>
            <p>
              Every project starts with understanding what you actually need, not just what's technically interesting to build. That usually means a short conversation before any code gets written.
            </p>
          </div>

          {/* 3 Core Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-border dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">📐 Clear Structure</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Controllers, services, and repositories stay strictly separated — no mixed responsibilities.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-border dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">📖 Readable Code</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Short, purposeful comments and clear naming, so the code explains itself.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-border dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1">🤝 Honest Communication</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                If something isn't a good fit, I'll say so early before it costs you time or money.
              </p>
            </div>
          </div>
        </div>

        {/* ── Legal Policies Quick Links ── */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-8 shadow-md border border-border space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b border-border pb-3 flex items-center gap-2">
            <span>⚖️</span> Legal &amp; Policies
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Read our official legal terms, privacy guidelines, and service policies below:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Link
              to="/legal/privacy-policy"
              className="p-3.5 rounded-xl border border-border dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-gray-50 dark:bg-gray-800 transition flex items-center justify-between text-sm font-semibold text-gray-800 dark:text-gray-200"
            >
              <span>🔒 Privacy Policy</span>
              <span className="text-gray-400">→</span>
            </Link>

            <Link
              to="/legal/terms-and-conditions"
              className="p-3.5 rounded-xl border border-border dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-gray-50 dark:bg-gray-800 transition flex items-center justify-between text-sm font-semibold text-gray-800 dark:text-gray-200"
            >
              <span>📜 Terms &amp; Conditions</span>
              <span className="text-gray-400">→</span>
            </Link>

            <Link
              to="/legal/disclaimer"
              className="p-3.5 rounded-xl border border-border dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-gray-50 dark:bg-gray-800 transition flex items-center justify-between text-sm font-semibold text-gray-800 dark:text-gray-200"
            >
              <span>⚠️ Disclaimer</span>
              <span className="text-gray-400">→</span>
            </Link>

            <Link
              to="/legal/cancellation-refund-policy"
              className="p-3.5 rounded-xl border border-border dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-gray-50 dark:bg-gray-800 transition flex items-center justify-between text-sm font-semibold text-gray-800 dark:text-gray-200"
            >
              <span>💸 Cancellation &amp; Refund Policy</span>
              <span className="text-gray-400">→</span>
            </Link>

            <Link
              to="/legal/shipping-policy"
              className="p-3.5 rounded-xl border border-border dark:border-gray-700 hover:border-primary dark:hover:border-primary bg-gray-50 dark:bg-gray-800 transition flex items-center justify-between text-sm font-semibold text-gray-800 dark:text-gray-200 sm:col-span-2"
            >
              <span>📦 Shipping &amp; Digital Delivery Policy</span>
              <span className="text-gray-400">→</span>
            </Link>
          </div>
        </div>

      </main>

      <footer className="py-6 text-center text-xs text-gray-400 dark:text-gray-500 border-t border-border mt-12">
        Developed with ❤️ by <strong className="text-gray-600 dark:text-gray-300">Pragnesh Maru</strong> &copy; 2026. All rights reserved.
      </footer>
    </div>
  );
};

export default AboutDeveloperPage;
