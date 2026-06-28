# PrajapatiSamaj Frontend — Project Tracker

## Project Details
| Field         | Value |
|---------------|-------|
| Project Name  | PrajapatiSamaj Matrimonial Platform |
| Stack         | React 18 + Vite + TailwindCSS |
| Backend URL   | http://localhost:8080 (Spring Boot 3.2.5) |
| Auth          | JWT Bearer Token (localStorage, 24h expiry) |
| Root Dir      | D:\Projects\PrajapatiSamajFrontEnd |
| Spec File     | PrajapatiSamaj_Frontend_Spec.md |

---

## Completion Progress

### ✅ Session 1 (Claude limit hit mid-way)
| File | Status |
|------|--------|
| `src/utils/logger.js` | ✅ Done |
| `src/utils/tokenHelper.js` | ✅ Done |
| `src/api/axiosInstance.js` | ✅ Done |
| `src/api/authApi.js` | ✅ Done |
| `src/api/profileApi.js` | ✅ Done |
| `src/api/discoverApi.js` | ✅ Done |
| `src/api/likeApi.js` | ✅ Done |
| `src/api/interestApi.js` | ✅ Done |
| `src/context/AuthContext.jsx` | ✅ Done |
| `src/hooks/useAuth.js` | ✅ Done |
| `src/components/common/Navbar.jsx` | ✅ Done |
| `src/components/common/Spinner.jsx` | ✅ Done |
| `src/components/common/SkeletonCard.jsx` | ✅ Done |
| `src/components/common/EmptyState.jsx` | ✅ Done |
| `src/components/common/ConfirmDialog.jsx` | ✅ Done |
| `src/components/common/ProfileCard.jsx` | ✅ Done |
| `src/components/auth/RegisterForm.jsx` | ✅ Done |
| `src/components/auth/LoginForm.jsx` | ✅ Done |
| `src/components/profile/ProfileForm.jsx` | ✅ Done |
| `src/components/profile/PhotoUpload.jsx` | ✅ Done |
| `src/pages/RegisterPage.jsx` | ✅ Done |
| `src/pages/LoginPage.jsx` | ✅ Done |
| `src/pages/ForgotPasswordPage.jsx` | ✅ Done |
| `src/pages/VerifyOtpPage.jsx` | ✅ Done |
| `src/pages/ResetPasswordPage.jsx` | ✅ Done |

### ✅ Session 2 (This session — completed remaining files)
| File | Status |
|------|--------|
| `src/main.jsx` | ✅ Done |
| `src/App.jsx` | ✅ Done |
| `src/pages/ProfileSetupPage.jsx` | ✅ Done |
| `src/pages/EditProfilePage.jsx` | ✅ Done |
| `src/pages/DiscoverPage.jsx` | ✅ Done |
| `src/pages/ProfileDetailPage.jsx` | ✅ Done |
| `src/pages/LikesReceivedPage.jsx` | ✅ Done |
| `src/pages/InterestsReceivedPage.jsx` | ✅ Done |
| `src/pages/MatchesPage.jsx` | ✅ Done |

**🎉 ALL PHASE 1 FILES COMPLETE**

---

## Known Limitations / TODOs (from spec)

| # | Item | Notes |
|---|------|-------|
| 1 | Photo ID workaround | Backend `photoUrls` is `List<String>` — no photoId. Frontend uses filename from URL as proxy ID. Ask backend to return `List<PhotoDto>` with `{id, url, isPrimary}`. |
| 2 | Matches endpoint bug | Backend `getMatches()` always picks `receiver` as matched user — wrong when current user is receiver. Backend fix needed. |

---

## Phase 2 Features (NOT built — future work)

- Premium Filter Pack (age, height, city, religion, education, profession)
- Contact Number reveal after match (paid)
- Unlimited Likes (currently 3/day)
- Payment Integration (Razorpay / Stripe)
- Admin Panel
- Server-side JWT logout / token blacklist

---

## How to Run

```bash
cd D:\Projects\PrajapatiSamajFrontEnd
npm install
npm run dev
# App runs at http://localhost:5173
# Backend must be running at http://localhost:8080
```
