import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  FileText,
  CreditCard,
  UserCheck,
  Headphones,
  ShieldCheck,
  Scale,
  RotateCcw,
  PackageCheck,
  Users,
  Heart,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import LogoIcon from './LogoIcon';
import { getTodayRegistrationsCount } from '../../api/profileApi';
import logger from '../../utils/logger';

/**
 * Footer — Global platform footer with unified minimalist line icons.
 * Provides accessible navigation, verified legal compliance, and community growth metrics.
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
    <footer className="w-full bg-slate-900 text-gray-300 border-t border-slate-800 pt-10 pb-24 md:pb-10 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & Verified Matrimonial Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <LogoIcon className="w-8 h-8 shrink-0" />
              <span className="text-lg font-bold text-white tracking-wide font-serif">
                PrajapatiSamaj
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              A trusted, verified matrimonial &amp; community platform uniting Prajapati Samaj families with dignity, privacy, and modern technology.
            </p>

            {/* Live Community Counters */}
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2 text-xs">
              <div className="font-semibold text-white flex items-center gap-2 text-[11px] uppercase tracking-wider text-amber-400">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Live Community Stats</span>
              </div>
              <div className="flex items-center justify-between text-gray-300 pt-1 border-t border-slate-700/50">
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
                <Link
                  to="/discover"
                  className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors py-0.5"
                >
                  <Compass className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Discover Profiles</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/biodata"
                  className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors py-0.5"
                >
                  <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Marriage Biodata Studio</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/payment"
                  className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors py-0.5"
                >
                  <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Membership Plans &amp; Pricing</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors py-0.5"
                >
                  <UserCheck className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>About Platform &amp; Developer</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors py-0.5"
                >
                  <Headphones className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Contact &amp; Support</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Compliance (Publicly viewable without login) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Legal &amp; Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/privacy-policy"
                  className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors py-0.5"
                >
                  <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-conditions"
                  className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors py-0.5"
                >
                  <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Terms &amp; Conditions</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"
                  className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors py-0.5"
                >
                  <Scale className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Legal Disclaimer</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/cancellation-refund"
                  className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors py-0.5"
                >
                  <RotateCcw className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Cancellation &amp; Refund Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping-policy"
                  className="flex items-center gap-2 text-gray-300 hover:text-amber-400 transition-colors py-0.5"
                >
                  <PackageCheck className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>Shipping &amp; Delivery Policy</span>
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
              For verification assistance, inquiries, or support:
            </p>
            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href="mailto:pragneshmaru12112001@gmail.com"
                  className="text-gray-300 hover:text-amber-400 transition-colors truncate"
                >
                  pragneshmaru12112001@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Gujarat, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Mon – Sun, 9 AM – 9 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} PrajapatiSamaj. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-gray-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline-block" />
            <span>for the community by</span>
            <Link to="/about" className="text-amber-400 hover:underline font-semibold ml-0.5">
              Pragnesh Maru
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
