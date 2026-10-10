import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Send,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  User,
  MapPin,
  Briefcase,
  X,
  Check
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import {
  getInterestsReceived,
  getSentInterests,
  acceptInterest,
  declineInterest,
  cancelInterest,
} from '../api/interestApi';
import { resolveImageUrl } from '../utils/imageHelper';
import logger from '../utils/logger';

/**
 * InterestsReceivedPage — /interests
 *
 * Scope:
 *   - Shows Sent Interest Requests and Received Interest Requests.
 *   - Under Sent:
 *       1. Sent Interest Requests (All)
 *       2. Accepted Interests
 *       3. Pending Interests
 *       4. Not Interested (Declined requests displayed with status "Not Interested")
 *   - These statuses and views are available ONLY on this Interest page.
 */
const InterestsReceivedPage = () => {
  const navigate = useNavigate();

  // Active main tab: 'received' (default) or 'sent'
  const [activeMainTab, setActiveMainTab] = useState('received');

  // Sent filter status: 'ALL', 'PENDING', 'ACCEPTED', 'DECLINED' (Not Interested)
  const [sentFilter, setSentFilter] = useState('ALL');

  // Data states
  const [sentInterests, setSentInterests] = useState([]);
  const [receivedInterests, setReceivedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch both Sent and Received requests
  const fetchData = async () => {
    setLoading(true);
    try {
      logger.api('GET', '/api/interests/sent & /api/interests/received');
      const [sentData, receivedData] = await Promise.all([
        getSentInterests(),
        getInterestsReceived(),
      ]);
      setSentInterests(sentData || []);
      setReceivedInterests(receivedData || []);
    } catch (error) {
      logger.error('Failed to load interests', error);
      toast.error('Could not load interest requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Sent Interests
  const filteredSentInterests = sentInterests.filter((item) => {
    if (sentFilter === 'ALL') return true;
    return item.status === sentFilter;
  });

  // Sent counts
  const sentCounts = {
    all: sentInterests.length,
    pending: sentInterests.filter((i) => i.status === 'PENDING').length,
    accepted: sentInterests.filter((i) => i.status === 'ACCEPTED').length,
    declined: sentInterests.filter((i) => i.status === 'DECLINED').length,
  };

  // Received Actions
  const handleAccept = async (interestId) => {
    setActionLoadingId(interestId);
    try {
      const data = await acceptInterest(interestId);
      toast.success(data.message || 'Interest accepted! You have a new match 🎉');
      setReceivedInterests((prev) => prev.filter((i) => i.interestId !== interestId));
    } catch (error) {
      logger.error('Accept failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not accept. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (interestId) => {
    setActionLoadingId(interestId);
    try {
      const data = await declineInterest(interestId);
      toast.success(data.message || 'Interest declined.');
      setReceivedInterests((prev) => prev.filter((i) => i.interestId !== interestId));
    } catch (error) {
      logger.error('Decline failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not decline. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Withdraw Sent Interest
  const handleWithdrawSent = async (profileId, interestId) => {
    if (!profileId) return;
    setActionLoadingId(interestId);
    try {
      await cancelInterest(profileId);
      toast.success('Interest request withdrawn successfully.');
      setSentInterests((prev) => prev.filter((i) => i.interestId !== interestId));
    } catch (error) {
      logger.error('Withdraw interest failed', error);
      toast.error(error.response?.data?.message || 'Could not withdraw interest.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <Send className="w-6 h-6 text-primary" />
            <span>Interest Hub</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            View all interest requests you have sent and manage incoming requests received from other members.
          </p>
        </div>

        {/* Top Main Tabs: Sent Interests vs Received Interests */}
        <div className="flex items-center gap-2 border-b border-border/80 pb-3">
          <button
            onClick={() => setActiveMainTab('sent')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'sent'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-300 border border-border hover:border-primary'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Sent Interests</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeMainTab === 'sent'
                  ? 'bg-white text-primary'
                  : 'bg-primary/10 text-primary dark:bg-primary/20'
              }`}
            >
              {sentCounts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('received')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'received'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-card-dark text-gray-600 dark:text-gray-300 border border-border hover:border-primary'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Received Requests</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                activeMainTab === 'received'
                  ? 'bg-white text-primary'
                  : 'bg-primary/10 text-primary dark:bg-primary/20'
              }`}
            >
              {receivedInterests.length}
            </span>
          </button>
        </div>

        {/* ── SENT INTERESTS VIEW ── */}
        {activeMainTab === 'sent' && (
          <div className="space-y-5">
            {/* Filter Sub-Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-card-dark p-2 rounded-2xl border border-border shadow-sm">
              <span className="text-xs font-semibold text-gray-500 px-2 hidden sm:inline">
                Status Filter:
              </span>

              {/* All */}
              <button
                onClick={() => setSentFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  sentFilter === 'ALL'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-primary'
                }`}
              >
                <span>All Sent</span>
                <span className="opacity-80">({sentCounts.all})</span>
              </button>

              {/* Pending */}
              <button
                onClick={() => setSentFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  sentFilter === 'PENDING'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-amber-600'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending</span>
                <span className="opacity-80">({sentCounts.pending})</span>
              </button>

              {/* Accepted */}
              <button
                onClick={() => setSentFilter('ACCEPTED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  sentFilter === 'ACCEPTED'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-emerald-600'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accepted</span>
                <span className="opacity-80">({sentCounts.accepted})</span>
              </button>

              {/* Not Interested */}
              <button
                onClick={() => setSentFilter('DECLINED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  sentFilter === 'DECLINED'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-rose-600'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Not Interested</span>
                <span className="opacity-80">({sentCounts.declined})</span>
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-white dark:bg-card-dark p-4 animate-pulse">
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sent Cards List */}
            {!loading && filteredSentInterests.length > 0 && (
              <div className="space-y-3.5">
                {filteredSentInterests.map((item) => (
                  <SentInterestCard
                    key={item.interestId}
                    interest={item}
                    onWithdraw={handleWithdrawSent}
                    isActing={actionLoadingId === item.interestId}
                    onNavigate={(profileId) => navigate(`/profiles/${profileId}`)}
                  />
                ))}
              </div>
            )}

            {/* Empty States */}
            {!loading && filteredSentInterests.length === 0 && (
              <EmptyState
                icon={<Send className="w-10 h-10 text-gray-400" />}
                title={
                  sentFilter === 'PENDING'
                    ? 'No Pending Interests'
                    : sentFilter === 'ACCEPTED'
                    ? 'No Accepted Interests Yet'
                    : sentFilter === 'DECLINED'
                    ? 'No Declined Interests'
                    : 'No Sent Interests'
                }
                message={
                  sentFilter === 'PENDING'
                    ? 'You have no pending interest requests at the moment.'
                    : sentFilter === 'ACCEPTED'
                    ? 'None of your sent interests have been accepted yet. Visit Discover to connect with new matches!'
                    : sentFilter === 'DECLINED'
                    ? 'No one has marked your interest as Not Interested.'
                    : 'You have not sent an interest request to anyone yet. Visit Discover to send interest to profiles you like!'
                }
              />
            )}
          </div>
        )}

        {/* ── RECEIVED INTERESTS VIEW ── */}
        {activeMainTab === 'received' && (
          <div className="space-y-4">
            {loading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border bg-white dark:bg-card-dark p-4 animate-pulse">
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && receivedInterests.length > 0 && (
              <div className="space-y-4">
                {receivedInterests.map((interest) => (
                  <ReceivedInterestCard
                    key={interest.interestId}
                    interest={interest}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                    isActing={actionLoadingId === interest.interestId}
                    onNavigate={(profileId) => navigate(`/profiles/${profileId}`)}
                  />
                ))}
              </div>
            )}

            {!loading && receivedInterests.length === 0 && (
              <EmptyState
                icon={<Inbox className="w-10 h-10 text-gray-400" />}
                title="No Pending Received Requests"
                message="You have no pending interest requests right now. Visit Discover to find people you like!"
              />
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

/**
 * SentInterestCard — Displays an interest request sent by the current user.
 * Displays explicit status:
 *   - "Pending" (with withdraw button)
 *   - "Accepted" (with view profile button)
 *   - "Not Interested" (for declined requests)
 */
const SentInterestCard = ({ interest, onWithdraw, isActing, onNavigate }) => {
  const {
    interestId,
    receiverProfileId,
    receiverFullName,
    receiverAge,
    receiverCity,
    receiverProfession,
    receiverPrimaryPhotoUrl,
    status,
    displayStatus,
    requestedAt,
  } = interest;

  const formattedDate = requestedAt
    ? new Date(requestedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <div className="rounded-2xl border border-border bg-white dark:bg-card-dark p-4 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      {/* Recipient Photo + Basic Info */}
      <div
        onClick={() => receiverProfileId && onNavigate(receiverProfileId)}
        className="flex items-center gap-4 cursor-pointer min-w-0 flex-1"
      >
        <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-border/60">
          {receiverPrimaryPhotoUrl ? (
            <img
              src={resolveImageUrl(receiverPrimaryPhotoUrl)}
              alt={receiverFullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <User className="w-8 h-8 text-gray-300 dark:text-gray-600 stroke-1" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate hover:text-primary transition">
              {receiverFullName || 'Member Profile'}
            </h3>

            {/* Status Pill on Interest Page Only */}
            {status === 'ACCEPTED' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accepted</span>
              </span>
            )}

            {status === 'PENDING' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Pending</span>
              </span>
            )}

            {status === 'DECLINED' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>{displayStatus || 'Not Interested'}</span>
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span>{receiverAge ? `${receiverAge} yrs` : ''}</span>
            {receiverCity && (
              <span className="inline-flex items-center">
                · <MapPin className="w-3 h-3 text-gray-400 mx-0.5 inline" /> {receiverCity}
              </span>
            )}
          </p>

          {receiverProfession && (
            <p className="text-xs font-medium text-primary truncate flex items-center gap-1">
              <Briefcase className="w-3 h-3 shrink-0" />
              <span>{receiverProfession}</span>
            </p>
          )}

          {formattedDate && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 pt-0.5">
              Sent on {formattedDate}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:pl-4 sm:border-l border-border/60 shrink-0 justify-end">
        {status === 'PENDING' && (
          <button
            onClick={() => onWithdraw(receiverProfileId, interestId)}
            disabled={isActing}
            className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            {isActing ? <Spinner size="xs" /> : <X className="w-3.5 h-3.5" />}
            <span>Withdraw</span>
          </button>
        )}

        <button
          onClick={() => receiverProfileId && onNavigate(receiverProfileId)}
          className="px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
        >
          <span>View Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/**
 * ReceivedInterestCard — Displays incoming requests with Accept/Decline actions.
 */
const ReceivedInterestCard = ({ interest, onAccept, onDecline, isActing, onNavigate }) => {
  const {
    interestId,
    senderProfileId,
    senderFullName,
    senderAge,
    senderCity,
    senderProfession,
    senderPrimaryPhotoUrl,
    requestedAt,
  } = interest;

  const formattedDate = requestedAt
    ? new Date(requestedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <div className="rounded-2xl border border-border bg-white dark:bg-card-dark p-4 shadow-sm space-y-4">
      <div
        onClick={() => senderProfileId && onNavigate(senderProfileId)}
        className="flex gap-4 items-start cursor-pointer"
      >
        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-border/60">
          {senderPrimaryPhotoUrl ? (
            <img
              src={resolveImageUrl(senderPrimaryPhotoUrl)}
              alt={senderFullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <User className="w-8 h-8 text-gray-300 dark:text-gray-600 stroke-1" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate hover:text-primary transition">
            {senderFullName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span>{senderAge ? `${senderAge} yrs` : ''}</span>
            {senderCity && (
              <span className="inline-flex items-center">
                · <MapPin className="w-3 h-3 text-gray-400 mx-0.5 inline" /> {senderCity}
              </span>
            )}
          </p>
          {senderProfession && (
            <p className="text-xs text-primary truncate mt-0.5 flex items-center gap-1">
              <Briefcase className="w-3 h-3 shrink-0" />
              <span>{senderProfession}</span>
            </p>
          )}
          {formattedDate && (
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              Received on {formattedDate}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-1 border-t border-border/50">
        <button
          onClick={() => onAccept(interestId)}
          disabled={isActing}
          className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          {isActing ? <Spinner size="xs" color="white" /> : <Check className="w-3.5 h-3.5" />}
          <span>Accept Request</span>
        </button>

        <button
          onClick={() => onDecline(interestId)}
          disabled={isActing}
          className="flex-1 py-2.5 rounded-xl border border-rose-500 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Decline</span>
        </button>
      </div>
    </div>
  );
};

export default InterestsReceivedPage;
