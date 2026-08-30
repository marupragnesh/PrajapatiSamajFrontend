import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import PaymentResultModal from '../components/payment/PaymentResultModal';
import { createOrder, verifyPayment, getPaymentStatus } from '../api/paymentApi';
import { getMyProfile } from '../api/profileApi';
import logger from '../utils/logger';

/**
 * PaymentPage — 3-Level Premium Membership Plans (2 Months / 60 Days Validity)
 *
 * Supported Languages:
 *   - English (default)
 *   - Gujarati (ગુજરાતી)
 *
 * Tier 1 (₹99):  Unlock all profiles + Biodata PDF (all themes) + 2 likes/day + 10 interests in 2 months + Expectations
 * Tier 2 (₹199): Level 1 all + Higher Visibility + Advanced Filters + Unlimited likes + Unlimited interests
 * Tier 3 (₹299): Level 2 all + Highest Visibility + Unlimited Mobile No & Address + Unlimited Likes & Interests
 */

const TRANSLATIONS = {
  en: {
    pageTitle: "💎 Choose Your Membership Plan",
    pageSubtitle: "Get more visibility, send more likes & interests, and connect faster. All plans are valid for a full 2 Months (60 Days).",
    activePlan: "Active Membership Plan",
    activeBadge: "Active",
    daysLeft: "days remaining",
    dayLeft: "day remaining",
    gstBadge: "Incl. 18% GST",
    validity: "Valid for 2 Months",
    currentActivePlan: "✅ Current Active Plan",
    vipAccessActive: "✅ VIP Access Active",

    // Active banner descriptions
    level3Desc: "You have full VIP access: Unlimited Contact & Address, Highest Visibility, Unlimited Likes & Interests.",
    level2Desc: "You have Level 2 access: Higher Visibility Ranking, Discover Filters, Unlimited Likes & Interests.",
    level1Desc: "You have Level 1 access: All Profiles Unlocked, 2 Likes/Day, 10 Interests, Biodata PDF Downloads.",

    // Tier 1
    t1Badge: "🥉 Level 1",
    t1Title: "Starter Pass",
    t1F1: "Unlock All Profiles: Browse unrestricted profiles.",
    t1F2: "Marriage Biodata PDF Download: Download clean A4 PDF in all 6 traditional themes!",
    t1F3: "2 Likes Per Day: Connect daily (resets every midnight).",
    t1F4: "10 Total Interests: Send up to 10 interest requests in 2 months.",
    t1F5: "Partner Expectations: Full view of partner preferences.",
    t1F6: "Discover Filters Locked",
    t1F7: "Mobile No & Address Masked",
    t1Btn: "Get Level 1 (₹99)",

    // Tier 2
    t2Badge: "🥈 Level 2",
    t2Title: "Growth Pass",
    t2Rec: "RECOMMENDED",
    t2F1: "All Level 1 Features Included",
    t2F2: "Higher Visibility Ranking: Your profile appears above Level 1 and Free members in Discover!",
    t2F3: "Advanced Discover Filters: Filter by Age, Diet, Marital Status, and Surname.",
    t2F4: "Unlimited Likes: Like as many profiles as you want in 2 months.",
    t2F5: "Unlimited Interests: Send interest requests to any profile without limits.",
    t2F6: "Mobile No & Address Masked",
    t2Btn: "Get Level 2 (₹199)",

    // Tier 3
    t3Badge: "🥇 Level 3 VIP",
    t3Title: "VIP Unlimited Pass",
    t3Rec: "👑 VIP ALL ACCESS",
    t3F1: "All Level 2 Features Included",
    t3F2: "Unlimited Mobile No & Address: Unmask full phone numbers & addresses for ANY profile on the platform!",
    t3F3: "Highest Visibility Ranking: Appear at the absolute TOP of all search and discover listings!",
    t3F4: "Unlimited Likes: Like as many profiles as you want.",
    t3F5: "Unlimited Interests: Send interest requests to any profile without limits.",
    t3F6: "Biodata Studio & Discover Filters: Full access to all features.",
    t3BtnUpgrade: "Upgrade to VIP Level 3 (₹299)",
    t3BtnGet: "Get VIP Level 3 (₹299)",

    // Footer Trust Items
    secTitle: "🔒 100% Safe & Instant Payment",
    sec1: "Secure Razorpay payments (UPI, GPay, Paytm, Cards, NetBanking)",
    sec2: "Instant account activation right after payment",
    sec3: "One-time payment • No auto-debit • Valid for 60 Days",
  },
  gu: {
    pageTitle: "💎 તમારી મેમ્બરશિપ યોજના પસંદ કરો",
    pageSubtitle: "વધુ દૃશ્યતા મેળવો, વધુ લાઇક્સ અને ઇન્ટરેસ્ટ મોકલો અને ઝડપથી યોગ્ય જીવનસાથી શોધો. તમામ પ્લાન પૂરા ૨ મહિના (૬૦ દિવસ) માટે માન્ય છે.",
    activePlan: "સક્રિય મેમ્બરશિપ પ્લાન",
    activeBadge: "સક્રિય",
    daysLeft: "દિવસ બાકી",
    dayLeft: "દિવસ બાકી",
    gstBadge: "૧૮% GST સહિત",
    validity: "૨ મહિના માટે માન્ય",
    currentActivePlan: "✅ હાલનો સક્રિય પ્લાન",
    vipAccessActive: "✅ VIP ઍક્સેસ સક્રિય",

    // Active banner descriptions
    level3Desc: "તમારી પાસે પૂર્ણ VIP ઍક્સેસ છે: બધા પ્રોફાઇલ્સના મોબાઇલ નંબર અને સરનામું, સૌથી વધુ દૃશ્યતા, અમર્યાદિત લાઇક્સ અને ઇન્ટરેસ્ટ.",
    level2Desc: "તમારી પાસે લેવલ ૨ ઍક્સેસ છે: ઉચ્ચ દૃશ્યતા રેન્કિંગ, ડિસ્કવર ફિલ્ટર્સ, અમર્યાદિત લાઇક્સ અને ઇન્ટરેસ્ટ.",
    level1Desc: "તમારી પાસે લેવલ ૧ ઍક્સેસ છે: બધી પ્રોફાઇલ્સ અનલોક, દરરોજ ૨ લાઇક્સ, ૧૦ ઇન્ટરેસ્ટ, બાયોડેટા PDF ડાઉનલોડ.",

    // Tier 1
    t1Badge: "🥉 લેવલ ૧",
    t1Title: "સ્ટાર્ટર પાસ",
    t1F1: "બધી પ્રોફાઇલ્સ અનલોક: કોઈપણ મર્યાદા વિના બધી પ્રોફાઇલ્સ જુઓ.",
    t1F2: "મેરેજ બાયોડેટા PDF ડાઉનલોડ: તમામ ૬ પરંપરાગત થીમ્સમાં સ્વચ્છ A4 PDF ડાઉનલોડ કરો!",
    t1F3: "દરરોજ ૨ લાઇક્સ: દરરોજ ૨ પ્રોફાઇલ લાઈક કરો (દરરોજ રાત્રે રીસેટ થશે).",
    t1F4: "કુલ ૧૦ ઇન્ટરેસ્ટ વિનંતીઓ: ૨ મહિનામાં ૧૦ પ્રોફાઇલને ઇન્ટરેસ્ટ મોકલો.",
    t1F5: "જીવનસાથીની અપેક્ષાઓ: પાર્ટનરની તમામ અપેક્ષાઓ જુઓ.",
    t1F6: "ડિસ્કવર ફિલ્ટર્સ લૉક રહેશે",
    t1F7: "મોબાઇલ નંબર અને સરનામું છુપાયેલ રહેશે",
    t1Btn: "લેવલ ૧ મેળવો (₹૯૯)",

    // Tier 2
    t2Badge: "🥈 લેવલ ૨",
    t2Title: "ગ્રોથ પાસ",
    t2Rec: "ભલામણ કરેલ",
    t2F1: "લેવલ ૧ ની તમામ સુવિધાઓ શામેલ છે",
    t2F2: "ઉચ્ચ દૃશ્યતા રેન્કિંગ: ડિસ્કવરમાં તમારી પ્રોફાઇલ લેવલ ૧ અને ફ્રી સભ્યોની ઉપર સૌથી પહેલાં દેખાશે!",
    t2F3: "અદ્યતન ડિસ્કવર ફિલ્ટર્સ: ઉંમર, ખોરાક (Diet), વૈવાહિક સ્થિતિ અને અટક દ્વારા ફિલ્ટર કરો.",
    t2F4: "અમર્યાદિત લાઇક્સ: ૨ મહિનામાં ગમે તેટલી પ્રોફાઇલ્સ લાઈક કરો.",
    t2F5: "અમર્યાદિત ઇન્ટરેસ્ટ: કોઈપણ મર્યાદા વિના પ્રોફાઇલ્સને સંબંધ માટે વિનંતી મોકલો.",
    t2F6: "મોબાઇલ નંબર અને સરનામું છુપાયેલ રહેશે",
    t2Btn: "લેવલ ૨ મેળવો (₹૧૯૯)",

    // Tier 3
    t3Badge: "🥇 લેવલ ૩ VIP",
    t3Title: "VIP અમર્યાદિત પાસ",
    t3Rec: "👑 VIP સર્વોચ્ચ ઍક્સેસ",
    t3F1: "લેવલ ૨ ની તમામ સુવિધાઓ શામેલ છે",
    t3F2: "અમર્યાદિત મોબાઇલ નંબર્સ અને સરનામું: પ્લેટફોર્મ પર કોઈપણ પ્રોફાઇલનો સંપૂર્ણ મોબાઇલ નંબર અને રહેઠાણનું સરનામું જુઓ!",
    t3F3: "સર્વોચ્ચ દૃશ્યતા રેન્કિંગ: બધા શોધ પરિણામો અને ડિસ્કવરમાં તમારી પ્રોફાઇલ સૌથી ટોચ પર ચમકશે!",
    t3F4: "અમર્યાદિત લાઇક્સ: ઇચ્છા મુજબ ગમે તેટલી પ્રોફાઇલ્સ લાઈક કરો.",
    t3F5: "અમર્યાદિત ઇન્ટરેસ્ટ: કોઈપણ મર્યાદા વગર સીધા સંબંધની વિનંતી મોકલો.",
    t3F6: "બાયોડેટા સ્ટુડિયો અને તમામ ડિસ્કવર ફિલ્ટર્સ: સંપૂર્ણ સુવિધાઓ અનલોક.",
    t3BtnUpgrade: "VIP લેવલ ૩ માં અપગ્રેડ કરો (₹૨૯૯)",
    t3BtnGet: "VIP લેવલ ૩ મેળવો (₹૨૯૯)",

    // Footer Trust Items
    secTitle: "🔒 ૧૦૦% સુરક્ષિત અને ત્વરિત ચૂકવણી",
    sec1: "રેઝરપે દ્વારા સુરક્ષિત ચૂકવણી (UPI, GPay, Paytm, કાર્ડ્સ, નેટબેંકિંગ)",
    sec2: "ચુકવણી પછી તરત જ તમામ સુવિધાઓ સક્રિય થઈ જશે",
    sec3: "વન-ટાઇમ પેમેન્ટ • કોઈ છુપો ચાર્જ નથી • ૬૦ દિવસ માન્ય",
  }
};

const PaymentPage = () => {
  const [lang, setLang] = useState('en'); // 'en' | 'gu'
  const t = TRANSLATIONS[lang];

  const [status, setStatus] = useState({
    membershipTier: 'FREE',
    allProfilesUnlocked: false,
    contactUnlocked: false,
    filtersUnlocked: false,
    biodataUnlocked: false,
    daysRemaining: null,
    expiresAt: null,
    dailyLikesLimit: 1,
    likesUsedToday: 0,
    totalLikesLimit: null,
    totalLikesUsed: 0,
    interestsLimit: null,
    interestsUsed: 0,
    level1Price: 99,
    level2Price: 199,
    level3Price: 299,
  });
  const [profile, setProfile] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [processingFeature, setProcessingFeature] = useState(null);

  const [modalState, setModalState] = useState({
    isOpen: false,
    isSuccess: true,
    title: '',
    message: '',
    details: {},
  });

  const fetchData = async () => {
    try {
      const [statusData, profileData] = await Promise.all([
        getPaymentStatus(),
        getMyProfile().catch(() => null),
      ]);
      setStatus(statusData);
      setProfile(profileData);
    } catch (error) {
      logger.error('Failed to fetch payment status', error);
      toast.error('Could not load membership status.');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePay = async (featureName, tierName, price) => {
    setProcessingFeature(featureName);
    try {
      const order = await createOrder(featureName);

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Prajapati Samaj',
        description: `2-Month ${tierName} Membership (₹${price} Incl. 18% GST)`,
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (result.success) {
              toast.success(`🎉 Congratulations! ${tierName} Membership Activated!`);
              await fetchData();
              setModalState({
                isOpen: true,
                isSuccess: true,
                title: `🎉 ${tierName} Membership Activated!`,
                message: `Your ${tierName} plan is now active for 60 days (2 Months)! Enjoy all exclusive features and higher visibility across Prajapati Samaj.`,
                details: {
                  feature: featureName,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  amount: order.amount,
                },
              });
            } else {
              toast.error(result.message || 'Payment verification failed.');
              setModalState({
                isOpen: true,
                isSuccess: false,
                title: '❌ Verification Failed',
                message: result.message || 'Could not verify payment signature. Contact support if money was deducted.',
                details: { feature: featureName, orderId: response.razorpay_order_id, amount: order.amount },
              });
            }
          } catch (error) {
            logger.error('Payment verification failed', error.response?.data);
            toast.error('Payment verification error. Contact support if deducted.');
            setModalState({
              isOpen: true,
              isSuccess: false,
              title: '❌ Payment Error',
              message: 'Server error during payment verification. If money was deducted, please contact support.',
              details: { feature: featureName, orderId: order.orderId, amount: order.amount },
            });
          } finally {
            setProcessingFeature(null);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingFeature(null);
          },
        },
        theme: { color: '#B5451B' },
      };

      if (!window.Razorpay) {
        toast.error('Payment gateway unavailable. Please refresh and try again.');
        setProcessingFeature(null);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (resp) => {
        toast.error('Payment failed. Please try again.');
        setModalState({
          isOpen: true,
          isSuccess: false,
          title: '❌ Payment Failed',
          message: resp?.error?.description || 'Transaction declined or cancelled. Please try again.',
          details: { feature: featureName, orderId: order.orderId, amount: order.amount },
        });
        setProcessingFeature(null);
      });
      razorpay.open();
    } catch (error) {
      logger.error('Payment initialization failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not initiate payment.');
      setProcessingFeature(null);
    }
  };

  const currentTier = status.membershipTier || 'FREE';

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ── Language Switcher Selector ── */}
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-card-dark rounded-2xl border border-border/80 dark:border-gray-700 shadow-sm">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${lang === 'en'
                ? 'bg-primary text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
            <button
              type="button"
              onClick={() => setLang('gu')}
              className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${lang === 'gu'
                ? 'bg-primary text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              <span>🇮🇳</span>
              <span>ગુજરાતી (Gujarati)</span>
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary">{t.pageTitle}</h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            {t.pageSubtitle}
          </p>
        </div>

        {/* Active Membership Banner */}
        {currentTier !== 'FREE' && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-emerald-400/40">
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <span className="text-3xl">👑</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base md:text-lg tracking-wide">
                    {t.activePlan}: {currentTier.replace('_', ' ')}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                    {t.activeBadge}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-emerald-100 font-medium mt-0.5">
                  {currentTier === 'LEVEL_3' && t.level3Desc}
                  {currentTier === 'LEVEL_2' && t.level2Desc}
                  {currentTier === 'LEVEL_1' && t.level1Desc}
                </p>
              </div>
            </div>
            {status.daysRemaining !== null && status.daysRemaining !== undefined && (
              <span className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-white font-extrabold text-xs whitespace-nowrap border border-white/30">
                ⏳ {status.daysRemaining} {status.daysRemaining === 1 ? t.dayLeft : t.daysLeft}
              </span>
            )}
          </div>
        )}

        {loadingStatus ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          /* 3 Pricing Tier Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">

            {/* TIER 1: Level 1 (₹99) */}
            <div className={`bg-white dark:bg-card-dark rounded-3xl p-6 shadow-lg flex flex-col justify-between space-y-6 relative overflow-hidden transition ${currentTier === 'LEVEL_1' ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20' : 'border border-border/80 dark:border-gray-700'
              }`}>
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-border/60 dark:border-gray-700 pb-4">
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {t.t1Badge}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                      {t.t1Title}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">₹99</p>
                    <p className="text-[10px] text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider">{t.gstBadge}</p>
                    <p className="text-xs text-gray-400 font-medium">{t.validity}</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-gray-700 dark:text-gray-200">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      ✓
                    </span>
                    <span>{t.t1F1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      ✓
                    </span>
                    <span>{t.t1F2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      ✓
                    </span>
                    <span>{t.t1F3}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      ✓
                    </span>
                    <span>{t.t1F4}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      ✓
                    </span>
                    <span>{t.t1F5}</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-400">
                    <span className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      ✕
                    </span>
                    <span>{t.t1F6}</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-400">
                    <span className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      ✕
                    </span>
                    <span>{t.t1F7}</span>
                  </li>
                </ul>
              </div>

              <div>
                {currentTier === 'LEVEL_1' ? (
                  <div className="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-center text-xs flex flex-col items-center justify-center gap-0.5">
                    <span>{t.currentActivePlan}</span>
                    {status.daysRemaining !== null && (
                      <span className="text-[11px] font-semibold text-emerald-600">({status.daysRemaining} {t.daysLeft})</span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handlePay('LEVEL_1', 'Level 1', 99)}
                    disabled={processingFeature !== null || currentTier === 'LEVEL_2' || currentTier === 'LEVEL_3'}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
                  >
                    {processingFeature === 'LEVEL_1' ? <Spinner size="sm" /> : t.t1Btn}
                  </button>
                )}
              </div>
            </div>

            {/* TIER 2: Level 2 (₹199) - RECOMMENDED */}
            <div className={`bg-white dark:bg-card-dark rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden transition ${currentTier === 'LEVEL_2' ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20' : 'border-2 border-primary/70 dark:border-primary ring-4 ring-primary/10'
              }`}>
              <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-extrabold uppercase px-3 py-0.5 rounded-bl-lg tracking-wider">
                {t.t2Rec}
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-border/60 dark:border-gray-700 pb-4">
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      {t.t2Badge}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                      {t.t2Title}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-primary">₹199</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{t.gstBadge}</p>
                    <p className="text-xs text-gray-400 font-medium">{t.validity}</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-gray-700 dark:text-gray-200">
                  <li className="flex items-start gap-2 text-primary font-bold">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      ★
                    </span>
                    <span><strong>{t.t2F1}</strong></span>
                  </li>
                  <li className="flex items-start gap-2 font-semibold">
                    <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      🚀
                    </span>
                    <span>{t.t2F2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      ✓
                    </span>
                    <span>{t.t2F3}</span>
                  </li>
                  <li className="flex items-start gap-2 font-semibold">
                    <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      💖
                    </span>
                    <span>{t.t2F4}</span>
                  </li>
                  <li className="flex items-start gap-2 font-semibold">
                    <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      💌
                    </span>
                    <span>{t.t2F5}</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-400">
                    <span className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      ✕
                    </span>
                    <span>{t.t2F6}</span>
                  </li>
                </ul>
              </div>

              <div>
                {currentTier === 'LEVEL_2' ? (
                  <div className="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-center text-xs flex flex-col items-center justify-center gap-0.5">
                    <span>{t.currentActivePlan}</span>
                    {status.daysRemaining !== null && (
                      <span className="text-[11px] font-semibold text-emerald-600">({status.daysRemaining} {t.daysLeft})</span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handlePay('LEVEL_2', 'Level 2', 199)}
                    disabled={processingFeature !== null || currentTier === 'LEVEL_3'}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {processingFeature === 'LEVEL_2' ? <Spinner size="sm" /> : t.t2Btn}
                  </button>
                )}
              </div>
            </div>

            {/* TIER 3: Level 3 (₹299) - VIP ALL-ACCESS */}
            <div className={`bg-gradient-to-b from-amber-500/10 via-white to-amber-500/5 dark:from-amber-950/30 dark:via-card-dark dark:to-amber-950/20 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden transition ${currentTier === 'LEVEL_3' ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20' : 'border-2 border-amber-500/80 dark:border-amber-400/80 ring-4 ring-amber-500/20'
              }`}>
              <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 text-[9px] font-black uppercase px-3.5 py-0.5 rounded-bl-lg tracking-wider shadow">
                {t.t3Rec}
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-amber-200 dark:border-amber-900/50 pb-4">
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      {t.t3Badge}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                      {t.t3Title}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">₹299</p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider">{t.gstBadge}</p>
                    <p className="text-xs text-gray-400 font-medium">{t.validity}</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-gray-700 dark:text-gray-200">
                  <li className="flex items-start gap-2 text-amber-600 dark:text-amber-400 font-bold">
                    <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      👑
                    </span>
                    <span><strong>{t.t3F1}</strong></span>
                  </li>
                  <li className="flex items-start gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      📱
                    </span>
                    <span>{t.t3F2}</span>
                  </li>
                  <li className="flex items-start gap-2 font-bold text-amber-700 dark:text-amber-300">
                    <span className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      🌟
                    </span>
                    <span>{t.t3F3}</span>
                  </li>
                  <li className="flex items-start gap-2 font-semibold">
                    <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      💖
                    </span>
                    <span>{t.t3F4}</span>
                  </li>
                  <li className="flex items-start gap-2 font-semibold">
                    <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      💌
                    </span>
                    <span>{t.t3F5}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center font-bold text-[10px] mt-0.5 shrink-0">
                      📜
                    </span>
                    <span>{t.t3F6}</span>
                  </li>
                </ul>
              </div>

              <div>
                {currentTier === 'LEVEL_3' ? (
                  <div className="w-full py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-center text-xs flex flex-col items-center justify-center gap-0.5">
                    <span>{t.vipAccessActive}</span>
                    {status.daysRemaining !== null && (
                      <span className="text-[11px] font-semibold text-emerald-600">({status.daysRemaining} {t.daysLeft})</span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handlePay('LEVEL_3', 'Level 3 VIP', 299)}
                    disabled={processingFeature !== null}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    {processingFeature === 'LEVEL_3' ? (
                      <Spinner size="sm" />
                    ) : currentTier !== 'FREE' ? (
                      t.t3BtnUpgrade
                    ) : (
                      t.t3BtnGet
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Trust & Safety Features Footer */}
        <div className="p-6 bg-white dark:bg-card-dark rounded-3xl border border-border/70 dark:border-gray-700/70 shadow-sm max-w-4xl mx-auto text-center space-y-4">
          <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
            {t.secTitle}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <span className="text-emerald-500 font-bold text-base">🛡️</span>
              <span>{t.sec1}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-blue-500 font-bold text-base">⚡</span>
              <span>{t.sec2}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-amber-500 font-bold text-base">✅</span>
              <span>{t.sec3}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Payment Result Modal Popup */}
      <PaymentResultModal
        isOpen={modalState.isOpen}
        isSuccess={modalState.isSuccess}
        title={modalState.title}
        message={modalState.message}
        details={modalState.details}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default PaymentPage;
