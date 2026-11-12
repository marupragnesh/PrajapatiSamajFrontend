import { useState, useMemo, useRef, useEffect } from 'react';
import {
  User,
  Calendar,
  MapPin,
  Briefcase,
  Camera,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Upload,
  X,
  Search,
  Sparkles,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { INDIAN_STATES, getCitiesByState } from '../../utils/indiaLocationData';
import { INDIAN_MOTHER_TONGUES } from '../../utils/languageData';
import { uploadPhoto, saveExpectations } from '../../api/profileApi';
import logger from '../../utils/logger';

const MARITAL_STATUS_OPTIONS = [
  { value: 'SINGLE', label: 'Never Married / Single (અપરિણીત)' },
  { value: 'DIVORCED', label: 'Divorced (છૂટાછેડા)' },
  { value: 'WIDOWED', label: 'Widowed (વિધવા / વિધુર)' },
];

const DIET_OPTIONS = [
  { value: 'VEG', label: 'Vegetarian (શાકાહારી)' },
  { value: 'VEG_EGG', label: 'Eggetarian (ઈંડા સાથે)' },
  { value: 'NON_VEG', label: 'Non-Vegetarian (માંસાહારી)' },
  { value: 'VEGAN', label: 'Vegan (વીગન)' },
];

const RASHI_OPTIONS = [
  'Mesha (Aries) - અ, લ, ઈ',
  'Vrishabha (Taurus) - બ, વ, ઉ',
  'Mithuna (Gemini) - ક, છ, ઘ',
  'Karka (Cancer) - ડ, હ',
  'Simha (Leo) - મ, ટ',
  'Kanya (Virgo) - પ, ઠ, ણ',
  'Tula (Libra) - ર, ત',
  'Vrishchika (Scorpio) - ન, ય',
  'Dhanu (Sagittarius) - ભ, ધ, ફ, ઢ',
  'Makara (Capricorn) - ખ, જ',
  'Kumbha (Aquarius) - ગ, શ, સ, ષ',
  'Meena (Pisces) - દ, ચ, ઝ, થ',
];

const MANAGED_BY_OPTIONS = [
  'Self',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Relative',
  'Friend',
];

/**
 * Calculate age accurately from date string (YYYY-MM-DD)
 */
const calculateAge = (dobString) => {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

/**
 * 5-Step Card Profile Registration Wizard
 */
const ProfileWizard = ({ initialData = {}, onCreateProfile, onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState('');

  // ── Form State ──
  const [formData, setFormData] = useState({
    // Step 1: Personal & Family
    name: initialData.name || '',
    surname: initialData.surname || 'Prajapati',
    gender: initialData.gender || 'MALE',
    maritalStatus: initialData.maritalStatus || 'SINGLE',
    motherTongue: initialData.motherTongue || 'Gujarati',
    managedBy: initialData.managedBy || 'Self',
    fatherName: initialData.fatherName || '',
    fatherOccupation: initialData.fatherOccupation || '',
    motherName: initialData.motherName || '',
    motherOccupation: initialData.motherOccupation || '',

    // Step 2: Birth & Horoscope
    dateOfBirth: initialData.dateOfBirth || '',
    age: initialData.age || '',
    birthTime: initialData.birthTime || '',
    birthPlace: initialData.birthPlace || '',
    rashi: initialData.rashi || '',
    weight: initialData.weight || '',
    diet: initialData.diet || 'VEG',
    hasMangal: initialData.hasMangal ?? false,
    hasSani: initialData.hasSani ?? false,

    // Step 3: Location & Contact
    country: 'India',
    state: initialData.state || 'Gujarat',
    city: initialData.city || 'Ahmedabad',
    mobileNo: initialData.mobileNo || '',
    alternateMobileNo: initialData.alternateMobileNo || '',
    addressLine: initialData.addressLine || '',
    pincode: initialData.pincode || '',

    // Step 4: Education & Career
    education: initialData.education || '',
    profession: initialData.profession || '',
    income: initialData.income || '',
    description: initialData.description || '',

    // Step 5: Partner Expectations (auto-filled on age/gender selection, editable)
    preferredGender: initialData.gender === 'FEMALE' ? 'MALE' : 'FEMALE',
    prefMinAge: 21,
    prefMaxAge: 26,
    prefMaritalStatus: 'SINGLE',
    prefCity: initialData.city || '',
    prefState: initialData.state || 'Gujarat',
  });

  // Staged Photos for Step 5
  const [selectedPhotos, setSelectedPhotos] = useState([]); // { file, previewUrl, isPrimary }
  const fileInputRef = useRef(null);

  // Search states for dropdowns
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // ── Auto Calculate Age when DOB changes ──
  const computedAge = useMemo(() => calculateAge(formData.dateOfBirth), [formData.dateOfBirth]);

  useEffect(() => {
    if (computedAge !== null) {
      setFormData((prev) => ({
        ...prev,
        age: computedAge,
        // Update default expectations based on age & gender
        prefMinAge:
          prev.gender === 'MALE'
            ? Math.max(18, computedAge - 4)
            : Math.max(18, computedAge - 1),
        prefMaxAge:
          prev.gender === 'MALE'
            ? Math.max(18, computedAge + 1)
            : Math.max(18, computedAge + 5),
        preferredGender: prev.gender === 'FEMALE' ? 'MALE' : 'FEMALE',
      }));
    }
  }, [computedAge, formData.gender]);

  const isUnder18 = computedAge !== null && computedAge < 18;

  // Maximum allowed DOB (must be at least 18 years ago from today)
  const maxAllowedDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  }, []);

  // Filtered lists for searchable dropdowns
  const filteredStates = useMemo(() => {
    if (!stateSearch) return INDIAN_STATES;
    return INDIAN_STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase()));
  }, [stateSearch]);

  const availableCities = useMemo(() => {
    return getCitiesByState(formData.state);
  }, [formData.state]);

  const filteredCities = useMemo(() => {
    if (!citySearch) return availableCities;
    return availableCities.filter((c) => c.toLowerCase().includes(citySearch.toLowerCase()));
  }, [availableCities, citySearch]);

  // ── Field Change Handlers ──
  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // When state changes, reset city to first city in state
      if (field === 'state') {
        const cities = getCitiesByState(value);
        updated.city = cities.length > 0 ? cities[0] : '';
        updated.prefState = value;
      }
      return updated;
    });
  };

  // ── Photo Selection Handlers ──
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedPhotos.length + files.length > 5) {
      toast.error('You can upload up to 5 photos during registration.');
      return;
    }

    const newPhotoObjs = files.map((file, idx) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isPrimary: selectedPhotos.length === 0 && idx === 0,
    }));

    setSelectedPhotos((prev) => [...prev, ...newPhotoObjs]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (index) => {
    setSelectedPhotos((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((p) => p.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  const handleSetPrimaryPhoto = (index) => {
    setSelectedPhotos((prev) =>
      prev.map((p, i) => ({
        ...p,
        isPrimary: i === index,
      }))
    );
  };

  // ── Step Validation ──
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          toast.error('Please enter your First Name.');
          return false;
        }
        if (!formData.surname.trim()) {
          toast.error('Please enter your Surname.');
          return false;
        }
        if (!formData.fatherName.trim()) {
          toast.error("Please enter your Father's Name.");
          return false;
        }
        if (!formData.motherName.trim()) {
          toast.error("Please enter your Mother's Name.");
          return false;
        }
        return true;

      case 2:
        if (!formData.dateOfBirth) {
          toast.error('Please select your Date of Birth.');
          return false;
        }
        if (isUnder18) {
          toast.error('Must be at least 18 years old to create a matrimonial profile.');
          return false;
        }
        if (!formData.birthTime.trim()) {
          toast.error('Please enter your Birth Time.');
          return false;
        }
        if (!formData.birthPlace.trim()) {
          toast.error('Please enter your Birth Place.');
          return false;
        }
        if (!formData.weight || Number(formData.weight) < 1 || Number(formData.weight) > 300) {
          toast.error('Please enter a valid Weight in kg (1–300).');
          return false;
        }
        return true;

      case 3:
        if (!/^[6-9][0-9]{9}$/.test(formData.mobileNo.trim())) {
          toast.error('Please enter a valid 10-digit Indian mobile number.');
          return false;
        }
        if (!formData.state) {
          toast.error('Please select your State.');
          return false;
        }
        if (!formData.city) {
          toast.error('Please select your City.');
          return false;
        }
        if (!formData.addressLine.trim()) {
          toast.error('Please enter your Residential Address.');
          return false;
        }
        if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
          toast.error('Please enter a valid 6-digit Pincode.');
          return false;
        }
        return true;

      case 4:
        if (!formData.education.trim()) {
          toast.error('Please provide your Highest Education.');
          return false;
        }
        if (!formData.profession.trim()) {
          toast.error('Please provide your Profession / Occupation.');
          return false;
        }
        return true;

      case 5:
        if (selectedPhotos.length === 0) {
          toast.error('Please upload at least 1 photo to complete your profile.');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Final Submission ──
  const handleFinalSubmit = async () => {
    if (!validateStep(5)) return;

    setSubmitting(true);
    setSubmitProgress('Saving your profile details...');
    try {
      // 1. Prepare profile payload
      const profilePayload = {
        name: formData.name.trim(),
        surname: formData.surname.trim(),
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        motherTongue: formData.motherTongue,
        managedBy: formData.managedBy,
        fatherName: formData.fatherName.trim(),
        fatherOccupation: formData.fatherOccupation.trim() || null,
        motherName: formData.motherName.trim(),
        motherOccupation: formData.motherOccupation.trim() || null,
        dateOfBirth: formData.dateOfBirth,
        age: computedAge || formData.age,
        birthTime: formData.birthTime.trim(),
        birthPlace: formData.birthPlace.trim(),
        rashi: formData.rashi || null,
        weight: parseFloat(formData.weight),
        diet: formData.diet,
        hasMangal: formData.hasMangal,
        hasSani: formData.hasSani,
        state: formData.state,
        city: formData.city,
        mobileNo: formData.mobileNo.trim(),
        alternateMobileNo: formData.alternateMobileNo.trim() || null,
        addressLine: formData.addressLine.trim(),
        pincode: formData.pincode.trim(),
        education: formData.education.trim(),
        profession: formData.profession.trim(),
        income: formData.income.trim() || null,
        description: formData.description.trim() || null,
      };

      logger.info('Submitting Profile Wizard form data', profilePayload);
      if (onCreateProfile) {
        await onCreateProfile(profilePayload);
      }

      // 2. Upload photos sequentially (primary photo first so it becomes DP)
      const orderedPhotos = [
        ...selectedPhotos.filter((p) => p.isPrimary),
        ...selectedPhotos.filter((p) => !p.isPrimary),
      ];
      if (orderedPhotos.length > 0) {
        for (let i = 0; i < orderedPhotos.length; i++) {
          const item = orderedPhotos[i];
          setSubmitProgress(`Compressing & uploading photo ${i + 1} of ${orderedPhotos.length}...`);
          const compressed = await imageCompression(item.file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
          });
          const fd = new FormData();
          fd.append('photo', compressed, item.file.name || `photo_${Date.now()}.jpg`);
          await uploadPhoto(fd);
        }
      }

      // 3. Save auto-generated / customized partner expectations
      setSubmitProgress('Saving partner expectations...');
      try {
        const expPayload = {
          minAge: formData.prefMinAge || 18,
          maxAge: formData.prefMaxAge || 35,
          preferredMaritalStatus: formData.prefMaritalStatus,
          preferredState: formData.prefState || formData.state,
          preferredCity: formData.prefCity || formData.city,
        };
        await saveExpectations(expPayload);
      } catch (expErr) {
        logger.warn('Non-fatal: could not auto-save expectations', expErr);
      }

      toast.success('Profile created successfully! Welcome to PrajapatiSamaj 🎉');
      if (onComplete) {
        await onComplete(profilePayload);
      }
    } catch (err) {
      logger.error('Registration wizard submission error', err);
      toast.error(err.response?.data?.message || 'Could not complete registration. Please try again.');
    } finally {
      setSubmitting(false);
      setSubmitProgress('');
    }
  };

  // ── Step Navigation Headings ──
  const STEPS = [
    { num: 1, label: 'Personal', icon: <User className="w-4 h-4" /> },
    { num: 2, label: 'Birth & Horoscope', icon: <Calendar className="w-4 h-4" /> },
    { num: 3, label: 'Contact & Location', icon: <MapPin className="w-4 h-4" /> },
    { num: 4, label: 'Education & Career', icon: <Briefcase className="w-4 h-4" /> },
    { num: 5, label: 'Photo & Partner', icon: <Camera className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-card-dark rounded-3xl shadow-xl border border-border dark:border-gray-800 overflow-hidden">
      {/* ── Stepper Header ── */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-rose-500/10 dark:from-gray-800 dark:to-gray-900 border-b border-border/60 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Step {currentStep} of 5
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {STEPS[currentStep - 1].label}
            </h2>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary text-white shadow-sm">
            {Math.round((currentStep / 5) * 100)}% Complete
          </span>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mb-5">
          <div
            className="bg-primary h-full transition-all duration-300 ease-out rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Stepper Pills */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (s.num < currentStep || validateStep(currentStep)) {
                    setCurrentStep(s.num);
                  }
                }}
                disabled={s.num > currentStep && isUnder18}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1 rounded-xl text-xs font-medium transition-all ${
                  isCurrent
                    ? 'bg-primary text-white shadow-md'
                    : isCompleted
                    ? 'bg-primary/15 text-primary dark:text-primary-light hover:bg-primary/25'
                    : 'bg-white/60 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : s.icon}
                <span className="hidden sm:inline truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Card Content Body ── */}
      <div className="p-6 sm:p-8">
        {/* ============================================================
            CARD 1: Basic & Personal Details
           ============================================================ */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>

              {/* Surname */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Surname <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prajapati"
                  value={formData.surname}
                  onChange={(e) => handleChange('surname', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Gender <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'MALE', label: 'Male (પુરુષ)', icon: '👨' },
                  { value: 'FEMALE', label: 'Female (સ્ત્રી)', icon: '👩' },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => handleChange('gender', g.value)}
                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border text-sm font-semibold transition-all ${
                      formData.gender === g.value
                        ? 'border-primary bg-primary/10 text-primary dark:text-primary-light shadow-sm'
                        : 'border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="text-xl">{g.icon}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Marital Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => handleChange('maritalStatus', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              >
                {MARITAL_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mother Tongue & Managed By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Mother Tongue (માતૃભાષા) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.motherTongue}
                  onChange={(e) => handleChange('motherTongue', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                >
                  {INDIAN_MOTHER_TONGUES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Profile Managed By
                </label>
                <select
                  value={formData.managedBy}
                  onChange={(e) => handleChange('managedBy', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                >
                  {MANAGED_BY_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parents Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Father&apos;s Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rameshbhai Prajapati"
                  value={formData.fatherName}
                  onChange={(e) => handleChange('fatherName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Father&apos;s Occupation (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Business / Farmer"
                  value={formData.fatherOccupation}
                  onChange={(e) => handleChange('fatherOccupation', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Mother&apos;s Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gitaben Prajapati"
                  value={formData.motherName}
                  onChange={(e) => handleChange('motherName', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Mother&apos;s Occupation (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Homemaker / Teacher"
                  value={formData.motherOccupation}
                  onChange={(e) => handleChange('motherOccupation', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            CARD 2: Birth, Age & Horoscope
           ============================================================ */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            {/* Date of Birth & Live Age */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Date of Birth (જન્મ તારીખ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  max={maxAllowedDob}
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Calculated Age (ઉંમર)
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-100 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 text-sm flex items-center justify-between">
                  <span>
                    {computedAge !== null ? `${computedAge} Years Old` : 'Select DOB above'}
                  </span>
                  {computedAge !== null && computedAge >= 18 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                      ✓ Eligible
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Strict Under 18 Warning Banner */}
            {isUnder18 && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-rose-700 dark:text-rose-300 animate-shake">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="block font-semibold">Age Restriction: Under 18 Not Allowed</strong>
                  In accordance with matrimonial policy, candidates must be at least 18 years old. You cannot proceed or create a profile.
                </div>
              </div>
            )}

            {/* Birth Time & Birth Place */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Birth Time (જન્મ સમય) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => handleChange('birthTime', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Birth Place (જન્મ સ્થળ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahmedabad, Surat"
                  value={formData.birthPlace}
                  onChange={(e) => handleChange('birthPlace', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>
            </div>

            {/* Rashi & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Rashi (રાશિ)
                </label>
                <select
                  value={formData.rashi}
                  onChange={(e) => handleChange('rashi', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                >
                  <option value="">Select Rashi</option>
                  {RASHI_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Weight in Kg (વજન) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="30"
                  max="200"
                  placeholder="e.g. 65"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>
            </div>

            {/* Diet & Horoscope dosh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Dietary Preference (ખોરાક)
                </label>
                <select
                  value={formData.diet}
                  onChange={(e) => handleChange('diet', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                >
                  {DIET_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Astrological Status (કુંડળી)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasMangal}
                      onChange={(e) => handleChange('hasMangal', e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Mangal (મંગળ)</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasSani}
                      onChange={(e) => handleChange('hasSani', e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">Shani (શનિ)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            CARD 3: Contact & Cascading Location
           ============================================================ */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            {/* Country Fixed to India */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Country (દેશ)
              </label>
              <div className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-semibold flex items-center gap-2">
                <span>🇮🇳</span>
                <span>India (Default)</span>
              </div>
            </div>

            {/* Cascading State & City Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Searchable State */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  State (રાજ્ય) <span className="text-rose-500">*</span>
                </label>
                <div
                  onClick={() => setShowStateDropdown(!showStateDropdown)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm flex items-center justify-between cursor-pointer"
                >
                  <span>{formData.state || 'Select State'}</span>
                  <span className="text-xs text-gray-400">▼</span>
                </div>

                {showStateDropdown && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl mb-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search state..."
                        value={stateSearch}
                        onChange={(e) => setStateSearch(e.target.value)}
                        className="w-full bg-transparent text-xs text-gray-900 dark:text-gray-100 focus:outline-none"
                        autoFocus
                      />
                    </div>
                    {filteredStates.map((st) => (
                      <div
                        key={st}
                        onClick={() => {
                          handleChange('state', st);
                          setShowStateDropdown(false);
                          setStateSearch('');
                        }}
                        className={`px-3 py-2 text-xs rounded-xl cursor-pointer hover:bg-primary/10 transition ${
                          formData.state === st ? 'bg-primary/15 font-semibold text-primary' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {st}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Searchable City */}
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  City (શહેર) <span className="text-rose-500">*</span>
                </label>
                <div
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm flex items-center justify-between cursor-pointer"
                >
                  <span>{formData.city || 'Select City'}</span>
                  <span className="text-xs text-gray-400">▼</span>
                </div>

                {showCityDropdown && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl mb-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search or type city..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="w-full bg-transparent text-xs text-gray-900 dark:text-gray-100 focus:outline-none"
                        autoFocus
                      />
                    </div>
                    {filteredCities.map((ct) => (
                      <div
                        key={ct}
                        onClick={() => {
                          handleChange('city', ct);
                          setShowCityDropdown(false);
                          setCitySearch('');
                        }}
                        className={`px-3 py-2 text-xs rounded-xl cursor-pointer hover:bg-primary/10 transition ${
                          formData.city === ct ? 'bg-primary/15 font-semibold text-primary' : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {ct}
                      </div>
                    ))}
                    {citySearch.trim() && !availableCities.includes(citySearch.trim()) && (
                      <div
                        onClick={() => {
                          handleChange('city', citySearch.trim());
                          setShowCityDropdown(false);
                          setCitySearch('');
                        }}
                        className="px-3 py-2 text-xs rounded-xl cursor-pointer bg-primary/10 text-primary font-semibold"
                      >
                        + Use custom: &quot;{citySearch.trim()}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile & Alternate Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs text-gray-400 font-semibold">+91</span>
                  <input
                    type="tel"
                    maxLength="10"
                    placeholder="9876543210"
                    value={formData.mobileNo}
                    onChange={(e) => handleChange('mobileNo', e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Alternate Mobile (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs text-gray-400 font-semibold">+91</span>
                  <input
                    type="tel"
                    maxLength="10"
                    placeholder="9876543210"
                    value={formData.alternateMobileNo}
                    onChange={(e) => handleChange('alternateMobileNo', e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Address & Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Residential Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Flat / Society / Area"
                  value={formData.addressLine}
                  onChange={(e) => handleChange('addressLine', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Pincode <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="380001"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            CARD 4: Education, Career & Hobbies
           ============================================================ */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            {/* Education & Profession */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Highest Education <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech / MBA / B.Com"
                  value={formData.education}
                  onChange={(e) => handleChange('education', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Profession / Occupation <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer / Business"
                  value={formData.profession}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                  required
                />
              </div>
            </div>

            {/* Annual Income */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Annual Income / Salary (વાર્ષિક આવક)
              </label>
              <input
                type="text"
                placeholder="e.g. 6 - 8 LPA"
                value={formData.income}
                onChange={(e) => handleChange('income', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              />
            </div>

            {/* About Me / Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                About Myself (મારા વિશે)
              </label>
              <textarea
                rows="3"
                placeholder="Share a brief overview of your background, personality, and family..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
              />
            </div>
          </div>
        )}

        {/* ============================================================
            CARD 5: Mandatory Photo Upload & Default Partner Expectations
           ============================================================ */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fade-in">
            {/* Mandatory Photo Upload Box */}
            <div className="p-5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 dark:bg-primary/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    Upload Profile Photo <span className="text-rose-500">* (At least 1 photo required)</span>
                  </h3>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedPhotos.length} / 5 photos
                </span>
              </div>

              {/* Photo Thumbnails Preview */}
              {selectedPhotos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
                  {selectedPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden aspect-square border border-border dark:border-gray-700 group shadow-sm bg-gray-100 dark:bg-gray-800"
                    >
                      <img
                        src={photo.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {photo.isPrimary && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary text-white shadow">
                          Main
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        {!photo.isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryPhoto(idx)}
                            className="p-1 rounded-md bg-white/80 text-gray-800 text-[10px] font-bold hover:bg-white"
                            title="Set as Primary"
                          >
                            ⭐
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1 rounded-md bg-rose-500 text-white text-[10px] hover:bg-rose-600"
                          title="Remove Photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Action Button */}
              {selectedPhotos.length < 5 && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3.5 px-4 rounded-xl border border-primary/30 bg-white dark:bg-card-dark text-primary hover:bg-primary/10 transition flex items-center justify-center gap-2 text-sm font-semibold shadow-sm cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Select Photo from Device</span>
                  </button>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                    JPG, PNG or WEBP up to 5MB. Clear face photo improves profile matching!
                  </p>
                </div>
              )}
            </div>

            {/* Auto-Generated Default Partner Expectations */}
            <div className="p-5 rounded-2xl border border-border dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Default Partner Expectations (પાર્ટનર અપેક્ષા)
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Automatically calculated based on your age ({formData.age || computedAge || 24}) and preferences. You can adjust them anytime:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Looking For
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-border dark:border-gray-700 text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {formData.preferredGender === 'FEMALE' ? 'Female (વધૂ)' : 'Male (વર)'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Min Age
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="70"
                    value={formData.prefMinAge}
                    onChange={(e) => handleChange('prefMinAge', parseInt(e.target.value) || 18)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-border dark:border-gray-700 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Max Age
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="70"
                    value={formData.prefMaxAge}
                    onChange={(e) => handleChange('prefMaxAge', parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-border dark:border-gray-700 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Preferred State
                  </label>
                  <input
                    type="text"
                    value={formData.prefState}
                    onChange={(e) => handleChange('prefState', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-border dark:border-gray-700 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                    Preferred City
                  </label>
                  <input
                    type="text"
                    value={formData.prefCity}
                    onChange={(e) => handleChange('prefCity', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-border dark:border-gray-700 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Card Footer Actions (Next / Prev / Submit) ── */}
      <div className="bg-gray-50 dark:bg-gray-800/80 border-t border-border/60 dark:border-gray-800 p-4 sm:p-6 flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
          {currentStep === 1 && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline"
            >
              Cancel
            </button>
          )}
        </div>

        <div>
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isUnder18 && currentStep === 2}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm transition shadow-md ${
                isUnder18 && currentStep === 2
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-light cursor-pointer'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={submitting || selectedPhotos.length === 0}
              className={`flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition ${
                submitting || selectedPhotos.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-rose-600 hover:from-primary-light hover:to-rose-500 cursor-pointer transform hover:-translate-y-0.5'
              }`}
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>
                {submitting ? submitProgress || 'Completing Registration...' : 'Complete & Save Profile'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileWizard;
