import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import { getInterestsReceived, acceptInterest, declineInterest } from '../api/interestApi';
import logger from '../utils/logger';

/**
 * InterestsReceivedPage — view and respond to pending interest requests.
 *
 * Each card shows sender info with Accept ✅ and Decline ❌ buttons.
 * On action → card is removed from list immediately (optimistic update).
 * Empty state shown when no pending interests remain.
 */
const InterestsReceivedPage = () => {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null); // track which card is acting

  /** Load pending interest requests on mount */
  useEffect(() => {
    const fetchInterests = async () => {
      logger.info('InterestsReceivedPage loaded');
      setLoading(true);
      try {
        logger.api('GET', '/api/interests/received');
        const data = await getInterestsReceived();
        logger.response('/api/interests/received', { count: data.length });
        setInterests(data);
      } catch (error) {
        logger.error('Failed to load interests', error);
        toast.error('Could not load interest requests. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  /** Remove an interest card from the list by interestId */
  const removeFromList = (interestId) => {
    setInterests((prev) => prev.filter((i) => i.interestId !== interestId));
  };

  /** Accept an interest request */
  const handleAccept = async (interestId) => {
    logger.info('User clicked Accept', { interestId });
    setActionLoadingId(interestId);
    try {
      logger.api('PUT', `/api/interests/${interestId}/accept`);
      const data = await acceptInterest(interestId);
      logger.info('Interest accepted — removing from list', { interestId });
      toast.success(data.message || 'Interest accepted! You have a new match 🎉');
      removeFromList(interestId); // optimistic remove
    } catch (error) {
      logger.error('Action failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not accept. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  /** Decline an interest request */
  const handleDecline = async (interestId) => {
    logger.info('User clicked Decline', { interestId });
    setActionLoadingId(interestId);
    try {
      logger.api('PUT', `/api/interests/${interestId}/decline`);
      const data = await declineInterest(interestId);
      logger.info('Interest declined — removing from list', { interestId });
      toast.success(data.message || 'Interest declined.');
      removeFromList(interestId); // optimistic remove
    } catch (error) {
      logger.error('Action failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not decline. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">💌 Interest Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            People who have sent you an interest request
          </p>
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white dark:bg-card-dark p-4 animate-pulse">
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interest cards */}
        {!loading && interests.length > 0 && (
          <div className="space-y-4">
            {interests.map((interest) => (
              <InterestCard
                key={interest.interestId}
                interest={interest}
                onAccept={handleAccept}
                onDecline={handleDecline}
                isActing={actionLoadingId === interest.interestId}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && interests.length === 0 && (
          <EmptyState
            icon="💌"
            title="No Pending Requests"
            message="You have no pending interest requests right now. Visit Discover to find people you like!"
          />
        )}
      </div>
    </div>
  );
};

/**
 * InterestCard — shows sender info + Accept/Decline buttons.
 * isActing: disables both buttons while one action is in progress.
 */
const InterestCard = ({ interest, onAccept, onDecline, isActing }) => {
  const {
    interestId,
    senderFullName,
    senderAge,
    senderCity,
    senderProfession,
    senderPrimaryPhotoUrl,
    requestedAt,
  } = interest;

  /** Format the received date for display */
  const formattedDate = requestedAt
    ? new Date(requestedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <div className="rounded-2xl border border-border bg-white dark:bg-card-dark p-4 shadow-sm">
      <div className="flex gap-4 items-start">
        {/* Sender photo */}
        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0">
          {senderPrimaryPhotoUrl ? (
            <img
              src={senderPrimaryPhotoUrl}
              alt={senderFullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">
              👤
            </div>
          )}
        </div>

        {/* Sender info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{senderFullName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {senderAge} yrs · {senderCity}
          </p>
          <p className="text-sm text-primary truncate">{senderProfession}</p>
          {formattedDate && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Received on {formattedDate}
            </p>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        {/* Accept */}
        <button
          onClick={() => onAccept(interestId)}
          disabled={isActing}
          className="flex-1 py-2.5 rounded-xl bg-success text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isActing ? <Spinner /> : '✅'}
          {isActing ? 'Processing...' : 'Accept'}
        </button>

        {/* Decline */}
        <button
          onClick={() => onDecline(interestId)}
          disabled={isActing}
          className="flex-1 py-2.5 rounded-xl border border-error text-error text-sm font-semibold hover:bg-error hover:text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {!isActing && '❌'}
          {isActing ? 'Processing...' : 'Decline'}
        </button>
      </div>
    </div>
  );
};

export default InterestsReceivedPage;
