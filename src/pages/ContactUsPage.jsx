import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

/**
 * ContactUsPage — /contact and /contact-us
 * Public contact page providing official communication channels, developer connect,
 * and quick contact inquiry form.
 */
const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in your name, email, and message.');
      return;
    }

    const emailSubject = encodeURIComponent(
      `[PrajapatiSamaj Inquiry] ${formData.subject || 'General Inquiry'} - from ${formData.name}`
    );
    const emailBody = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`
    );

    window.location.href = `mailto:pragneshmaru12112001@gmail.com?subject=${emailSubject}&body=${emailBody}`;
    toast.success('Opening your email client to send your message!');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 space-y-8 w-full">
        {/* Header Hero */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary dark:bg-primary/20">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
            Contact &amp; Support
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Have questions about your profile, membership plans, marriage biodata studio, or want to discuss a new website idea? We're here to help.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Email */}
          <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-border text-center space-y-2 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
              ✉️
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Email Us</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Direct response within 24 hours</p>
            <a
              href="mailto:pragneshmaru12112001@gmail.com"
              className="text-xs font-semibold text-primary hover:underline block truncate"
            >
              pragneshmaru12112001@gmail.com
            </a>
          </div>

          {/* Card 2: Developer Connect & WhatsApp */}
          <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-border text-center space-y-2 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl">
              💬
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Quick WhatsApp / Chat</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Instant developer messaging</p>
            <a
              href="https://wa.me/917698690157?text=Hello%20Pragnesh,%20I%20have%20an%20inquiry%20regarding%20PrajapatiSamaj"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-emerald-600 hover:underline block"
            >
              Connect on WhatsApp &rarr;
            </a>
          </div>

          {/* Card 3: Community Location */}
          <div className="bg-white dark:bg-card-dark rounded-2xl p-5 border border-border text-center space-y-2 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 flex items-center justify-center text-2xl">
              📍
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Headquarters</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Gujarat, India</p>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 block">
              Prajapati Samaj Community
            </span>
          </div>
        </div>

        {/* Website & Tech Project CTA Banner */}
        <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100">
              💡 Have a Website Idea or Want to Build Your Own Platform?
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 max-w-xl">
              Looking for a custom matrimonial site, community directory, business portal, or modern web app? Let's collaborate and bring your concept to life.
            </p>
          </div>
          <a
            href="mailto:pragneshmaru12112001@gmail.com?subject=Custom%20Website%20Idea%20Proposal"
            className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-light transition shadow shrink-0 cursor-pointer"
          >
            🚀 Pitch Your Idea
          </a>
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
            Send a Direct Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Profile assistance, Website idea, Membership query"
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Message *
              </label>
              <textarea
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message, feedback, or project idea here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-sm transition shadow cursor-pointer flex items-center gap-2"
            >
              <span>✉️</span> Send Message
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUsPage;
