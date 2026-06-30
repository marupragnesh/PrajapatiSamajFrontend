import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import { getMyExpectations, saveExpectations } from '../api/profileApi';
import logger from '../utils/logger';

/**
 * ExpectationsPage — /profile/expectations
 *
 * Dedicated page for managing what the logged-in user wants in a partner.
 * All fields are optional — user may fill any or all.
 * Upsert: backend creates row if none exists, updates if it does.
 *
 * Navigates back to /profile/edit when done or cancelled.
 */
const MARITAL_STATUS_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'SINGLE', label: 'Single' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
];

const DIET_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'VEG', label: 'Vegetarian' },
  { value: 'NON_VEG', label: 'Non-Vegetarian' },
  { value: 'VEGAN', label: 'Vegan' },
];

const EMPTY_FORM = {
  minAge: '',
  maxAge: '',
  preferredMaritalStatus: '',
  preferredMinHeight: '',
  preferredMaxHeight: '',
  preferredCity: '',
  preferredEducation: '',
  preferredProfession: '',
  preferredIncome: '',
  preferredGotra: '',
  preferredDiet: '',
  preferredReligion: '',
  aboutExpectations: '',
};

const ExpectationsPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  /** Load existing expectations on mount */
  const loadExpectations = useCallback(async () => {
    logger.info('ExpectationsPage — loading expectations');
    setPageLoading(true);
    try {
      const data = await getMyExpectations();
      // Map nulls to empty string so inputs stay controlled
      setForm({
        minAge:                 data.minAge                 ?? '',
        maxAge:                 data.maxAge                 ?? '',
        preferredMaritalStatus: data.preferredMaritalStatus ?? '',
        preferredMinHeight:     data.preferredMinHeight     ?? '',
        preferredMaxHeight:     data.preferredMaxHeight     ?? '',
        preferredCity:          data.preferredCity          ?? '',
        preferredEducation:     data.preferredEducation     ?? '',
        preferredProfession:    data.preferredProfession    ?? '',
        preferredIncome:        data.preferredIncome        ?? '',
        preferredGotra:         data.preferredGotra         ?? '',
        preferredDiet:          data.preferredDiet          ?? '',
        preferredReligion:      data.preferredReligion      ?? '',
        aboutExpectations:      data.aboutExpectations      ?? '',
      });
    } catch (error) {
      logger.error('Failed to load expectations', error);
      toast.error('Could not load expectations. Please try again.');
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpectations();
  }, [loadExpectations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  /** Client-side validation — only cross-field rules (all fields optional) */
  const validate = () => {
    const newErrors = {};
    const minAge = Number(form.minAge);
    const maxAge = Number(form.maxAge);

    if (form.minAge && (minAge < 18 || minAge > 80)) newErrors.minAge = 'Age must be between 18 and 80';
    if (form.maxAge && (maxAge < 18 || maxAge > 80)) newErrors.maxAge = 'Age must be between 18 and 80';
    if (form.minAge && form.maxAge && minAge > maxAge) newErrors.maxAge = 'Max age must be greater than or equal to min age';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      // Send nulls for empty fields so backend stores null (not empty string)
      const payload = {
        minAge:                 form.minAge !== '' ? Number(form.minAge) : null,
        maxAge:                 form.maxAge !== '' ? Number(form.maxAge) : null,
        preferredMaritalStatus: form.preferredMaritalStatus || null,
        preferredMinHeight:     form.preferredMinHeight     || null,
        preferredMaxHeight:     form.preferredMaxHeight     || null,
        preferredCity:          form.preferredCity          || null,
        preferredEducation:     form.preferredEducation     || null,
        preferredProfession:    form.preferredProfession    || null,
        preferredIncome:        form.preferredIncome        || null,
        preferredGotra:         form.preferredGotra         || null,
        preferredDiet:          form.preferredDiet          || null,
        preferredReligion:      form.preferredReligion      || null,
        aboutExpectations:      form.aboutExpectations      || null,
      };

      await saveExpectations(payload);
      toast.success('Partner expectations saved!');
      navigate('/profile/edit');
    } catch (error) {
      logger.error('Failed to save expectations', error);
      toast.error(error.response?.data?.message || 'Could not save expectations. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary';

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

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/profile/edit')}
              className="text-gray-400 hover:text-primary transition"
              aria-label="Go back"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Partner Expectations
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                All fields are optional — fill what matters most to you.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* ── Age Range ── */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Age Range
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Min Age" error={errors.minAge}>
                  <input
                    type="number"
                    name="minAge"
                    value={form.minAge}
                    onChange={handleChange}
                    min={18}
                    max={80}
                    placeholder="e.g. 22"
                    className={inputClass}
                  />
                </Field>
                <Field label="Max Age" error={errors.maxAge}>
                  <input
                    type="number"
                    name="maxAge"
                    value={form.maxAge}
                    onChange={handleChange}
                    min={18}
                    max={80}
                    placeholder="e.g. 30"
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* ── Height Range ── */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Height Range
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Min Height">
                  <input
                    name="preferredMinHeight"
                    value={form.preferredMinHeight}
                    onChange={handleChange}
                    placeholder="e.g. 5'2&quot;"
                    className={inputClass}
                  />
                </Field>
                <Field label="Max Height">
                  <input
                    name="preferredMaxHeight"
                    value={form.preferredMaxHeight}
                    onChange={handleChange}
                    placeholder="e.g. 5'8&quot;"
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>

            {/* ── Personal Preferences ── */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Personal Preferences
              </h2>
              <div className="space-y-4">

                <Field label="Marital Status">
                  <select
                    name="preferredMaritalStatus"
                    value={form.preferredMaritalStatus}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {MARITAL_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Diet">
                  <select
                    name="preferredDiet"
                    value={form.preferredDiet}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    {DIET_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Gotra">
                  <input
                    name="preferredGotra"
                    value={form.preferredGotra}
                    onChange={handleChange}
                    placeholder="e.g. Kashyap"
                    className={inputClass}
                  />
                </Field>

                <Field label="Religion">
                  <input
                    name="preferredReligion"
                    value={form.preferredReligion}
                    onChange={handleChange}
                    placeholder="e.g. Hindu"
                    className={inputClass}
                  />
                </Field>

              </div>
            </section>

            {/* ── Professional Preferences ── */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Professional Preferences
              </h2>
              <div className="space-y-4">

                <Field label="Education">
                  <input
                    name="preferredEducation"
                    value={form.preferredEducation}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech or above"
                    className={inputClass}
                  />
                </Field>

                <Field label="Profession">
                  <input
                    name="preferredProfession"
                    value={form.preferredProfession}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer"
                    className={inputClass}
                  />
                </Field>

                <Field label="Monthly Income">
                  <input
                    name="preferredIncome"
                    value={form.preferredIncome}
                    onChange={handleChange}
                    placeholder="e.g. 40,000 - 80,000/month"
                    className={inputClass}
                  />
                </Field>

                <Field label="Preferred City">
                  <input
                    name="preferredCity"
                    value={form.preferredCity}
                    onChange={handleChange}
                    placeholder="e.g. Ahmedabad"
                    className={inputClass}
                  />
                </Field>

              </div>
            </section>

            {/* ── About Expectations ── */}
            <Field label="Anything Else (optional)">
              <textarea
                name="aboutExpectations"
                value={form.aboutExpectations}
                onChange={handleChange}
                rows={4}
                placeholder="Describe any other qualities or values you're looking for in a partner..."
                className={inputClass}
              />
            </Field>

            {/* ── Actions ── */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Spinner />}
                {saving ? 'Saving...' : 'Save Expectations'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile/edit')}
                className="px-5 py-2.5 rounded-lg border border-border dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

/** Label + input + inline error wrapper */
const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    {children}
    {error && <p className="text-error text-xs mt-1">{error}</p>}
  </div>
);

export default ExpectationsPage;
