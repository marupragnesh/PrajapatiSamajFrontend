import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, X, Lock } from 'lucide-react';

/**
 * FilterPopup — Modal component for Discover Page Filters.
 *
 * 4 Filter Fields:
 *   1. Age Range (minAge, maxAge)
 *   2. Marital Status (SINGLE, DIVORCED, WIDOWED)
 *   3. Height Range (minHeight, maxHeight)
 *   4. Diet (VEG, NON_VEG, VEGAN)
 *
 * Features:
 *   - Staging state: edits accumulate in local state and ONLY apply when user clicks "Apply Filters"
 *   - Individual 'X' clear button for each active filter field in local state
 *   - 'Clear All' button to reset all filters in modal
 *   - Backdrop click / ESC key to close modal
 */

const GENDER_OPTIONS = [
  { value: 'FEMALE', label: 'Female' },
  { value: 'MALE', label: 'Male' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
];

const DIET_OPTIONS = [
  { value: 'VEG', label: 'Vegetarian' },
  { value: 'VEG_EGG', label: 'Veg + Egg Only' },
  { value: 'NON_VEG', label: 'Non-Vegetarian' },
  { value: 'VEGAN', label: 'Vegan' },
];



const DEFAULT_FILTERS = {
  gender: '',
  minAge: '',
  maxAge: '',
  maritalStatus: '',
  minHeight: '',
  maxHeight: '',
  diet: '',
  surname: '',
};

const FilterPopup = ({
  isOpen,
  onClose,
  appliedFilters = DEFAULT_FILTERS,
  onApply,
  onClearAll,
  isUnlocked = true,
  onUpgrade,
}) => {
  const modalRef = useRef(null);
  const [localFilters, setLocalFilters] = useState(appliedFilters);

  // Sync local staging state whenever modal opens or applied filters change
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(appliedFilters || DEFAULT_FILTERS);
    }
  }, [isOpen, appliedFilters]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFieldChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearField = (keys) => {
    setLocalFilters((prev) => {
      const updated = { ...prev };
      if (Array.isArray(keys)) {
        keys.forEach((k) => (updated[k] = ''));
      } else {
        updated[keys] = '';
      }
      return updated;
    });
  };

  const handleLocalClearAll = () => {
    setLocalFilters(DEFAULT_FILTERS);
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const isGenderActive = Boolean(localFilters.gender);
  const isAgeActive = localFilters.minAge || localFilters.maxAge;
  const isMaritalStatusActive = Boolean(localFilters.maritalStatus);
  const isDietActive = Boolean(localFilters.diet);
  const isSurnameActive = Boolean(localFilters.surname);

  const hasAnyActiveFilter = isGenderActive || isAgeActive || isMaritalStatusActive || isDietActive || isSurnameActive;

  const inputClass =
    'w-full px-3 py-1.5 rounded-lg border border-border dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-border dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Filter Profiles</h2>
          </div>
          <div className="flex items-center gap-3">
            {hasAnyActiveFilter && (
              <button
                type="button"
                onClick={handleLocalClearAll}
                className="text-xs font-semibold text-error hover:underline cursor-pointer"
              >
                Clear All
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body — Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar relative">
          {!isUnlocked && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm mb-2">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center justify-center sm:justify-start gap-1.5">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Level 2 &amp; 3 Feature</span>
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Advanced discover filters require Level 2 (₹199) or Level 3 (₹299) Membership.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { onClose(); if (onUpgrade) onUpgrade(); }}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-light transition cursor-pointer shadow whitespace-nowrap"
              >
                Upgrade to Level 2 (₹199)
              </button>
            </div>
          )}

          {/* 1. Gender Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Partner Gender Preference
              </label>
              {isGenderActive && (
                <button
                  type="button"
                  onClick={() => handleClearField('gender')}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ✕ Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((opt) => {
                const isSelected = localFilters.gender === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleFieldChange('gender', isSelected ? '' : opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-border dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 1. Age Range Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Age Range (Years)
              </label>
              {isAgeActive && (
                <button
                  type="button"
                  onClick={() => handleClearField(['minAge', 'maxAge'])}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ✕ Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Min Age</span>
                <input
                  type="number"
                  min={18}
                  max={80}
                  placeholder="e.g. 21"
                  value={localFilters.minAge || ''}
                  onChange={(e) => handleFieldChange('minAge', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <span className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Max Age</span>
                <input
                  type="number"
                  min={18}
                  max={80}
                  placeholder="e.g. 35"
                  value={localFilters.maxAge || ''}
                  onChange={(e) => handleFieldChange('maxAge', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* 2. Marital Status Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Marital Status
              </label>
              {isMaritalStatusActive && (
                <button
                  type="button"
                  onClick={() => handleClearField('maritalStatus')}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ✕ Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {MARITAL_STATUS_OPTIONS.map((opt) => {
                const isSelected = localFilters.maritalStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleFieldChange('maritalStatus', isSelected ? '' : opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-border dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>



          {/* 4. Diet Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Dietary Preference
              </label>
              {isDietActive && (
                <button
                  type="button"
                  onClick={() => handleClearField('diet')}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ✕ Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {DIET_OPTIONS.map((opt) => {
                const isSelected = localFilters.diet === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleFieldChange('diet', isSelected ? '' : opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-border dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Surname Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Surname
              </label>
              {isSurnameActive && (
                <button
                  type="button"
                  onClick={() => handleClearField('surname')}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ✕ Clear
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="e.g. Prajapati"
              value={localFilters.surname || ''}
              onChange={(e) => handleFieldChange('surname', e.target.value)}
              className={inputClass}
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;
