import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import ExpectationsForm from '../components/profile/ExpectationsForm';
import { getMyExpectations, saveExpectations } from '../api/profileApi';
import logger from '../utils/logger';

/**
 * ExpectationsPage — /profile/expectations
 *
 * Dedicated page for managing what the logged-in user wants in a partner.
 * Navigates back to /profile/edit when done.
 */
const ExpectationsPage = () => {
  const navigate = useNavigate();

  const [expectations, setExpectations] = useState(null);
  const [pageLoading, setPageLoading]   = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');

  /** Load existing expectations on mount */
  const loadExpectations = useCallback(async () => {
    logger.info('ExpectationsPage — loading expectations');
    setPageLoading(true);
    try {
      const data = await getMyExpectations();
      setExpectations(data || {});
    } catch (err) {
      logger.error('Failed to load expectations', err);
      toast.error('Could not load expectations. Please try again.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpectations();
  }, [loadExpectations]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    setError('');
    try {
      await saveExpectations(payload);
      toast.success('Partner expectations saved!');
      navigate('/profile/edit');
    } catch (err) {
      logger.error('Failed to save expectations', err);
      const msg = err.response?.data?.message || 'Could not save expectations. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <button
          onClick={() => navigate('/profile/edit')}
          className="text-sm text-gray-500 dark:text-gray-400 hover:underline flex items-center gap-1"
        >
          ← Back to Profile
        </button>

        <section className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            Partner Expectations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Tell others what you are looking for in a partner. All fields are optional.
          </p>

          <ExpectationsForm
            initialData={expectations || {}}
            onSubmit={handleSubmit}
            loading={saving}
            serverError={error}
            submitLabel="Save Expectations"
          />
        </section>

      </div>
    </div>
  );
};

export default ExpectationsPage;
