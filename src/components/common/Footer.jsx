import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LogoIcon from './LogoIcon';
import { getTodayRegistrationsCount } from '../../api/profileApi';
import logger from '../../utils/logger';

/**
 * Footer — Global platform footer providing:
 *  - Legal policy links (Privacy Policy, Terms & Conditions, Disclaimer, Cancellation & Refund, Shipping)
 *  - Core navigation (About Us, Contact Us, Membership & Pricing, Biodata Studio, Discover)
 *  - Live Community growth statistics (Total Profiles, Today's New Profiles)
 *  - Developer collaborative connect callout ("Build a website or tech idea? Connect with me")
 */
const Footer = () => {
  const [stats, setStats] = useState({ total: null, today: null });

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        const res = await getTodayRegistrationsCount();
        if (isMounted) {
          setStats({
            total: res?.totalUsersCount ?? res?.data?.totalUsersCount ?? 0,
            today: res?.todayRegistrationsCount ?? res?.data?.todayRegistrationsCount ?? 0,
          });
        }
      } catch (err) {
        logger.error('Footer stats fetch error', err);
      }
    };
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer className="w-full bg-slate-900 text-gray-300 border-t border-slate-800 pt-12 pb-24 md:pb-12 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Top Section: Developer Connect CTA Card */}
        <div className="bg-gradient-to-r from-primary/20 via-slate-800 to-primary/10 rounded-2xl p-6 border border-primary/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-primary text-white">
              Tech Collaboration
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Have a Website Idea or Want to Build Your Own Platform?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              Need a custom community portal, matrimonial website, or web application? Let's connect and build it together.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <a
              href="https://wa.me/919998000000?text=Hello%20Pragnesh,%20I%20have%20a%20website/project%20idea%20to%20discuss!"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow flex items-center gap-1.5 cursor-pointer"
            >
              <span>💬</span> WhatsApp Connect
            </a>
            <a
              href="mailto:pragneshmaru12112001@gmail.com?subject=Website%20Idea%20Proposal"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition border border-white/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>✉️</span> Email Developer
            </a>
          </div>
        </div>

        {/* Middle Section: Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Community Stats */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <LogoIcon className="w-8 h-8 text-primary shrink-0" />
              <span className="text-lg font-bold text-white tracking-wide">
                PrajapatiSamaj
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              A trusted, verified matrimonial &amp; community platform uniting Prajapati Samaj families with dignity, privacy, and modern technology.
            </p>

            {/* Live Community Counters */}
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1.5 text-xs">
              <div className="font-semibold text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-primary-light">
                <span>📊</span> Live Community Stats
              </div>
              <div className="flex items-center justify-between text-gray-300 pt-1">
                <span>Total Registered:</span>
                <span className="font-bold text-white">
                  {stats.total !== null ? `${stats.total} Profiles` : '...'}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span>Joined Today:</span>
                <span className="font-bold text-emerald-400">
                  {stats.today !== null ? `+${stats.today} New` : '...'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/discover" className="hover:text-primary transition-colors">
                  🔍 Discover Profiles
                </Link>
              </li>
              <li>
                <Link to="/biodata" className="hover:text-primary transition-colors">
                  📜 Marriage Biodata Studio
                </Link>
              </li>
              <li>
                <Link to="/payment" className="hover:text-primary transition-colors">
                  💎 Membership Plans &amp; Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">
                  👤 About Platform &amp; Developer
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  📞 Contact &amp; Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Legal &amp; Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy-policy" className="hover:text-primary transition-colors">
                  🔒 Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="hover:text-primary transition-colors">
                  📋 Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="hover:text-primary transition-colors">
                  ⚖️ Legal Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/cancellation-refund" className="hover:text-primary transition-colors">
                  💳 Cancellation &amp; Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-primary transition-colors">
                  📦 Shipping &amp; Delivery Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Help */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Get in Touch
            </h4>
            <p className="text-xs text-gray-400">
              For any help, verification assistance, or website inquiries:
            </p>
            <div className="space-y-2 text-xs">
              <p className="text-gray-300">
                <strong className="text-white">Email:</strong>{' '}
                <a
                  href="mailto:pragneshmaru12112001@gmail.com"
                  className="text-primary hover:underline"
                >
                  pragneshmaru12112001@gmail.com
                </a>
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Location:</strong> Gujarat, India
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Hours:</strong> Mon - Sun, 9 AM - 9 PM IST
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} PrajapatiSamaj. All rights reserved.
          </p>
          <p className="text-gray-400">
            Developed with ❤️ by{' '}
            <Link to="/about" className="text-primary-light hover:underline font-semibold">
              Pragnesh Maru
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
