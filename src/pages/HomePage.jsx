import { Link } from 'react-router-dom';
import {
  UserPlus,
  FileText,
  HeartHandshake,
  ShieldCheck,
  Camera,
  Sparkles,
  Users,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Seo from '../seo/Seo';
import { buildOrganizationSchema, buildWebSiteSchema } from '../seo/schemas';
import { FAQ_ITEMS } from '../data/faqData';

const STEPS = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Register & Verify',
    description: 'Sign up with your email and OTP verification in minutes, or continue with Google.',
  },
  {
    step: '02',
    icon: FileText,
    title: 'Build Your Profile & Biodata',
    description: 'Add family, education, horoscope details, and upload up to 10 photos.',
  },
  {
    step: '03',
    icon: HeartHandshake,
    title: 'Connect Safely',
    description: 'Browse profiles, send interest requests, and share contact details only on your terms.',
  },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Free Profile Registration',
    description: 'Create your matrimonial profile and partner expectations at no cost.',
  },
  {
    icon: Camera,
    title: 'Photo Privacy & Control',
    description: 'Upload up to 10 photos and manage your primary display picture anytime.',
  },
  {
    icon: HeartHandshake,
    title: 'Interest Requests & Matches',
    description: 'Send, accept, or decline interest requests with full control over your responses.',
  },
  {
    icon: FileText,
    title: 'Marriage Biodata Studio',
    description: 'Generate clean single-page A4 traditional marriage biodata PDFs.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy First',
    description: 'Mobile numbers and residential addresses are masked by default for non-owners.',
  },
  {
    icon: Users,
    title: 'Family-Friendly Profiles',
    description: 'Profiles can be managed by self, parents, siblings, or relatives with clear attribution.',
  },
];

/**
 * Public landing page rendered at "/" for logged-out visitors and search crawlers.
 */
const HomePage = () => {
  const shortFaqs = FAQ_ITEMS.slice(0, 4);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
      <Seo
        title="Prajapati Samaj Matrimony — Trusted Matrimonial Platform | PrajapatiSamaj"
        description="Trusted matrimonial platform for Prajapati Samaj families in Gujarat and India. Create a free profile, connect safely, and generate traditional A4 marriage biodata PDFs."
        path="/"
        jsonLd={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />

      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-14 text-center space-y-6">
          <span className="inline-block px-3.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
            Prajapati Samaj Community Matrimony
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            Prajapati Samaj Matrimony
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            A trusted, private matrimonial platform for Prajapati Samaj families to connect with dignity and clarity.
          </p>

          <p className="text-sm sm:text-base font-medium text-amber-600 dark:text-amber-400" lang="gu">
            પ્રજાપતિ સમાજ માટે વિશ્વસનીય અને સુરક્ષિત લગ્ન પરિચય મંચ.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-sm shadow-lg transition"
            >
              <span>Create Free Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-border dark:border-gray-700 bg-white dark:bg-card-dark text-gray-800 dark:text-gray-100 font-semibold text-sm hover:border-primary/50 transition"
            >
              Sign In to Your Account
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              How PrajapatiSamaj Works
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.step}
                  className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-border dark:border-gray-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-gray-400">STEP {item.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Platform Features
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Designed for privacy, family clarity, and traditional biodata sharing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <article
                  key={feat.title}
                  className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-border dark:border-gray-800 shadow-sm space-y-2.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feat.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Who It Is For */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-8 border border-border dark:border-gray-800 shadow-sm space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Who PrajapatiSamaj Is For
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Built exclusively for Prajapati Samaj brides, grooms, and parents or guardians managing family profiles across Gujarat and India. Filter matches by age, marital status, city, state, mother tongue, diet, and surname while keeping personal contact details protected.
            </p>
          </div>
        </section>

        {/* Short FAQ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <span>Frequently Asked Questions</span>
            </h2>
            <Link
              to="/faq"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Read all Prajapati Samaj matrimony FAQs &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortFaqs.map((item) => (
              <article
                key={item.question}
                className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-border dark:border-gray-800 space-y-2"
              >
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {item.question}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-14">
          <div className="rounded-2xl p-8 bg-gradient-to-r from-primary/15 via-primary/5 to-amber-500/10 border border-primary/20 text-center space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Ready to begin your search?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              Create your free Prajapati Samaj matrimonial profile today and explore compatible family matches.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-sm shadow transition"
              >
                <span>Register Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-primary transition"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
