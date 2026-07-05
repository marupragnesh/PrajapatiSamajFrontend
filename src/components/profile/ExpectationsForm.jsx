import { useState, useEffect } from 'react';
import Spinner from '../common/Spinner';

/**
 * Reusable form for editing partner expectations.
 * Used on EditProfilePage and ExpectationsPage.
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

const ExpectationsForm = ({
  initialData = {},
  onSubmit,
  loading,
  serverError,
  submitLabel = 'Save Expectations',
}) => {
  const [form, setForm] = useState({
    minAge:                 initialData.minAge                 ?? '',
    maxAge:                 initialData.maxAge                 ?? '',
    preferredMaritalStatus: initialData.preferredMaritalStatus ?? '',
    preferredMinHeight:     initialData.preferredMinHeight     ?? '',
    preferredMaxHeight:     initialData.preferredMaxHeight     ?? '',
    preferredCity:          initialData.preferredCity          ?? '',
    preferredEducation:     initialData.preferredEducation     ?? '',
    preferredProfession:    initialData.preferredProfession    ?? '',
    preferredIncome:        initialData.preferredIncome        ?? '',
    preferredGotra:         initialData.preferredGotra         ?? '',
    preferredDiet:          initialData.preferredDiet          ?? '',
    preferredReligion:      initialData.preferredReligion      ?? '',
    aboutExpectations:      initialData.aboutExpectations      ?? '',
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setForm({
        minAge:                 initialData.minAge                 ?? '',
        maxAge:                 initialData.maxAge                 ?? '',
        preferredMaritalStatus: initialData.preferredMaritalStatus ?? '',
        preferredMinHeight:     initialData.preferredMinHeight     ?? '',
        preferredMaxHeight:     initialData.preferredMaxHeight     ?? '',
        preferredCity:          initialData.preferredCity          ?? '',
        preferredEducation:     initialData.preferredEducation     ?? '',
        preferredProfession:    initialData.preferredProfession    ?? '',
        preferredIncome:        initialData.preferredIncome        ?? '',
        preferredGotra:         initialData.preferredGotra         ?? '',
        preferredDiet:          initialData.preferredDiet          ?? '',
        preferredReligion:      initialData.preferredReligion      ?? '',
        aboutExpectations:      initialData.aboutExpectations      ?? '',
      });
    }
  }, [initialData]);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const minAge = Number(form.minAge);
    const maxAge = Number(form.maxAge);

    if (form.minAge && (minAge < 18 || minAge > 80)) newErrors.minAge = 'Age must be between 18 and 80';
    if (form.maxAge && (maxAge < 18 || maxAge > 80)) newErrors.maxAge = 'Age must be between 18 and 80';
    if (form.minAge && form.maxAge && minAge > maxAge) newErrors.maxAge = 'Max age must be greater than or equal to min age';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    onSubmit({
      minAge:                 form.minAge !== '' ? Number(form.minAge) : null,
      maxAge:                 form.maxAge !== '' ? Number(form.maxAge) : null,
      preferredMaritalStatus: form.preferredMaritalStatus || null,
      preferredMinHeight:     form.preferredMinHeight     || null,
      preferredMaxHeight:     form.preferredMaxHeight     || null,
      preferredCity:          form.preferredCity.trim()   || null,
      preferredEducation:     form.preferredEducation.trim() || null,
      preferredProfession:    form.preferredProfession.trim() || null,
      preferredIncome:        form.preferredIncome.trim()  || null,
      preferredGotra:         form.preferredGotra.trim()   || null,
      preferredDiet:          form.preferredDiet          || null,
      preferredReligion:      form.preferredReligion.trim() || null,
      aboutExpectations:      form.aboutExpectations.trim() || null,
    });
  };

  const inputClass =
    'w-full px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* Age preference */}
      <SectionTitle>Age &amp; Marital Status</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Min Age" error={errors.minAge}>
          <input type="number" name="minAge" value={form.minAge} onChange={handleChange}
            min={18} max={80} placeholder="21" className={inputClass} />
        </Field>
        <Field label="Max Age" error={errors.maxAge}>
          <input type="number" name="maxAge" value={form.maxAge} onChange={handleChange}
            min={18} max={80} placeholder="30" className={inputClass} />
        </Field>
      </div>

      <Field label="Preferred Marital Status">
        <select name="preferredMaritalStatus" value={form.preferredMaritalStatus} onChange={handleChange} className={inputClass}>
          {MARITAL_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </Field>

      {/* Height preference */}
      <SectionTitle>Height Preference</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Min Height">
          <input name="preferredMinHeight" value={form.preferredMinHeight} onChange={handleChange}
            placeholder="e.g. 5'2&quot;" className={inputClass} />
        </Field>
        <Field label="Max Height">
          <input name="preferredMaxHeight" value={form.preferredMaxHeight} onChange={handleChange}
            placeholder="e.g. 6'0&quot;" className={inputClass} />
        </Field>
      </div>

      {/* Professional & Location */}
      <SectionTitle>Education, Profession &amp; Location</SectionTitle>
      <Field label="Preferred City">
        <input name="preferredCity" value={form.preferredCity} onChange={handleChange}
          placeholder="e.g. Ahmedabad, Surat" className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Preferred Education">
          <input name="preferredEducation" value={form.preferredEducation} onChange={handleChange}
            placeholder="e.g. Graduate / B.Tech" className={inputClass} />
        </Field>
        <Field label="Preferred Profession">
          <input name="preferredProfession" value={form.preferredProfession} onChange={handleChange}
            placeholder="e.g. Engineer, Doctor" className={inputClass} />
        </Field>
      </div>

      <Field label="Preferred Monthly Income">
        <input name="preferredIncome" value={form.preferredIncome} onChange={handleChange}
          placeholder="e.g. 40,000+/month" className={inputClass} />
      </Field>

      {/* Community & Personal */}
      <SectionTitle>Community &amp; Lifestyle</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Preferred Gotra">
          <input name="preferredGotra" value={form.preferredGotra} onChange={handleChange}
            placeholder="e.g. Any / Specific Gotra" className={inputClass} />
        </Field>
        <Field label="Preferred Diet">
          <select name="preferredDiet" value={form.preferredDiet} onChange={handleChange} className={inputClass}>
            {DIET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Preferred Religion">
        <input name="preferredReligion" value={form.preferredReligion} onChange={handleChange}
          placeholder="Hindu" className={inputClass} />
      </Field>

      {/* About expectations */}
      <SectionTitle>Other Expectations (Optional)</SectionTitle>
      <Field label="About Expectations">
        <textarea name="aboutExpectations" value={form.aboutExpectations} onChange={handleChange}
          rows={4} placeholder="Describe any other preferences you have in mind for your partner..." className={inputClass} />
      </Field>

      {serverError && <p className="text-error text-sm">{serverError}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold
                   hover:bg-primary-light transition disabled:opacity-60
                   flex items-center justify-center gap-2"
      >
        {loading && <Spinner />}
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

const SectionTitle = ({ children }) => (
  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide pt-2">
    {children}
  </p>
);

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    {children}
    {error && <p className="text-error text-xs mt-1">{error}</p>}
  </div>
);

export default ExpectationsForm;
