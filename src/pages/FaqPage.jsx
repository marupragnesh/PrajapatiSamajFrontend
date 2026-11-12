import { Link } from 'react-router-dom';
import { HelpCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Seo from '../seo/Seo';
import { buildFaqSchema } from '../seo/schemas';
import { FAQ_ITEMS } from '../data/faqData';

/**
 * Public FAQ page at "/faq" with matching FAQPage JSON-LD structured data.
 */
const FaqPage = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
      <Seo
        title="Frequently Asked Questions — Prajapati Samaj Matrimony | PrajapatiSamaj"
        description="Answers to common questions about creating a free Prajapati Samaj matrimonial profile, photo privacy, contact masking, and A4 marriage biodata PDFs."
        path="/faq"
        jsonLd={buildFaqSchema(FAQ_ITEMS)}
      />

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 space-y-8 w-full">
        <header className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help &amp; Answers</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Everything you need to know about registering, privacy controls, and creating marriage biodata PDFs on PrajapatiSamaj.
          </p>
        </header>

        <section className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <article
              key={item.question}
              className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-border dark:border-gray-800 shadow-sm space-y-2"
            >
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {item.question}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.answer}
              </p>
            </article>
          ))}
        </section>

        <section className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-border dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Still have a question?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Reach out to our support team or create your free profile to get started.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="px-4 py-2.5 rounded-xl border border-border dark:border-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:border-primary/50 transition"
            >
              Contact PrajapatiSamaj Support
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-sm font-bold transition"
            >
              <span>Create Free Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FaqPage;
