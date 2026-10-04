import { useState } from 'react';
import Spinner from '../common/Spinner';
import { translations } from '../../utils/translations';

/**
 * Reusable profile form — used on ProfileSetupPage and EditProfilePage.
 * Organized into default-closed collapsible accordions (group wise).
 * Auto-expands accordion sections containing validation errors upon form submit.
 * Supports English & Gujarati language toggle for field labels.
 */

const DIET_OPTIONS = [
  { value: '', label: 'Select dietary preference' },
  { value: 'VEG', label: 'Vegetarian (શાકાહારી)' },
  { value: 'VEG_EGG', label: 'Veg + Egg Only (ઈંડાહારી)' },
  { value: 'NON_VEG', label: 'Non-Vegetarian (અશાકાહારી)' },
  { value: 'VEGAN', label: 'Vegan (વીગન)' },
];

const BLOOD_GROUP_OPTIONS = [
  { value: '', label: 'Select blood group (Optional)' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const HOURS_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIOD_OPTIONS = ['AM', 'PM'];

const parseBirthTime = (timeStr) => {
  if (!timeStr) return { hour: '09', minute: '00', period: 'AM' };
  const match = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let h = match[1].padStart(2, '0');
    let m = match[2];
    let p = match[3].toUpperCase();
    if (Number(h) >= 1 && Number(h) <= 12) {
      return { hour: h, minute: m, period: p };
    }
  }
  return { hour: '09', minute: '00', period: 'AM' };
};

const ProfileForm = ({
  initialData = {},
  onSubmit,
  loading,
  serverError,
  submitLabel = 'Save Profile',
}) => {
  const [lang, setLang] = useState(() => localStorage.getItem('prajapati_lang_pref') || 'gu');
  const t = translations[lang] || translations.gu;

  const toggleLanguage = (selectedLang) => {
    setLang(selectedLang);
    localStorage.setItem('prajapati_lang_pref', selectedLang);
  };

  const initialTime = parseBirthTime(initialData.birthTime);
  const [timeHour, setTimeHour] = useState(initialTime.hour);
  const [timeMinute, setTimeMinute] = useState(initialTime.minute);
  const [timePeriod, setTimePeriod] = useState(initialTime.period);

  const [form, setForm] = useState({
    name:              initialData.name              || (initialData.fullName ? initialData.fullName.split(' ')[0] : ''),
    surname:           initialData.surname           || (initialData.fullName ? initialData.fullName.substring(initialData.fullName.indexOf(' ') + 1) : ''),
    age:               initialData.age               || '',
    gender:            initialData.gender            || '',
    maritalStatus:     initialData.maritalStatus     || '',
    city:              initialData.city              || '',
    mobileNo:          initialData.mobileNo          || '',
    alternateMobileNo: initialData.alternateMobileNo || '',
    addressLine:       initialData.addressLine       || '',
    state:             initialData.state             || '',
    pincode:           initialData.pincode           || '',
    education:         initialData.education         || '',
    profession:        initialData.profession        || '',
    dateOfBirth:       initialData.dateOfBirth       || '',
    birthTime:         initialData.birthTime         || `${initialTime.hour}:${initialTime.minute} ${initialTime.period}`,
    weight:            initialData.weight !== undefined && initialData.weight !== null ? initialData.weight : '',
    bloodGroup:        initialData.bloodGroup        || '',
    birthPlace:        initialData.birthPlace        || '',
    hasMangal:         initialData.hasMangal !== undefined ? initialData.hasMangal : null,
    hasSani:           initialData.hasSani !== undefined ? initialData.hasSani : null,
    height:            initialData.height            || '',
    income:            initialData.income            || '',
    gotra:             initialData.gotra             || '',
    diet:              initialData.diet              || '',
    religion:          initialData.religion          || '',
    fatherName:        initialData.fatherName        || '',
    fatherOccupation:  initialData.fatherOccupation  || '',
    motherName:        initialData.motherName        || '',
    motherOccupation:  initialData.motherOccupation  || '',
    description:       initialData.description       || '',
    hobbies:           initialData.hobbies           || '',
  });

  const [errors, setErrors] = useState({});

  // Accordions state — default closed for every group
  const [openSections, setOpenSections] = useState({
    personal: false,
    birth: false,
    family: false,
    contact: false,
    education: false,
    about: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = 'First name is required';
    else if (form.name.length > 50) newErrors.name = 'Max 50 characters';

    if (!form.surname.trim()) newErrors.surname = 'Surname is required';
    else if (form.surname.length > 50) newErrors.surname = 'Max 50 characters';

    if (!form.age) newErrors.age = 'Age is required';
    else if (Number(form.age) < 18 || Number(form.age) > 80) newErrors.age = 'Age must be between 18 and 80';

    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
    if (!form.city.trim()) newErrors.city = 'City is required';

    if (!form.mobileNo.trim()) newErrors.mobileNo = 'Mobile number is required';
    else if (!/^[6-9][0-9]{9}$/.test(form.mobileNo)) newErrors.mobileNo = 'Enter a valid 10-digit mobile number';

    if (form.alternateMobileNo && !/^[6-9][0-9]{9}$/.test(form.alternateMobileNo)) {
      newErrors.alternateMobileNo = 'Enter a valid 10-digit alternate mobile number';
    }

    if (!form.addressLine.trim()) newErrors.addressLine = 'Address is required';
    if (!form.state.trim()) newErrors.state = 'State is required';

    if (!form.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^[0-9]{6}$/.test(form.pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode';

    if (!form.education.trim()) newErrors.education = 'Education is required';
    if (!form.profession.trim()) newErrors.profession = 'Occupation or Profession is required';

    if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!form.birthTime.trim()) newErrors.birthTime = 'Date of birth time is required';

    if (form.weight === '' || form.weight === null || form.weight === undefined) newErrors.weight = 'Weight is required';
    else if (isNaN(Number(form.weight)) || Number(form.weight) <= 0 || Number(form.weight) > 300) {
      newErrors.weight = 'Weight must be a valid number between 1 and 300 kg';
    }

    if (!form.birthPlace.trim()) newErrors.birthPlace = 'Place where you born is required';

    if (!form.diet) newErrors.diet = 'Dietary preference is required';

    if (!form.fatherName.trim()) newErrors.fatherName = 'Father name is required';
    if (!form.motherName.trim()) newErrors.motherName = 'Mother name is required';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const setToggleValue = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Auto-expand any accordion sections that have errors
      const personalErr  = ['name', 'surname', 'age', 'gender', 'maritalStatus'].some((k) => validationErrors[k]);
      const birthErr     = ['dateOfBirth', 'birthTime', 'weight', 'bloodGroup', 'birthPlace', 'diet'].some((k) => validationErrors[k]);
      const familyErr    = ['fatherName', 'motherName'].some((k) => validationErrors[k]);
      const contactErr   = ['mobileNo', 'alternateMobileNo', 'addressLine', 'state', 'city', 'pincode'].some((k) => validationErrors[k]);
      const educationErr = ['education', 'profession'].some((k) => validationErrors[k]);

      setOpenSections((prev) => ({
        ...prev,
        personal:  personalErr  || prev.personal,
        birth:     birthErr     || prev.birth,
        family:    familyErr    || prev.family,
        contact:   contactErr   || prev.contact,
        education: educationErr || prev.education,
      }));
      return;
    }
    setErrors({});

    onSubmit({
      name:              form.name.trim(),
      surname:           form.surname.trim(),
      fullName:          `${form.name.trim()} ${form.surname.trim()}`,
      age:               Number(form.age),
      gender:            form.gender,
      maritalStatus:     form.maritalStatus,
      city:              form.city.trim(),
      mobileNo:          form.mobileNo.trim(),
      alternateMobileNo: form.alternateMobileNo.trim() || null,
      addressLine:       form.addressLine.trim(),
      state:             form.state.trim(),
      pincode:           form.pincode.trim(),
      education:         form.education.trim(),
      profession:        form.profession.trim(),
      dateOfBirth:       form.dateOfBirth,
      birthTime:         form.birthTime.trim(),
      weight:            Number(form.weight),
      bloodGroup:        form.bloodGroup || null,
      birthPlace:        form.birthPlace.trim(),
      hasMangal:         form.hasMangal !== undefined ? form.hasMangal : null,
      hasSani:           form.hasSani !== undefined ? form.hasSani : null,
      fatherName:        form.fatherName.trim(),
      fatherOccupation:  form.fatherOccupation.trim() || null,
      motherName:        form.motherName.trim(),
      motherOccupation:  form.motherOccupation.trim() || null,
      description:       form.description.trim()      || null,
      height:            form.height   || null,
      income:            form.income   || null,
      gotra:             form.gotra    || null,
      diet:              form.diet,
      religion:          form.religion || null,
      hobbies:           form.hobbies  || null,
    });
  };

  const inputClass =
    'w-full px-4 py-2 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary text-sm';

  // Section error counts helper
  const getSectionErrorCount = (fieldKeys) => {
    return fieldKeys.reduce((count, key) => (errors[key] ? count + 1 : count), 0);
  };

  const personalErrorCount  = getSectionErrorCount(['name', 'surname', 'age', 'gender', 'maritalStatus']);
  const birthErrorCount     = getSectionErrorCount(['dateOfBirth', 'birthTime', 'weight', 'bloodGroup', 'birthPlace', 'diet']);
  const familyErrorCount    = getSectionErrorCount(['fatherName', 'motherName']);
  const contactErrorCount   = getSectionErrorCount(['mobileNo', 'alternateMobileNo', 'addressLine', 'state', 'city', 'pincode']);
  const educationErrorCount = getSectionErrorCount(['education', 'profession']);

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* ── Language Switcher Bar ── */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
          🌐 Form Language / ભાષા:
        </span>
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-lg border border-border dark:border-gray-700">
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

      {/* ── 1. Personal Information Accordion ── */}
      <AccordionSection
        title={t.personalDetails}
        icon="👤"
        sectionKey="personal"
        isOpen={openSections.personal}
        onToggle={toggleSection}
        hasError={personalErrorCount > 0}
        errorCount={personalErrorCount}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={`${t.name} *`} error={errors.name}>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Rahul" className={inputClass} />
          </Field>

          <Field label={`${t.surname} *`} error={errors.surname}>
            <input name="surname" value={form.surname} onChange={handleChange}
              placeholder="Prajapati" className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={`${t.age} *`} error={errors.age}>
            <input type="number" name="age" value={form.age} onChange={handleChange}
              min={18} max={80} placeholder="25" className={inputClass} />
          </Field>
          <Field label={`${t.gender} *`} error={errors.gender}>
            <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
              <option value="">Select gender</option>
              <option value="MALE">{t.male}</option>
              <option value="FEMALE">{t.female}</option>
              <option value="PREFER_NOT_TO_SAY">{t.preferNotToSay}</option>
            </select>
          </Field>
        </div>

        <Field label={`${t.maritalStatus} *`} error={errors.maritalStatus}>
          <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className={inputClass}>
            <option value="">{lang === 'gu' ? 'વૈવાહિક સ્થિતિ પસંદ કરો' : 'Select marital status'}</option>
            <option value="SINGLE">{t.maritalStatusSingle}</option>
            <option value="DIVORCED">{t.maritalStatusDivorced}</option>
            <option value="WIDOWED">{t.maritalStatusWidowed}</option>
          </select>
        </Field>
      </AccordionSection>

      {/* ── 2. Birth & Horoscope Details Accordion ── */}
      <AccordionSection
        title={t.astrologicalDetails}
        icon="📜"
        sectionKey="birth"
        isOpen={openSections.birth}
        onToggle={toggleSection}
        hasError={birthErrorCount > 0}
        errorCount={birthErrorCount}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={`${t.dateOfBirth} *`} error={errors.dateOfBirth}>
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange}
              className={inputClass} />
          </Field>
          <Field label={`${t.birthTime} (Hour : Minute AM/PM) *`} error={errors.birthTime}>
            <div className="grid grid-cols-3 gap-2">
              <select
                value={timeHour}
                onChange={(e) => {
                  const val = e.target.value;
                  setTimeHour(val);
                  const formatted = `${val}:${timeMinute} ${timePeriod}`;
                  setForm((prev) => ({ ...prev, birthTime: formatted }));
                  if (errors.birthTime) setErrors((prev) => ({ ...prev, birthTime: '' }));
                }}
                className={inputClass}
              >
                {HOURS_OPTIONS.map((h) => (
                  <option key={h} value={h}>{h} Hr</option>
                ))}
              </select>

              <select
                value={timeMinute}
                onChange={(e) => {
                  const val = e.target.value;
                  setTimeMinute(val);
                  const formatted = `${timeHour}:${val} ${timePeriod}`;
                  setForm((prev) => ({ ...prev, birthTime: formatted }));
                  if (errors.birthTime) setErrors((prev) => ({ ...prev, birthTime: '' }));
                }}
                className={inputClass}
              >
                {MINUTES_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m} Min</option>
                ))}
              </select>

              <select
                value={timePeriod}
                onChange={(e) => {
                  const val = e.target.value;
                  setTimePeriod(val);
                  const formatted = `${timeHour}:${timeMinute} ${val}`;
                  setForm((prev) => ({ ...prev, birthTime: formatted }));
                  if (errors.birthTime) setErrors((prev) => ({ ...prev, birthTime: '' }));
                }}
                className={inputClass}
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.height}>
            <input name="height" value={form.height} onChange={handleChange}
              placeholder="e.g. 5'8&quot;" className={inputClass} />
          </Field>
          <Field label={`${t.weight} *`} error={errors.weight}>
            <input type="number" step="0.01" name="weight" value={form.weight}
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({ ...prev, weight: val }));
                if (errors.weight) setErrors((prev) => ({ ...prev, weight: '' }));
              }}
              onBlur={(e) => {
                const raw = e.target.value;
                if (raw && !isNaN(Number(raw))) {
                  const rounded = (Math.round(Number(raw) * 100) / 100).toString();
                  setForm((prev) => ({ ...prev, weight: rounded }));
                }
              }}
              placeholder="e.g. 56.38" className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.bloodGroup} error={errors.bloodGroup}>
            <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className={inputClass}>
              {BLOOD_GROUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
          <Field label={`${t.birthPlace} *`} error={errors.birthPlace}>
            <input name="birthPlace" value={form.birthPlace} onChange={handleChange}
              placeholder="e.g. Ahmedabad, Gujarat" className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t.gotra}>
            <input name="gotra" value={form.gotra} onChange={handleChange}
              placeholder="e.g. Kashyap" className={inputClass} />
          </Field>
          <Field label="Religion">
            <input name="religion" value={form.religion} onChange={handleChange}
              placeholder="Hindu" className={inputClass} />
          </Field>
        </div>

        <Field label={`${t.diet} *`} error={errors.diet}>
          <select name="diet" value={form.diet} onChange={handleChange} className={inputClass}>
            {DIET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Field>

        {/* 2 Gujarati Toggle / Choice Groups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              તમને મંગળ છે? (Mangal)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setToggleValue('hasMangal', true)}
                className={`py-2 px-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer text-center ${
                  form.hasMangal === true
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                હા (Yes)
              </button>
              <button
                type="button"
                onClick={() => setToggleValue('hasMangal', false)}
                className={`py-2 px-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer text-center ${
                  form.hasMangal === false
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                ના (No)
              </button>
              <button
                type="button"
                onClick={() => setToggleValue('hasMangal', null)}
                className={`py-2 px-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer text-center leading-tight flex items-center justify-center ${
                  form.hasMangal === null || form.hasMangal === undefined
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                કહેવા માંગતા નથી
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              તમને શનિ છે? (Shani)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setToggleValue('hasSani', true)}
                className={`py-2 px-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer text-center ${
                  form.hasSani === true
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                હા (Yes)
              </button>
              <button
                type="button"
                onClick={() => setToggleValue('hasSani', false)}
                className={`py-2 px-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer text-center ${
                  form.hasSani === false
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                ના (No)
              </button>
              <button
                type="button"
                onClick={() => setToggleValue('hasSani', null)}
                className={`py-2 px-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer text-center leading-tight flex items-center justify-center ${
                  form.hasSani === null || form.hasSani === undefined
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
              >
                કહેવા માંગતા નથી
              </button>
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* ── 3. Family Details Accordion ── */}
      <AccordionSection
        title={t.familyDetails}
        icon="👨‍👩‍👧"
        sectionKey="family"
        isOpen={openSections.family}
        onToggle={toggleSection}
        hasError={familyErrorCount > 0}
        errorCount={familyErrorCount}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={`${t.fatherName} *`} error={errors.fatherName}>
            <input name="fatherName" value={form.fatherName} onChange={handleChange}
              placeholder="Ramesh Prajapati" className={inputClass} />
          </Field>
          <Field label={t.fatherOccupation}>
            <input name="fatherOccupation" value={form.fatherOccupation} onChange={handleChange}
              placeholder="Business / Retired" className={inputClass} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={`${t.motherName} *`} error={errors.motherName}>
            <input name="motherName" value={form.motherName} onChange={handleChange}
              placeholder="Sunita Prajapati" className={inputClass} />
          </Field>
          <Field label={t.motherOccupation}>
            <input name="motherOccupation" value={form.motherOccupation} onChange={handleChange}
              placeholder="Homemaker / Teacher" className={inputClass} />
          </Field>
        </div>
      </AccordionSection>

      {/* ── 4. Contact & Address Accordion ── */}
      <AccordionSection
        title={t.contactDetails}
        icon="📞"
        sectionKey="contact"
        isOpen={openSections.contact}
        onToggle={toggleSection}
        hasError={contactErrorCount > 0}
        errorCount={contactErrorCount}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={`${t.mobileNo} *`} error={errors.mobileNo}>
            <input name="mobileNo" value={form.mobileNo} onChange={handleChange}
              placeholder="9876543210" maxLength={10} className={inputClass} />
          </Field>
          <Field label={t.alternateMobileNo} error={errors.alternateMobileNo}>
            <input name="alternateMobileNo" value={form.alternateMobileNo} onChange={handleChange}
              placeholder="9876543211" maxLength={10} className={inputClass} />
          </Field>
        </div>

        <Field label={`${t.addressLine} *`} error={errors.addressLine}>
          <input name="addressLine" value={form.addressLine} onChange={handleChange}
            placeholder="123, Ring Road" className={inputClass} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={`${t.state} *`} error={errors.state}>
            <input name="state" value={form.state} onChange={handleChange}
              placeholder="Gujarat" className={inputClass} />
          </Field>
          <Field label={`${t.city} *`} error={errors.city}>
            <input name="city" value={form.city} onChange={handleChange}
              placeholder="Ahmedabad" className={inputClass} />
          </Field>
        </div>

        <Field label={`${t.pincode} *`} error={errors.pincode}>
          <input name="pincode" value={form.pincode} onChange={handleChange}
            placeholder="380001" maxLength={6} className={inputClass} />
        </Field>
      </AccordionSection>

      {/* ── 5. Education & Profession Accordion ── */}
      <AccordionSection
        title={t.educationCareer}
        icon="🎓"
        sectionKey="education"
        isOpen={openSections.education}
        onToggle={toggleSection}
        hasError={educationErrorCount > 0}
        errorCount={educationErrorCount}
      >
        <Field label={`${t.education} *`} error={errors.education}>
          <input name="education" value={form.education} onChange={handleChange}
            placeholder="B.Tech CS / M.Com" className={inputClass} />
        </Field>

        <Field label={`${t.profession} *`} error={errors.profession}>
          <input name="profession" value={form.profession} onChange={handleChange}
            placeholder="Software Engineer / Business" className={inputClass} />
        </Field>

        <Field label={t.income}>
          <input name="income" value={form.income} onChange={handleChange}
            placeholder="25000" className={inputClass} />
        </Field>
      </AccordionSection>

      {/* ── 6. Description & Hobbies Accordion ── */}
      <AccordionSection
        title={t.aboutMe}
        icon="📝"
        sectionKey="about"
        isOpen={openSections.about}
        onToggle={toggleSection}
        hasError={false}
        errorCount={0}
      >
        <Field label={t.description}>
          <textarea name="description" value={form.description} onChange={handleChange}
            rows={4} placeholder="Write something about yourself, your background, and family..." className={inputClass} />
        </Field>

        <Field label="Hobbies">
          <textarea name="hobbies" value={form.hobbies} onChange={handleChange}
            rows={3} placeholder="Cricket, Coding, Music..." className={inputClass} />
        </Field>
      </AccordionSection>

      {serverError && <p className="text-error text-sm pt-2">{serverError}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm
                   hover:bg-primary-light transition disabled:opacity-60
                   flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-4"
      >
        {loading && <Spinner />}
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

/** Reusable Collapsible Accordion Section */
const AccordionSection = ({ title, icon, sectionKey, isOpen, onToggle, hasError, errorCount, children }) => (
  <div className={`border rounded-2xl overflow-hidden transition-all duration-200 shadow-sm ${
    hasError
      ? 'border-red-400 dark:border-red-500/80 bg-red-50/20 dark:bg-red-950/10'
      : 'border-border dark:border-gray-700 bg-white dark:bg-card-dark'
  }`}>
    <button
      type="button"
      onClick={() => onToggle(sectionKey)}
      className="w-full px-5 py-4 flex items-center justify-between font-semibold text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition cursor-pointer select-none"
    >
      <div className="flex items-center gap-2.5">
        <span className="text-lg leading-none">{icon}</span>
        <span className="font-bold text-gray-900 dark:text-gray-100">{title}</span>
        {hasError && (
          <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-bold animate-pulse">
            {errorCount} error{errorCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
      <span className={`text-gray-400 transform transition-transform duration-200 text-xs font-bold ${isOpen ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
    {isOpen && (
      <div className="p-4 sm:p-5 border-t border-border dark:border-gray-700/60 space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
        {children}
      </div>
    )}
  </div>
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
