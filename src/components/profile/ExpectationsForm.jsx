import { useState, useEffect } from 'react';
import Spinner from '../common/Spinner';
import { translations } from '../../utils/translations';

/**
 * Reusable form for adding/editing partner expectations.
 * Displays "Add Partner Expectation" on first fill and "Edit Partner Expectation" thereafter.
 * Used on EditProfilePage and ExpectationsPage with Gujarati/English label toggle.
 */

const ExpectationsForm = ({
  initialData = {},
  onSubmit,
  loading,
  serverError,
  submitLabel = 'Save Expectations',
}) => {
  const [lang, setLang] = useState(() => localStorage.getItem('prajapati_lang_pref') || 'gu');
  const t = translations[lang] || translations.gu;

  const toggleLanguage = (selectedLang) => {
    setLang(selectedLang);
    localStorage.setItem('prajapati_lang_pref', selectedLang);
  };

  const hasExistingData = Boolean(
    initialData &&
    Object.values(initialData).some((v) => v !== null && v !== undefined && v !== '')
  );

  const formHeading = hasExistingData ? t.editExpectationTitle : t.addExpectationTitle;

  const [form, setForm] = useState({
    minAge:                 initialData.minAge                 ?? '',
    maxAge:                 initialData.maxAge                 ?? '',
    preferredMaritalStatus: initialData.preferredMaritalStatus ?? '',
    preferredMinHeight:     initialData.preferredMinHeight     ?? '',
    preferredMaxHeight:     initialData.preferredMaxHeight     ?? '',
    preferredMinWeight:     initialData.preferredMinWeight     ?? '',
    preferredMaxWeight:     initialData.preferredMaxWeight     ?? '',
    preferredCity:          initialData.preferredCity          ?? '',
    preferredState:         initialData.preferredState         ?? '',
    preferredHasMangal:     initialData.preferredHasMangal === true ? 'true' : initialData.preferredHasMangal === false ? 'false' : '',
    preferredHasSani:       initialData.preferredHasSani === true ? 'true' : initialData.preferredHasSani === false ? 'false' : '',
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
        preferredMinWeight:     initialData.preferredMinWeight     ?? '',
        preferredMaxWeight:     initialData.preferredMaxWeight     ?? '',
        preferredCity:          initialData.preferredCity          ?? '',
        preferredState:         initialData.preferredState         ?? '',
        preferredHasMangal:     initialData.preferredHasMangal === true ? 'true' : initialData.preferredHasMangal === false ? 'false' : '',
        preferredHasSani:       initialData.preferredHasSani === true ? 'true' : initialData.preferredHasSani === false ? 'false' : '',
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
      preferredMinWeight:     form.preferredMinWeight !== '' ? Number(form.preferredMinWeight) : null,
      preferredMaxWeight:     form.preferredMaxWeight !== '' ? Number(form.preferredMaxWeight) : null,
      preferredCity:          form.preferredCity.trim()   || null,
      preferredState:         form.preferredState.trim()  || null,
      preferredHasMangal:     form.preferredHasMangal === 'true' ? true : form.preferredHasMangal === 'false' ? false : null,
      preferredHasSani:       form.preferredHasSani === 'true' ? true : form.preferredHasSani === 'false' ? false : null,
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

      {/* ── Language & Dynamic Title Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 mb-2">
        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>💖</span> {formHeading}
        </h3>
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg border border-border dark:border-gray-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => toggleLanguage('gu')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              lang === 'gu'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            ગુજરાતી
          </button>
          <button
            type="button"
            onClick={() => toggleLanguage('en')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              lang === 'en'
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Age & Physical preference */}
      <SectionTitle>Age, Height &amp; Weight Preference</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t.preferredAgeMin} error={errors.minAge}>
          <input type="number" name="minAge" value={form.minAge} onChange={handleChange}
            min={18} max={80} placeholder="21" className={inputClass} />
        </Field>
        <Field label={t.preferredAgeMax} error={errors.maxAge}>
          <input type="number" name="maxAge" value={form.maxAge} onChange={handleChange}
            min={18} max={80} placeholder="30" className={inputClass} />
        </Field>
      </div>

      <Field label={t.preferredMaritalStatus}>
        <select name="preferredMaritalStatus" value={form.preferredMaritalStatus} onChange={handleChange} className={inputClass}>
          <option value="">{t.any}</option>
          <option value="SINGLE">{t.maritalStatusSingle}</option>
          <option value="DIVORCED">{t.maritalStatusDivorced}</option>
          <option value="WIDOWED">{t.maritalStatusWidowed}</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t.preferredHeightMin}>
          <input name="preferredMinHeight" value={form.preferredMinHeight} onChange={handleChange}
            placeholder="e.g. 5'2&quot;" className={inputClass} />
        </Field>
        <Field label={t.preferredHeightMax}>
          <input name="preferredMaxHeight" value={form.preferredMaxHeight} onChange={handleChange}
            placeholder="e.g. 6'0&quot;" className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Min Weight (kg)">
          <input type="number" step="0.01" name="preferredMinWeight" value={form.preferredMinWeight} onChange={handleChange}
            placeholder="e.g. 45" className={inputClass} />
        </Field>
        <Field label="Max Weight (kg)">
          <input type="number" step="0.01" name="preferredMaxWeight" value={form.preferredMaxWeight} onChange={handleChange}
            placeholder="e.g. 75" className={inputClass} />
        </Field>
      </div>

      {/* Professional & Location */}
      <SectionTitle>Education, Profession &amp; Location</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Preferred City">
          <input name="preferredCity" value={form.preferredCity} onChange={handleChange}
            placeholder="e.g. Ahmedabad, Surat" className={inputClass} />
        </Field>
        <Field label="Preferred State">
          <input name="preferredState" value={form.preferredState} onChange={handleChange}
            placeholder="e.g. Gujarat, Maharashtra" className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label={t.preferredEducation}>
          <input name="preferredEducation" value={form.preferredEducation} onChange={handleChange}
            placeholder="e.g. Graduate / B.Tech" className={inputClass} />
        </Field>
        <Field label={t.preferredProfession}>
          <input name="preferredProfession" value={form.preferredProfession} onChange={handleChange}
            placeholder="e.g. Engineer, Doctor" className={inputClass} />
        </Field>
      </div>

      <Field label={t.preferredIncome}>
        <input name="preferredIncome" value={form.preferredIncome} onChange={handleChange}
          placeholder="e.g. 40,000+/month" className={inputClass} />
      </Field>

      {/* Horoscope & Mangal / Shani */}
      <SectionTitle>Horoscope &amp; Dosha Preferences</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t.preferredMangal}>
          <select name="preferredHasMangal" value={form.preferredHasMangal} onChange={handleChange} className={inputClass}>
            <option value="">Doesn't Matter / Any (કોઈ વાંધો નથી)</option>
            <option value="true">Mangal Only (મંગળ હોવું જોઈએ)</option>
            <option value="false">Non-Mangal Only (મંગળ ન હોવું જોઈએ)</option>
          </select>
        </Field>

        <Field label={t.preferredShani}>
          <select name="preferredHasSani" value={form.preferredHasSani} onChange={handleChange} className={inputClass}>
            <option value="">Doesn't Matter / Any (કોઈ વાંધો નથી)</option>
            <option value="true">Shani Only (શનિ હોવું જોઈએ)</option>
            <option value="false">Non-Shani Only (શનિ ન હોવું જોઈએ)</option>
          </select>
        </Field>
      </div>

      {/* Community & Personal */}
      <SectionTitle>Community &amp; Lifestyle</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t.preferredGotra}>
          <input name="preferredGotra" value={form.preferredGotra} onChange={handleChange}
            placeholder="e.g. Any / Specific Gotra" className={inputClass} />
        </Field>
        <Field label={t.preferredDiet}>
          <select name="preferredDiet" value={form.preferredDiet} onChange={handleChange} className={inputClass}>
            <option value="">{t.any}</option>
            <option value="VEG">{t.dietVeg}</option>
            <option value="NON_VEG">{t.dietNonVeg}</option>
            <option value="VEGAN">{t.dietVegan}</option>
          </select>
        </Field>
      </div>

      <Field label="Preferred Religion">
        <input name="preferredReligion" value={form.preferredReligion} onChange={handleChange}
          placeholder="Hindu" className={inputClass} />
      </Field>

      {/* About expectations */}
      <SectionTitle>{t.generalExpectations}</SectionTitle>
      <Field label={t.generalExpectations}>
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
