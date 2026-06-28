import { useState } from 'react';
import Spinner from '../common/Spinner';

/**
 * Reusable profile form — used on both ProfileSetupPage and EditProfilePage.
 * Props: initialData, onSubmit(formData), loading, serverError, submitLabel
 */
const ProfileForm = ({ initialData = {}, onSubmit, loading, serverError, submitLabel = 'Save Profile' }) => {
  const [form, setForm] = useState({
    fullName: initialData.fullName || '',
    age: initialData.age || '',
    gender: initialData.gender || '',
    city: initialData.city || '',
    education: initialData.education || '',
    profession: initialData.profession || '',
    religion: initialData.religion || '',
    hobbies: initialData.hobbies || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (form.fullName.length > 100) newErrors.fullName = 'Max 100 characters';
    if (!form.age) newErrors.age = 'Age is required';
    else if (Number(form.age) < 18 || Number(form.age) > 80) newErrors.age = 'Age must be between 18 and 80';
    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.education.trim()) newErrors.education = 'Education is required';
    if (!form.profession.trim()) newErrors.profession = 'Profession is required';
    return newErrors;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onSubmit({ ...form, age: Number(form.age) });
  };

  const inputClass =
    'w-full px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Full Name" error={errors.fullName}>
        <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Rahul Prajapati" className={inputClass} />
      </Field>

      <Field label="Age" error={errors.age}>
        <input type="number" name="age" value={form.age} onChange={handleChange} min={18} max={80} placeholder="25" className={inputClass} />
      </Field>

      <Field label="Gender" error={errors.gender}>
        <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
          <option value="">Select gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
        </select>
      </Field>

      <Field label="City" error={errors.city}>
        <input name="city" value={form.city} onChange={handleChange} placeholder="Ahmedabad" className={inputClass} />
      </Field>

      <Field label="Education" error={errors.education}>
        <input name="education" value={form.education} onChange={handleChange} placeholder="B.Tech CS" className={inputClass} />
      </Field>

      <Field label="Profession" error={errors.profession}>
        <input name="profession" value={form.profession} onChange={handleChange} placeholder="Software Engineer" className={inputClass} />
      </Field>

      <Field label="Religion (optional)">
        <input name="religion" value={form.religion} onChange={handleChange} placeholder="Hindu" className={inputClass} />
      </Field>

      <Field label="Hobbies (optional)">
        <textarea name="hobbies" value={form.hobbies} onChange={handleChange} rows={3} placeholder="Cricket, Coding..." className={inputClass} />
      </Field>

      {serverError && <p className="text-error text-sm">{serverError}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-light transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Spinner />}
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

/** Label + input + inline error wrapper */
const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    {children}
    {error && <p className="text-error text-xs mt-1">{error}</p>}
  </div>
);

export default ProfileForm;
