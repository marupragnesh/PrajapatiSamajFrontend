import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import Spinner from './components/common/Spinner';

/**
 * Lazy load all page-level components — per spec performance rules.
 * This means pages are only downloaded when first visited.
 */
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const VerifyOtpPage      = lazy(() => import('./pages/VerifyOtpPage'));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPasswordPage'));
const ProfileSetupPage   = lazy(() => import('./pages/ProfileSetupPage'));
const EditProfilePage    = lazy(() => import('./pages/EditProfilePage'));
const DiscoverPage       = lazy(() => import('./pages/DiscoverPage'));
const ProfileDetailPage  = lazy(() => import('./pages/ProfileDetailPage'));
const LikesReceivedPage  = lazy(() => import('./pages/LikesReceivedPage'));
const InterestsReceivedPage = lazy(() => import('./pages/InterestsReceivedPage'));
const MatchesPage        = lazy(() => import('./pages/MatchesPage'));

/**
 * ProtectedRoute — wraps protected pages.
 * If user is not logged in, redirects to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

/**
 * Full-page loading fallback shown while lazy page chunk is downloading.
 */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
    <Spinner size="lg" />
  </div>
);

/**
 * App — defines all routes.
 * Public routes: register, login, forgot-password, verify-otp, reset-password
 * Protected routes: everything else (require JWT token in AuthContext)
 */
const App = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root — redirect based on auth status */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Public routes (no auth needed) ── */}
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp"      element={<VerifyOtpPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* ── Protected routes (auth required) ── */}
        <Route path="/profile/setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
        <Route path="/profile/edit"  element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/discover"      element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
        <Route path="/profiles/:profileId" element={<ProtectedRoute><ProfileDetailPage /></ProtectedRoute>} />
        <Route path="/likes"         element={<ProtectedRoute><LikesReceivedPage /></ProtectedRoute>} />
        <Route path="/interests"     element={<ProtectedRoute><InterestsReceivedPage /></ProtectedRoute>} />
        <Route path="/matches"       element={<ProtectedRoute><MatchesPage /></ProtectedRoute>} />

        {/* Catch-all — redirect unknown paths to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

/**
 * Root redirect — logged-in users go to /discover, others go to /login.
 */
const RootRedirect = () => {
  const { isLoggedIn } = useAuth();
  return <Navigate to={isLoggedIn ? '/discover' : '/login'} replace />;
};

export default App;
