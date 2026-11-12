import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { Routes, Route } from 'react-router-dom';
import * as HelmetAsyncPkg from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import FaqPage from './pages/FaqPage';
import ContactUsPage from './pages/ContactUsPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsConditionsPage from './pages/legal/TermsConditionsPage';

const HelmetProvider =
  HelmetAsyncPkg.HelmetProvider || HelmetAsyncPkg.default?.HelmetProvider;

/**
 * Synchronous SSR render function used only at build time to pre-render
 * the 5 public indexable routes without any user data.
 */
export function render(url) {
  const helmetContext = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-conditions" element={<TermsConditionsPage />} />
          </Routes>
        </AuthProvider>
      </StaticRouter>
    </HelmetProvider>
  );

  const { helmet } = helmetContext;
  const head = helmet
    ? [
        helmet.title.toString(),
        helmet.meta.toString(),
        helmet.link.toString(),
        helmet.script.toString(),
      ]
        .filter(Boolean)
        .join('\n    ')
    : '';

  return { html, head };
}
