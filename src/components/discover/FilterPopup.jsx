import { useEffect, useRef, useState } from 'react';

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

const MARITAL_STATUS_OPTIONS = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'DIVORCED', label: 'Divorced' },
  { value: 'WIDOWED', label: 'Widowed' },
];

const DIET_OPTIONS = [
  { value: 'VEG', label: 'Vegetarian' },
  { value: 'NON_VEG', label: 'Non-Vegetarian' },
  { value: 'VEGAN', label: 'Vegan' },
];

const HEIGHT_OPTIONS = [
  "4'0\"", "4'1\"", "4'2\"", "4'3\"", "4'4\"", "4'5\"", "4'6\"", "4'7\"", "4'8\"", "4'9\"", "4'10\"", "4'11\"",
  "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"",
  "6'0\"", "6'1\"", "6'2\"", "6'3\"", "6'4\"", "6'5\"", "6'6\"", "6'7\"", "6'8\"", "6'9\"", "6'10\"", "6'11\"", "7'0\""
];

const DEFAULT_FILTERS = {
  minAge: '',
  maxAge: '',
  maritalStatus: '',
  minHeight: '',
  maxHeight: '',
  diet: '',
};

const FilterPopup = ({ isOpen, onClose, appliedFilters = DEFAULT_FILTERS, onApply, onClearAll }) => {
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

  const isAgeActive = localFilters.minAge || localFilters.maxAge;
  const isMaritalStatusActive = Boolean(localFilters.maritalStatus);
  const isHeightActive = localFilters.minHeight || localFilters.maxHeight;
  const isDietActive = Boolean(localFilters.diet);

  const hasAnyActiveFilter = isAgeActive || isMaritalStatusActive || isHeightActive || isDietActive;

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
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
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
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1 transition cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body — Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">

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

          {/* 3. Height Range Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Height Range
              </label>
              {isHeightActive && (
                <button
                  type="button"
                  onClick={() => handleClearField(['minHeight', 'maxHeight'])}
                  className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ✕ Clear
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Min Height</span>
                <select
                  value={localFilters.minHeight || ''}
                  onChange={(e) => handleFieldChange('minHeight', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Any Min</option>
                  {HEIGHT_OPTIONS.map((h) => (
                    <option key={`min-${h}`} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-xs text-gray-400 dark:text-gray-500 mb-1 block">Max Height</span>
                <select
                  value={localFilters.maxHeight || ''}
                  onChange={(e) => handleFieldChange('maxHeight', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Any Max</option>
                  {HEIGHT_OPTIONS.map((h) => (
                    <option key={`max-${h}`} value={h}>{h}</option>
                  ))}
                </select>
              </div>
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
