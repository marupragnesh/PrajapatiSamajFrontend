import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Spinner from './components/common/Spinner';
import { pingBackend } from './api/healthApi';
import Seo from './seo/Seo';

/**
 * Lazy load all page-level components — only downloaded when first visited.
 */
const HomePage              = lazy(() => import('./pages/HomePage'));
const FaqPage               = lazy(() => import('./pages/FaqPage'));
const RegisterPage          = lazy(() => import('./pages/RegisterPage'));
const LoginPage             = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage    = lazy(() => import('./pages/ForgotPasswordPage'));
const VerifyOtpPage         = lazy(() => import('./pages/VerifyOtpPage'));
const ResetPasswordPage     = lazy(() => import('./pages/ResetPasswordPage'));
const AccountDeletedPage    = lazy(() => import('./pages/AccountDeletedPage'));
const ProfileSetupPage      = lazy(() => import('./pages/ProfileSetupPage'));
const EditProfilePage       = lazy(() => import('./pages/EditProfilePage'));
const ExpectationsPage      = lazy(() => import('./pages/ExpectationsPage'));
const DiscoverPage          = lazy(() => import('./pages/DiscoverPage'));
const ProfileDetailPage     = lazy(() => import('./pages/ProfileDetailPage'));
const LikesReceivedPage     = lazy(() => import('./pages/LikesReceivedPage'));
const InterestsReceivedPage = lazy(() => import('./pages/InterestsReceivedPage'));
const MatchesPage           = lazy(() => import('./pages/MatchesPage'));
const PaymentPage           = lazy(() => import('./pages/PaymentPage'));
const BiodataPage           = lazy(() => import('./pages/BiodataPage'));
const AboutDeveloperPage    = lazy(() => import('./pages/AboutDeveloperPage'));
const ContactUsPage         = lazy(() => import('./pages/ContactUsPage'));

// Legal pages
const PrivacyPolicyPage      = lazy(() => import('./pages/legal/PrivacyPolicyPage'));
const TermsConditionsPage    = lazy(() => import('./pages/legal/TermsConditionsPage'));
const DisclaimerPage         = lazy(() => import('./pages/legal/DisclaimerPage'));
const CancellationRefundPage = lazy(() => import('./pages/legal/CancellationRefundPage'));
const ShippingPolicyPage     = lazy(() => import('./pages/legal/ShippingPolicyPage'));

/** Marks non-indexable auth/utility routes as noindex. */
const NoIndexRoute = ({ children }) => {
  const { pathname } = useLocation();
  return (
    <>
      <Seo noindex path={pathname} />
      {children}
    </>
  );
};

/** Redirects to /login if user is not authenticated; marks protected pages noindex. */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const { pathname } = useLocation();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return (
    <>
      <Seo noindex path={pathname} />
      {children}
    </>
  );
};

/** Full-page spinner shown while a lazy page chunk is loading. */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
    <Spinner size="lg" />
  </div>
);

/**
 * App — defines all routes.
 * Public:    register, login, forgot-password, verify-otp, reset-password, account-deleted, legal pages
 * Protected: everything else (requires valid JWT in AuthContext)
 */
const App = () => {
  // Keep-alive: Ping backend on startup and every 10 minutes to prevent Render free instance sleep
  useEffect(() => {
    pingBackend();
    const intervalId = setInterval(() => {
      pingBackend();
    }, 10 * 60 * 1000); // 10 minutes = 600,000ms

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root — HomePage for logged-out visitors, /discover for logged-in users */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/faq" element={<FaqPage />} />

        {/* ── Auth & Account Public Routes (noindex) ── */}
        <Route path="/register"         element={<NoIndexRoute><RegisterPage /></NoIndexRoute>} />
        <Route path="/login"            element={<NoIndexRoute><LoginPage /></NoIndexRoute>} />
        <Route path="/forgot-password"  element={<NoIndexRoute><ForgotPasswordPage /></NoIndexRoute>} />
        <Route path="/verify-otp"       element={<NoIndexRoute><VerifyOtpPage /></NoIndexRoute>} />
        <Route path="/reset-password"   element={<NoIndexRoute><ResetPasswordPage /></NoIndexRoute>} />
        <Route path="/account-deleted"  element={<NoIndexRoute><AccountDeletedPage /></NoIndexRoute>} />

        {/* ── Legal & About Public Routes ── */}
        <Route path="/about"                            element={<NoIndexRoute><AboutDeveloperPage /></NoIndexRoute>} />
        <Route path="/about-developer"                  element={<NoIndexRoute><AboutDeveloperPage /></NoIndexRoute>} />
        <Route path="/contact"                          element={<ContactUsPage />} />
        <Route path="/contact-us"                       element={<ContactUsPage />} />
        <Route path="/legal/contact-us"                 element={<ContactUsPage />} />
        <Route path="/privacy-policy font"              element={<PrivacyPolicyPage />} />
        <Route path="/privacy-policy"                   element={<PrivacyPolicyPage />} />
        <Route path="/legal/privacy-policy font"        element={<PrivacyPolicyPage />} />
        <Route path="/legal/privacy-policy"             element={<PrivacyPolicyPage />} />
        <Route path="/terms-conditions"                 element={<TermsConditionsPage />} />
        <Route path="/terms-and-conditions"             element={<TermsConditionsPage />} />
        <Route path="/legal/terms-conditions"           element={<TermsConditionsPage />} />
        <Route path="/legal/terms-and-conditions"       element={<TermsConditionsPage />} />
        <Route path="/disclaimer"                       element={<NoIndexRoute><DisclaimerPage /></NoIndexRoute>} />
        <Route path="/legal/disclaimer"                 element={<NoIndexRoute><DisclaimerPage /></NoIndexRoute>} />
        <Route path="/cancellation-refund"              element={<NoIndexRoute><CancellationRefundPage /></NoIndexRoute>} />
        <Route path="/legal/cancellation-refund-policy" element={<NoIndexRoute><CancellationRefundPage /></NoIndexRoute>} />
        <Route path="/shipping-policy"                  element={<NoIndexRoute><ShippingPolicyPage /></NoIndexRoute>} />
        <Route path="/legal/shipping-policy font"       element={<NoIndexRoute><ShippingPolicyPage /></NoIndexRoute>} />
        <Route path="/legal/shipping-policy"            element={<NoIndexRoute><ShippingPolicyPage /></NoIndexRoute>} />

        {/* ── Protected routes ── */}
        <Route path="/profile/setup"        element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
        <Route path="/profile/edit"         element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/profile/expectations" element={<ProtectedRoute><ExpectationsPage /></ProtectedRoute>} />
        <Route path="/discover"             element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
        <Route path="/profiles/:profileId"  element={<ProtectedRoute><ProfileDetailPage /></ProtectedRoute>} />
        <Route path="/likes"                element={<ProtectedRoute><LikesReceivedPage /></ProtectedRoute>} />
        <Route path="/interests"            element={<ProtectedRoute><InterestsReceivedPage /></ProtectedRoute>} />
        <Route path="/matches"              element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />
        <Route path="/payment"              element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/biodata"              element={<ProtectedRoute><BiodataPage /></ProtectedRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

/** Logged-in → /discover, logged-out → public HomePage */
const RootRoute = () => {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) return <Navigate to="/discover" replace />;
  return <HomePage />;
};

export default App;
