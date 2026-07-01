import { useState } from 'react';
import Spinner from '../common/Spinner';

/**
 * Reusable profile form — used on ProfileSetupPage and EditProfilePage.
 *
 * Required fields: fullName, age, gender, maritalStatus, city,
 *                  mobileNo, addressLine, state, pincode,
 *                  education, profession
 * Optional fields: height, income, gotra, diet, religion, hobbies
 */

const MARITAL_STATUS_OPTIONS = [
  { value: '', label: 'Select marital status' },
  { value: 'SINGLE', label: 'Single' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
];

const DIET_OPTIONS = [
  { value: '', label: 'Select diet (optional)' },
  { value: 'VEG', label: 'Vegetarian' },
  { value: 'NON_VEG', label: 'Non-Vegetarian' },
  { value: 'VEGAN', label: 'Vegan' },
];

const ProfileForm = ({
  initialData = {},
  onSubmit,
  loading,
  serverError,
  submitLabel = 'Save Profile',
}) => {
  const [form, setForm] = useState({
    fullName:      initialData.fullName      || '',
    age:           initialData.age           || '',
    gender:        initialData.gender        || '',
    maritalStatus: initialData.maritalStatus || '',
    city:          initialData.city          || '',
    mobileNo:      initialData.mobileNo      || '',
    addressLine:   initialData.addressLine   || '',
    state:         initialData.state         || '',
    pincode:       initialData.pincode       || '',
    education:     initialData.education     || '',
    profession:    initialData.profession    || '',
    height:        initialData.height        || '',
    income:        initialData.income        || '',
    gotra:         initialData.gotra         || '',
    diet:          initialData.diet          || '',
    religion:      initialData.religion      || '',
    hobbies:       initialData.hobbies       || '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    else if (form.fullName.length > 100) newErrors.fullName = 'Max 100 characters';

    if (!form.age) newErrors.age = 'Age is required';
    else if (Number(form.age) < 18 || Number(form.age) > 80) newErrors.age = 'Age must be between 18 and 80';

    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (!form.city.trim()) newErrors.city = 'City is required';

    if (!form.mobileNo.trim()) newErrors.mobileNo = 'Mobile number is required';
    else if (!/^[6-9][0-9]{9}$/.test(form.mobileNo)) newErrors.mobileNo = 'Enter a valid 10-digit mobile number';

    if (!form.addressLine.trim()) newErrors.addressLine = 'Address is required';
    if (!form.state.trim()) newErrors.state = 'State is required';

    if (!form.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^[0-9]{6}$/.test(form.pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode';

    if (!form.education.trim()) newErrors.education = 'Education is required';
    if (!form.profession.trim()) newErrors.profession = 'Profession is required';

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
      fullName:      form.fullName.trim(),
      age:           Number(form.age),
      gender:        form.gender,
      maritalStatus: form.maritalStatus,
      city:          form.city.trim(),
      mobileNo:      form.mobileNo.trim(),
      addressLine:   form.addressLine.trim(),
      state:         form.state.trim(),
      pincode:       form.pincode.trim(),
      education:     form.education.trim(),
      profession:    form.profession.trim(),
      height:        form.height   || null,
      income:        form.income   || null,
      gotra:         form.gotra    || null,
      diet:          form.diet     || null,
      religion:      form.religion || null,
      hobbies:       form.hobbies  || null,
    });
  };

  const inputClass =
    'w-full px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* ── Personal Info ── */}
      <SectionTitle>Personal Information</SectionTitle>

      <Field label="Full Name *" error={errors.fullName}>
        <input name="fullName" value={form.fullName} onChange={handleChange}
          placeholder="Rahul Prajapati" className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Age *" error={errors.age}>
          <input type="number" name="age" value={form.age} onChange={handleChange}
            min={18} max={80} placeholder="25" className={inputClass} />
        </Field>
        <Field label="Gender *" error={errors.gender}>
          <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </Field>
      </div>

      <Field label="Marital Status *" error={errors.maritalStatus}>
        <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className={inputClass}>
          {MARITAL_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </Field>

      {/* ── Contact & Address ── */}
      <SectionTitle>Contact &amp; Address</SectionTitle>

      <Field label="Mobile Number *" error={errors.mobileNo}>
        <input name="mobileNo" value={form.mobileNo} onChange={handleChange}
          placeholder="9876543210" maxLength={10} className={inputClass} />
      </Field>

      <Field label="Address *" error={errors.addressLine}>
        <input name="addressLine" value={form.addressLine} onChange={handleChange}
          placeholder="123, Ring Road" className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="State *" error={errors.state}>
          <input name="state" value={form.state} onChange={handleChange}
            placeholder="Gujarat" className={inputClass} />
        </Field>
        <Field label="City *" error={errors.city}>
          <input name="city" value={form.city} onChange={handleChange}
            placeholder="Ahmedabad" className={inputClass} />
        </Field>
      </div>

      <Field label="Pincode *" error={errors.pincode}>
        <input name="pincode" value={form.pincode} onChange={handleChange}
          placeholder="380001" maxLength={6} className={inputClass} />
      </Field>

      {/* ── Education & Profession ── */}
      <SectionTitle>Education &amp; Profession</SectionTitle>

      <Field label="Education *" error={errors.education}>
        <input name="education" value={form.education} onChange={handleChange}
          placeholder="B.Tech CS" className={inputClass} />
      </Field>

      <Field label="Profession *" error={errors.profession}>
        <input name="profession" value={form.profession} onChange={handleChange}
          placeholder="Software Engineer" className={inputClass} />
      </Field>

      {/* ── Optional Fields ── */}
      <SectionTitle>Additional Details (Optional)</SectionTitle>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Height">
          <input name="height" value={form.height} onChange={handleChange}
            placeholder="e.g. 5'8&quot;" className={inputClass} />
        </Field>
        <Field label="Monthly Income">
          <input name="income" value={form.income} onChange={handleChange}
            placeholder="e.g. 50,000/month" className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Gotra">
          <input name="gotra" value={form.gotra} onChange={handleChange}
            placeholder="e.g. Kashyap" className={inputClass} />
        </Field>
        <Field label="Diet">
          <select name="diet" value={form.diet} onChange={handleChange} className={inputClass}>
            {DIET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Religion">
        <input name="religion" value={form.religion} onChange={handleChange}
          placeholder="Hindu" className={inputClass} />
      </Field>

      <Field label="Hobbies">
        <textarea name="hobbies" value={form.hobbies} onChange={handleChange}
          rows={3} placeholder="Cricket, Coding, Music..." className={inputClass} />
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

/** Section label divider */
const SectionTitle = ({ children }) => (
  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide pt-2">
    {children}
  </p>
);

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

export default ProfileForm;
