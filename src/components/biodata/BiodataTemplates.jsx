import React from 'react';

/**
 * BiodataTemplates Component
 * Renders 6 authentic Traditional Indian Marriage Biodata themes:
 * 1. 'royal' — Royal Heritage
 * 2. 'vedic' — Vedic Shubh
 * 3. 'kesari' — Kesari Vintage
 * 4. 'temple' — Temple Elegance
 * 5. 'maharaja' — Royal Maharaja
 * 6. 'emerald' — Vedic Gold
 *
 * Layout Calibrated to fit 100% inside 1 Single A4 Page (794px x 1123px).
 */
const BiodataTemplates = React.forwardRef(({ profile, styleName = 'royal', hideBranding = false }, ref) => {
  if (!profile) return null;

  const fullName = profile.fullName || `${profile.name || ''} ${profile.surname || ''}`.trim() || 'Candidate Name';
  const dpUrl = profile.primaryPhotoUrl || 'https://via.placeholder.com/200?text=No+Photo';
  const expectations = profile.expectations || {};

  const fmt = (val) => (val && val !== 'null' ? val : 'N/A');

  // --- THEME 1: ROYAL HERITAGE (SAFFRON & GOLD) — UNCHANGED ---
  if (styleName === 'royal') {
    return (
      <div
        ref={ref}
        className="w-[794px] h-[1123px] bg-[#FFFDF9] text-amber-950 p-7 font-serif border-[10px] border-double border-amber-600 shadow-2xl relative select-none overflow-hidden box-border flex flex-col justify-between"
        id="biodata-template-canvas"
      >
        <div>
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-amber-500/40 relative">
            <div className="text-lg text-amber-700 font-bold tracking-widest uppercase">
              🌸 || Shree Ganeshay Namah || 🌸
            </div>
            <h1 className="text-3xl font-extrabold text-amber-950 tracking-wider mt-1 uppercase">
              MARRIAGE BIODATA
            </h1>
          </div>

          {/* Candidate Profile Photo & Core Summary */}
          <div className="grid grid-cols-12 gap-5 my-4 items-center">
            <div className="col-span-4 flex justify-center">
              <div className="w-36 h-44 rounded-lg border-2 border-amber-600 p-1 bg-amber-50 shadow">
                <img src={dpUrl} alt={fullName} className="w-full h-full object-cover rounded" />
              </div>
            </div>
            <div className="col-span-8 space-y-2 border-l-2 border-amber-400/50 pl-5">
              <h2 className="text-2xl font-extrabold text-amber-950">{fullName}</h2>
              <div className="grid grid-cols-2 gap-y-1.5 text-xs font-sans text-amber-900">
                <div><span className="font-bold text-amber-950">Age / Gender:</span> {fmt(profile.age)} Yrs | {fmt(profile.gender)}</div>
                <div><span className="font-bold text-amber-950">Height:</span> {fmt(profile.height)}</div>
                <div><span className="font-bold text-amber-950">Education:</span> {fmt(profile.education)}</div>
                <div><span className="font-bold text-amber-950">Profession:</span> {fmt(profile.profession)}</div>
                <div><span className="font-bold text-amber-950">Income:</span> {fmt(profile.income)}</div>
                <div><span className="font-bold text-amber-950">Marital Status:</span> {fmt(profile.maritalStatus)}</div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-3 font-sans text-xs">
            {/* Section 1: Personal Details */}
            <div>
              <div className="bg-amber-100/80 py-1 px-3 rounded border-l-4 border-amber-600 font-serif font-bold text-sm text-amber-950">
                📌 Personal Details
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-1.5 px-2">
                <div><strong>Date of Birth:</strong> {fmt(profile.dateOfBirth)}</div>
                <div><strong>Birth Time:</strong> {fmt(profile.birthTime)}</div>
                <div><strong>Birthplace:</strong> {fmt(profile.birthPlace)}</div>
                <div><strong>Weight:</strong> {profile.weight ? `${profile.weight} kg` : 'N/A'}</div>
                <div><strong>Blood Group:</strong> {fmt(profile.bloodGroup)}</div>
                <div><strong>Gotra:</strong> {fmt(profile.gotra)}</div>
                <div><strong>Diet:</strong> {fmt(profile.diet)}</div>
                <div><strong>Religion:</strong> {fmt(profile.religion)}</div>
                <div><strong>Gujarati Mangal:</strong> {profile.hasMangal ? 'Yes' : 'No'}</div>
                <div><strong>Gujarati Sani:</strong> {profile.hasSani ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div>
              <div className="bg-amber-100/80 py-1 px-3 rounded border-l-4 border-amber-600 font-serif font-bold text-sm text-amber-950">
                📞 Contact &amp; Location
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-1.5 px-2">
                <div><strong>Mobile Number:</strong> {fmt(profile.mobileNo)}</div>
                <div><strong>Alternate Mobile:</strong> {fmt(profile.alternateMobileNo)}</div>
                <div><strong>City &amp; State:</strong> {fmt(profile.city)}, {fmt(profile.state)}</div>
                <div><strong>Pincode:</strong> {fmt(profile.pincode)}</div>
                <div className="col-span-2"><strong>Full Address:</strong> {fmt(profile.addressLine)}</div>
              </div>
            </div>

            {/* Section 3: Family Details */}
            <div>
              <div className="bg-amber-100/80 py-1 px-3 rounded border-l-4 border-amber-600 font-serif font-bold text-sm text-amber-950">
                👨‍👩‍👧 Family Background
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-1.5 px-2">
                <div><strong>Father's Name:</strong> {fmt(profile.fatherName)}</div>
                <div><strong>Father's Occupation:</strong> {fmt(profile.fatherOccupation)}</div>
                <div><strong>Mother's Name:</strong> {fmt(profile.motherName)}</div>
                <div><strong>Mother's Occupation:</strong> {fmt(profile.motherOccupation)}</div>
                {profile.managedBy && <div className="col-span-2"><strong>Managed By:</strong> {fmt(profile.managedBy)}</div>}
              </div>
            </div>

            {/* Section 4: Partner Expectations */}
            <div>
              <div className="bg-amber-100/80 py-1 px-3 rounded border-l-4 border-amber-600 font-serif font-bold text-sm text-amber-950">
                💍 Partner Expectations
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-1.5 px-2">
                <div><strong>Preferred Age:</strong> {expectations.minAge && expectations.maxAge ? `${expectations.minAge} - ${expectations.maxAge} Yrs` : 'N/A'}</div>
                <div><strong>Preferred Status:</strong> {fmt(expectations.preferredMaritalStatus)}</div>
                <div><strong>Preferred Height:</strong> {expectations.preferredMinHeight || expectations.preferredMaxHeight ? `${fmt(expectations.preferredMinHeight)} - ${fmt(expectations.preferredMaxHeight)}` : 'N/A'}</div>
                <div><strong>Preferred Education:</strong> {fmt(expectations.preferredEducation)}</div>
                <div><strong>Preferred Profession:</strong> {fmt(expectations.preferredProfession)}</div>
                <div><strong>Preferred Location:</strong> {fmt(expectations.preferredCity)} {fmt(expectations.preferredState)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!hideBranding && (
          <div className="pt-2 border-t border-amber-300 text-center font-sans text-[11px] text-amber-800 font-medium">
            Generated via PrajapatiSamaj Matrimonial Platform • Verifiable Member Profile
          </div>
        )}
      </div>
    );
  }

  // --- THEME 2: VEDIC SHUBH (CENTERED PORTRAIT & 2-COLUMN SPLIT LAYOUT) ---
  if (styleName === 'vedic') {
    return (
      <div
        ref={ref}
        className="w-[794px] h-[1123px] bg-[#FFFBF7] text-rose-950 p-6 font-serif border-[10px] border-solid border-rose-900 shadow-2xl relative select-none overflow-hidden box-border flex flex-col justify-between"
        id="biodata-template-canvas"
      >
        <div>
          {/* Traditional Arched Header Banner */}
          <div className="bg-rose-900 text-amber-100 py-3 px-6 rounded-t-2xl text-center shadow border-b-4 border-amber-500">
            <div className="text-base text-amber-300 font-bold tracking-widest uppercase">
              🚩 || SHUBH VIVAAH BIODATA || 🚩
            </div>
            <h1 className="text-2xl font-black tracking-widest uppercase mt-0.5 text-white">
              MARRIAGE BIODATA
            </h1>
          </div>

          {/* Centered Top Portrait Frame */}
          <div className="flex flex-col items-center my-3">
            <div className="w-36 h-44 rounded-xl border-3 border-rose-800 p-1 bg-white shadow-md">
              <img src={dpUrl} alt={fullName} className="w-full h-full object-cover rounded-lg" />
            </div>
            <h2 className="text-2xl font-black text-rose-900 mt-2">{fullName}</h2>
            <p className="text-xs font-sans text-rose-800 font-bold">
              {fmt(profile.age)} Yrs | {fmt(profile.gender)} | {fmt(profile.height)} | {fmt(profile.profession)}
            </p>
          </div>

          {/* 2-Column Vertical Split Layout */}
          <div className="grid grid-cols-2 gap-4 font-sans text-xs">
            {/* Left Column: Personal & Horoscope */}
            <div className="space-y-3">
              <div className="bg-rose-100 p-3 rounded-xl border border-rose-300 space-y-1.5">
                <div className="font-serif font-bold text-rose-900 border-b border-rose-300 pb-1 text-sm">
                  📌 Personal Information
                </div>
                <div><strong>DOB:</strong> {fmt(profile.dateOfBirth)}</div>
                <div><strong>Birth Time:</strong> {fmt(profile.birthTime)}</div>
                <div><strong>Birth Place:</strong> {fmt(profile.birthPlace)}</div>
                <div><strong>Weight:</strong> {profile.weight ? `${profile.weight} kg` : 'N/A'}</div>
                <div><strong>Blood Group:</strong> {fmt(profile.bloodGroup)}</div>
                <div><strong>Gotra:</strong> {fmt(profile.gotra)}</div>
                <div><strong>Diet:</strong> {fmt(profile.diet)}</div>
                <div><strong>Religion:</strong> {fmt(profile.religion)}</div>
                <div><strong>Mangal / Sani:</strong> {profile.hasMangal ? 'Manglik' : 'Non-Manglik'} / {profile.hasSani ? 'Yes' : 'No'}</div>
              </div>

              <div className="bg-rose-100 p-3 rounded-xl border border-rose-300 space-y-1.5">
                <div className="font-serif font-bold text-rose-900 border-b border-rose-300 pb-1 text-sm">
                  🎓 Career &amp; Education
                </div>
                <div><strong>Education:</strong> {fmt(profile.education)}</div>
                <div><strong>Profession:</strong> {fmt(profile.profession)}</div>
                <div><strong>Annual Income:</strong> {fmt(profile.income)}</div>
                <div><strong>Marital Status:</strong> {fmt(profile.maritalStatus)}</div>
              </div>
            </div>

            {/* Right Column: Contact & Family */}
            <div className="space-y-3">
              <div className="bg-rose-100 p-3 rounded-xl border border-rose-300 space-y-1.5">
                <div className="font-serif font-bold text-rose-900 border-b border-rose-300 pb-1 text-sm">
                  📞 Contact &amp; Residence
                </div>
                <div><strong>Mobile:</strong> {fmt(profile.mobileNo)}</div>
                <div><strong>Alt Mobile:</strong> {fmt(profile.alternateMobileNo)}</div>
                <div><strong>City &amp; State:</strong> {fmt(profile.city)}, {fmt(profile.state)}</div>
                <div><strong>Pincode:</strong> {fmt(profile.pincode)}</div>
                <div><strong>Address:</strong> {fmt(profile.addressLine)}</div>
              </div>

              <div className="bg-rose-100 p-3 rounded-xl border border-rose-300 space-y-1.5">
                <div className="font-serif font-bold text-rose-900 border-b border-rose-300 pb-1 text-sm">
                  👨‍👩‍👧 Family Details
                </div>
                <div><strong>Father:</strong> {fmt(profile.fatherName)}</div>
                <div><strong>Father Occ.:</strong> {fmt(profile.fatherOccupation)}</div>
                <div><strong>Mother:</strong> {fmt(profile.motherName)}</div>
                <div><strong>Mother Occ.:</strong> {fmt(profile.motherOccupation)}</div>
                {profile.managedBy && <div><strong>Managed By:</strong> {fmt(profile.managedBy)}</div>}
              </div>
            </div>
          </div>

          {/* Full Width Bottom Card: Partner Expectations */}
          <div className="mt-3 bg-amber-100/70 p-3 rounded-xl border border-amber-300 font-sans text-xs">
            <div className="font-serif font-bold text-rose-950 border-b border-amber-400 pb-1 text-sm mb-1.5">
              💍 Partner Preference &amp; Expectations
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><strong>Age:</strong> {expectations.minAge && expectations.maxAge ? `${expectations.minAge} - ${expectations.maxAge} Yrs` : 'N/A'}</div>
              <div><strong>Status:</strong> {fmt(expectations.preferredMaritalStatus)}</div>
              <div><strong>Height:</strong> {expectations.preferredMinHeight || expectations.preferredMaxHeight ? `${fmt(expectations.preferredMinHeight)} - ${fmt(expectations.preferredMaxHeight)}` : 'N/A'}</div>
              <div><strong>Education:</strong> {fmt(expectations.preferredEducation)}</div>
              <div><strong>Profession:</strong> {fmt(expectations.preferredProfession)}</div>
              <div><strong>Location:</strong> {fmt(expectations.preferredCity)} {fmt(expectations.preferredState)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!hideBranding && (
          <div className="pt-2 border-t border-rose-300 text-center font-sans text-[11px] text-rose-800 font-medium">
            Generated via PrajapatiSamaj Matrimonial Platform • Verifiable Member Profile
          </div>
        )}
      </div>
    );
  }

  // --- THEME 3: KESARI VINTAGE (LEFT SIDEBAR PHOTO & RIGHT DETAIL PANELS) ---
  if (styleName === 'kesari') {
    return (
      <div
        ref={ref}
        className="w-[794px] h-[1123px] bg-[#FFF8EE] text-orange-950 p-6 font-serif border-[10px] border-double border-orange-700 shadow-2xl relative select-none overflow-hidden box-border flex flex-col justify-between"
        id="biodata-template-canvas"
      >
        <div>
          {/* Header */}
          <div className="text-center pb-2 border-b-2 border-orange-600/40">
            <div className="text-sm text-orange-700 font-bold tracking-widest uppercase">
              🪔 || Mangalam Bhagwan Vishnu || 🪔
            </div>
            <h1 className="text-3xl font-extrabold text-orange-950 tracking-wider uppercase mt-0.5">
              MARRIAGE BIODATA
            </h1>
          </div>

          {/* Layout Split: Left Vertical Sidebar + Right Detail Panels */}
          <div className="grid grid-cols-12 gap-5 my-4">
            {/* Left Vertical Accent Bar (1/3 Width) */}
            <div className="col-span-4 bg-orange-100/90 rounded-2xl p-4 border-2 border-orange-400/60 flex flex-col items-center text-center space-y-3">
              <div className="w-36 h-44 rounded-xl border-3 border-orange-600 p-1 bg-white shadow-md">
                <img src={dpUrl} alt={fullName} className="w-full h-full object-cover rounded-lg" />
              </div>
              <h2 className="text-xl font-black text-orange-950 leading-tight">{fullName}</h2>
              <div className="w-full border-t border-orange-300 pt-2 space-y-1.5 font-sans text-xs text-orange-900 text-left">
                <div><strong>Age:</strong> {fmt(profile.age)} Yrs</div>
                <div><strong>Gender:</strong> {fmt(profile.gender)}</div>
                <div><strong>Height:</strong> {fmt(profile.height)}</div>
                <div><strong>Diet:</strong> {fmt(profile.diet)}</div>
                <div><strong>Status:</strong> {fmt(profile.maritalStatus)}</div>
                <div><strong>Religion:</strong> {fmt(profile.religion)}</div>
                <div><strong>Gotra:</strong> {fmt(profile.gotra)}</div>
              </div>
            </div>

            {/* Right Main Detail Panels (2/3 Width) */}
            <div className="col-span-8 space-y-3 font-sans text-xs">
              {/* Box 1: Personal Details */}
              <div className="bg-white/80 p-3 rounded-xl border-l-4 border-orange-600 shadow-sm space-y-1">
                <div className="font-serif font-bold text-sm text-orange-950 border-b border-orange-200 pb-1">
                  📌 Birth &amp; Astro Details
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                  <div><strong>Date of Birth:</strong> {fmt(profile.dateOfBirth)}</div>
                  <div><strong>Birth Time:</strong> {fmt(profile.birthTime)}</div>
                  <div><strong>Birthplace:</strong> {fmt(profile.birthPlace)}</div>
                  <div><strong>Weight:</strong> {profile.weight ? `${profile.weight} kg` : 'N/A'}</div>
                  <div><strong>Blood Group:</strong> {fmt(profile.bloodGroup)}</div>
                  <div><strong>Mangal/Sani:</strong> {profile.hasMangal ? 'Yes' : 'No'} / {profile.hasSani ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {/* Box 2: Career & Education */}
              <div className="bg-white/80 p-3 rounded-xl border-l-4 border-orange-600 shadow-sm space-y-1">
                <div className="font-serif font-bold text-sm text-orange-950 border-b border-orange-200 pb-1">
                  💼 Professional Profile
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                  <div><strong>Education:</strong> {fmt(profile.education)}</div>
                  <div><strong>Profession:</strong> {fmt(profile.profession)}</div>
                  <div><strong>Income:</strong> {fmt(profile.income)}</div>
                  <div><strong>Location:</strong> {fmt(profile.city)}, {fmt(profile.state)}</div>
                </div>
              </div>

              {/* Box 3: Contact & Address */}
              <div className="bg-white/80 p-3 rounded-xl border-l-4 border-orange-600 shadow-sm space-y-1">
                <div className="font-serif font-bold text-sm text-orange-950 border-b border-orange-200 pb-1">
                  📞 Contact Information
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                  <div><strong>Mobile:</strong> {fmt(profile.mobileNo)}</div>
                  <div><strong>Alt Mobile:</strong> {fmt(profile.alternateMobileNo)}</div>
                  <div className="col-span-2"><strong>Full Address:</strong> {fmt(profile.addressLine)}</div>
                </div>
              </div>

              {/* Box 4: Family Details */}
              <div className="bg-white/80 p-3 rounded-xl border-l-4 border-orange-600 shadow-sm space-y-1">
                <div className="font-serif font-bold text-sm text-orange-950 border-b border-orange-200 pb-1">
                  👨‍👩‍👧 Family Background
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                  <div><strong>Father:</strong> {fmt(profile.fatherName)}</div>
                  <div><strong>Father Occ.:</strong> {fmt(profile.fatherOccupation)}</div>
                  <div><strong>Mother:</strong> {fmt(profile.motherName)}</div>
                  <div><strong>Mother Occ.:</strong> {fmt(profile.motherOccupation)}</div>
                  {profile.managedBy && <div className="col-span-2"><strong>Managed By:</strong> {fmt(profile.managedBy)}</div>}
                </div>
              </div>

              {/* Box 5: Partner Expectations */}
              <div className="bg-white/80 p-3 rounded-xl border-l-4 border-orange-600 shadow-sm space-y-1">
                <div className="font-serif font-bold text-sm text-orange-950 border-b border-orange-200 pb-1">
                  💍 Partner Expectations
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                  <div><strong>Age:</strong> {expectations.minAge && expectations.maxAge ? `${expectations.minAge} - ${expectations.maxAge} Yrs` : 'N/A'}</div>
                  <div><strong>Status:</strong> {fmt(expectations.preferredMaritalStatus)}</div>
                  <div><strong>Height:</strong> {expectations.preferredMinHeight || expectations.preferredMaxHeight ? `${fmt(expectations.preferredMinHeight)} - ${fmt(expectations.preferredMaxHeight)}` : 'N/A'}</div>
                  <div><strong>Location:</strong> {fmt(expectations.preferredCity)} {fmt(expectations.preferredState)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!hideBranding && (
          <div className="pt-2 border-t border-orange-300 text-center font-sans text-[11px] text-orange-800 font-medium">
            Generated via PrajapatiSamaj Matrimonial Platform • Verifiable Member Profile
          </div>
        )}
      </div>
    );
  }

  // --- THEME 4: TEMPLE ELEGANCE (3-COLUMN STATS BAR & DIVIDED SECTIONS) ---
  if (styleName === 'temple') {
    return (
      <div
        ref={ref}
        className="w-[794px] h-[1123px] bg-[#FAF5F5] text-red-950 p-6 font-serif border-[10px] border-double border-red-800 shadow-2xl relative select-none overflow-hidden box-border flex flex-col justify-between"
        id="biodata-template-canvas"
      >
        <div>
          {/* Header Banner with Lotus Symbol */}
          <div className="text-center pb-3 border-b-2 border-red-700/40">
            <div className="text-base text-red-700 font-bold tracking-widest uppercase">
              🪷 || Vakratunda Mahakaya || 🪷
            </div>
            <h1 className="text-3xl font-extrabold text-red-950 tracking-wider uppercase mt-0.5">
              MARRIAGE BIODATA
            </h1>
          </div>

          {/* Centered Portrait with Lotus Corner Trim */}
          <div className="flex flex-col items-center my-3">
            <div className="w-36 h-44 rounded-2xl border-4 border-red-800 p-1.5 bg-red-50 shadow-lg relative">
              <img src={dpUrl} alt={fullName} className="w-full h-full object-cover rounded-xl" />
            </div>
            <h2 className="text-2xl font-black text-red-950 mt-2">{fullName}</h2>
          </div>

          {/* Horizontal 3-Column Stats Bar */}
          <div className="grid grid-cols-3 gap-3 bg-red-900 text-amber-50 p-3 rounded-xl text-center shadow my-3 font-sans text-xs">
            <div>
              <div className="text-amber-300 font-bold uppercase text-[10px]">Age / Gender</div>
              <div className="font-bold">{fmt(profile.age)} Yrs | {fmt(profile.gender)}</div>
            </div>
            <div className="border-x border-red-700 px-2">
              <div className="text-amber-300 font-bold uppercase text-[10px]">Height &amp; Status</div>
              <div className="font-bold">{fmt(profile.height)} | {fmt(profile.maritalStatus)}</div>
            </div>
            <div>
              <div className="text-amber-300 font-bold uppercase text-[10px]">Profession</div>
              <div className="font-bold">{fmt(profile.profession)}</div>
            </div>
          </div>

          {/* Divided 2-Column Sections Grid */}
          <div className="grid grid-cols-2 gap-4 font-sans text-xs">
            {/* Personal Details */}
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-1">
              <div className="font-serif font-bold text-red-900 text-sm border-b border-red-300 pb-1">
                🪷 Personal Information
              </div>
              <div><strong>DOB:</strong> {fmt(profile.dateOfBirth)}</div>
              <div><strong>Birth Time:</strong> {fmt(profile.birthTime)}</div>
              <div><strong>Birth Place:</strong> {fmt(profile.birthPlace)}</div>
              <div><strong>Weight:</strong> {profile.weight ? `${profile.weight} kg` : 'N/A'}</div>
              <div><strong>Blood Group:</strong> {fmt(profile.bloodGroup)}</div>
              <div><strong>Gotra:</strong> {fmt(profile.gotra)}</div>
              <div><strong>Diet:</strong> {fmt(profile.diet)}</div>
              <div><strong>Religion:</strong> {fmt(profile.religion)}</div>
              <div><strong>Mangal / Sani:</strong> {profile.hasMangal ? 'Yes' : 'No'} / {profile.hasSani ? 'Yes' : 'No'}</div>
            </div>

            {/* Contact & Location */}
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-1">
              <div className="font-serif font-bold text-red-900 text-sm border-b border-red-300 pb-1">
                📞 Contact &amp; Residence
              </div>
              <div><strong>Mobile:</strong> {fmt(profile.mobileNo)}</div>
              <div><strong>Alt Mobile:</strong> {fmt(profile.alternateMobileNo)}</div>
              <div><strong>City &amp; State:</strong> {fmt(profile.city)}, {fmt(profile.state)}</div>
              <div><strong>Pincode:</strong> {fmt(profile.pincode)}</div>
              <div><strong>Address:</strong> {fmt(profile.addressLine)}</div>
              <div className="pt-2 border-t border-red-200">
                <strong>Education:</strong> {fmt(profile.education)}
              </div>
              <div><strong>Income:</strong> {fmt(profile.income)}</div>
            </div>

            {/* Family Details */}
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-1">
              <div className="font-serif font-bold text-red-900 text-sm border-b border-red-300 pb-1">
                👨‍👩‍👧 Family Background
              </div>
              <div><strong>Father:</strong> {fmt(profile.fatherName)}</div>
              <div><strong>Father Occ.:</strong> {fmt(profile.fatherOccupation)}</div>
              <div><strong>Mother:</strong> {fmt(profile.motherName)}</div>
              <div><strong>Mother Occ.:</strong> {fmt(profile.motherOccupation)}</div>
              {profile.managedBy && <div><strong>Managed By:</strong> {fmt(profile.managedBy)}</div>}
            </div>

            {/* Partner Expectations */}
            <div className="bg-red-50 p-3 rounded-xl border border-red-200 space-y-1">
              <div className="font-serif font-bold text-red-900 text-sm border-b border-red-300 pb-1">
                💍 Partner Expectations
              </div>
              <div><strong>Age Range:</strong> {expectations.minAge && expectations.maxAge ? `${expectations.minAge} - ${expectations.maxAge} Yrs` : 'N/A'}</div>
              <div><strong>Marital Status:</strong> {fmt(expectations.preferredMaritalStatus)}</div>
              <div><strong>Height:</strong> {expectations.preferredMinHeight || expectations.preferredMaxHeight ? `${fmt(expectations.preferredMinHeight)} - ${fmt(expectations.preferredMaxHeight)}` : 'N/A'}</div>
              <div><strong>Location:</strong> {fmt(expectations.preferredCity)} {fmt(expectations.preferredState)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!hideBranding && (
          <div className="pt-2 border-t border-red-300 text-center font-sans text-[11px] text-red-800 font-medium">
            Generated via PrajapatiSamaj Matrimonial Platform • Verifiable Member Profile
          </div>
        )}
      </div>
    );
  }

  // --- THEME 5: ROYAL MAHARAJA (PALACE GOLD FOIL & OVAL CENTER PORTRAIT) ---
  if (styleName === 'maharaja') {
    return (
      <div
        ref={ref}
        className="w-[794px] h-[1123px] bg-[#2A0909] text-amber-100 p-6 font-serif border-[10px] border-double border-amber-500 shadow-2xl relative select-none overflow-hidden box-border flex flex-col justify-between"
        id="biodata-template-canvas"
      >
        <div>
          {/* Header */}
          <div className="text-center pb-2 border-b-2 border-amber-500/60">
            <div className="text-base text-amber-400 font-bold tracking-widest uppercase">
              👑 || IMPERIAL ROYAL BIODATA || 👑
            </div>
            <h1 className="text-3xl font-black text-amber-300 tracking-wider uppercase mt-0.5">
              MARRIAGE BIODATA
            </h1>
          </div>

          {/* Centered Portrait */}
          <div className="flex flex-col items-center my-3">
            <div className="w-36 h-44 rounded-xl border-3 border-amber-400 p-1 bg-amber-950 shadow-md">
              <img src={dpUrl} alt={fullName} className="w-full h-full object-cover rounded-lg" />
            </div>
            <h2 className="text-2xl font-black text-amber-300 mt-2 tracking-wide">{fullName}</h2>
            <p className="text-xs font-sans text-amber-200">
              {fmt(profile.age)} Yrs | {fmt(profile.gender)} | {fmt(profile.height)} | {fmt(profile.profession)}
            </p>
          </div>

          {/* 2-Column Detailed Gold Line Table */}
          <div className="space-y-3 font-sans text-xs">
            <div className="bg-amber-950/70 p-3 rounded-xl border border-amber-500/50 space-y-1.5">
              <div className="font-serif font-bold text-amber-400 border-b border-amber-500/40 pb-1 text-sm">
                📌 Personal &amp; Horoscope Credentials
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-amber-100">
                <div><span className="text-amber-300 font-semibold">Date of Birth:</span> {fmt(profile.dateOfBirth)}</div>
                <div><span className="text-amber-300 font-semibold">Birth Time:</span> {fmt(profile.birthTime)}</div>
                <div><span className="text-amber-300 font-semibold">Birthplace:</span> {fmt(profile.birthPlace)}</div>
                <div><span className="text-amber-300 font-semibold">Weight:</span> {profile.weight ? `${profile.weight} kg` : 'N/A'}</div>
                <div><span className="text-amber-300 font-semibold">Blood Group:</span> {fmt(profile.bloodGroup)}</div>
                <div><span className="text-amber-300 font-semibold">Gotra:</span> {fmt(profile.gotra)}</div>
                <div><span className="text-amber-300 font-semibold">Diet:</span> {fmt(profile.diet)}</div>
                <div><span className="text-amber-300 font-semibold">Religion:</span> {fmt(profile.religion)}</div>
                <div><span className="text-amber-300 font-semibold">Mangal / Sani:</span> {profile.hasMangal ? 'Yes' : 'No'} / {profile.hasSani ? 'Yes' : 'No'}</div>
                <div><span className="text-amber-300 font-semibold">Marital Status:</span> {fmt(profile.maritalStatus)}</div>
              </div>
            </div>

            <div className="bg-amber-950/70 p-3 rounded-xl border border-amber-500/50 space-y-1.5">
              <div className="font-serif font-bold text-amber-400 border-b border-amber-500/40 pb-1 text-sm">
                💼 Education, Profession &amp; Contact
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-amber-100">
                <div><span className="text-amber-300 font-semibold">Education:</span> {fmt(profile.education)}</div>
                <div><span className="text-amber-300 font-semibold">Profession:</span> {fmt(profile.profession)}</div>
                <div><span className="text-amber-300 font-semibold">Annual Income:</span> {fmt(profile.income)}</div>
                <div><span className="text-amber-300 font-semibold">Mobile:</span> {fmt(profile.mobileNo)}</div>
                <div><span className="text-amber-300 font-semibold">Alt Mobile:</span> {fmt(profile.alternateMobileNo)}</div>
                <div><span className="text-amber-300 font-semibold">City, State:</span> {fmt(profile.city)}, {fmt(profile.state)}</div>
                <div className="col-span-2"><span className="text-amber-300 font-semibold">Full Address:</span> {fmt(profile.addressLine)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-950/70 p-3 rounded-xl border border-amber-500/50 space-y-1">
                <div className="font-serif font-bold text-amber-400 border-b border-amber-500/40 pb-1 text-sm">
                  👨‍👩‍👧 Family Background
                </div>
                <div><span className="text-amber-300 font-semibold">Father:</span> {fmt(profile.fatherName)}</div>
                <div><span className="text-amber-300 font-semibold">Father Occ.:</span> {fmt(profile.fatherOccupation)}</div>
                <div><span className="text-amber-300 font-semibold">Mother:</span> {fmt(profile.motherName)}</div>
                <div><span className="text-amber-300 font-semibold">Mother Occ.:</span> {fmt(profile.motherOccupation)}</div>
                {profile.managedBy && <div><span className="text-amber-300 font-semibold">Managed By:</span> {fmt(profile.managedBy)}</div>}
              </div>

              <div className="bg-amber-950/70 p-3 rounded-xl border border-amber-500/50 space-y-1">
                <div className="font-serif font-bold text-amber-400 border-b border-amber-500/40 pb-1 text-sm">
                  💍 Partner Expectations
                </div>
                <div><span className="text-amber-300 font-semibold">Preferred Age:</span> {expectations.minAge && expectations.maxAge ? `${expectations.minAge} - ${expectations.maxAge} Yrs` : 'N/A'}</div>
                <div><span className="text-amber-300 font-semibold">Status:</span> {fmt(expectations.preferredMaritalStatus)}</div>
                <div><span className="text-amber-300 font-semibold">Height:</span> {expectations.preferredMinHeight || expectations.preferredMaxHeight ? `${fmt(expectations.preferredMinHeight)} - ${fmt(expectations.preferredMaxHeight)}` : 'N/A'}</div>
                <div><span className="text-amber-300 font-semibold">Location:</span> {fmt(expectations.preferredCity)} {fmt(expectations.preferredState)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!hideBranding && (
          <div className="pt-2 border-t border-amber-500/40 text-center font-sans text-[11px] text-amber-400 font-medium">
            Generated via PrajapatiSamaj Matrimonial Platform • Verifiable Member Profile
          </div>
        )}
      </div>
    );
  }

  // --- THEME 6: VEDIC GOLD (EMERALD GREEN & GOLD HEADER BAND WITH 2x2 CARDS) ---
  if (styleName === 'emerald') {
    return (
      <div
        ref={ref}
        className="w-[794px] h-[1123px] bg-[#F4FBF7] text-emerald-950 p-6 font-serif border-[10px] border-solid border-emerald-800 shadow-2xl relative select-none overflow-hidden box-border flex flex-col justify-between"
        id="biodata-template-canvas"
      >
        <div>
          {/* Header Band */}
          <div className="bg-emerald-900 text-amber-300 py-3 px-6 rounded-2xl text-center shadow border-b-4 border-amber-400">
            <div className="text-sm font-bold tracking-widest uppercase">
              🌿 || SHREE VEDIC BIODATA || 🌿
            </div>
            <h1 className="text-3xl font-black tracking-wider uppercase text-white mt-0.5">
              MARRIAGE BIODATA
            </h1>
          </div>

          {/* Top Horizontal Split: Photo Badge + Core Highlights */}
          <div className="grid grid-cols-12 gap-5 my-4 items-center bg-emerald-100/70 p-3 rounded-2xl border border-emerald-300">
            <div className="col-span-4 flex justify-center">
              <div className="w-36 h-44 rounded-xl border-3 border-emerald-700 p-1 bg-white shadow-md">
                <img src={dpUrl} alt={fullName} className="w-full h-full object-cover rounded-lg" />
              </div>
            </div>
            <div className="col-span-8 space-y-2 font-sans">
              <h2 className="text-2xl font-black text-emerald-950">{fullName}</h2>
              <div className="grid grid-cols-2 gap-y-1 text-xs text-emerald-900">
                <div><strong>Age / Gender:</strong> {fmt(profile.age)} Yrs | {fmt(profile.gender)}</div>
                <div><strong>Height:</strong> {fmt(profile.height)}</div>
                <div><strong>Education:</strong> {fmt(profile.education)}</div>
                <div><strong>Profession:</strong> {fmt(profile.profession)}</div>
                <div><strong>Income:</strong> {fmt(profile.income)}</div>
                <div><strong>Status:</strong> {fmt(profile.maritalStatus)}</div>
              </div>
            </div>
          </div>

          {/* 2x2 Distinct Section Cards Grid */}
          <div className="grid grid-cols-2 gap-4 font-sans text-xs">
            {/* Card 1: Personal Details */}
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-sm space-y-1.5">
              <div className="font-serif font-bold text-emerald-900 border-b border-emerald-200 pb-1 text-sm">
                📌 Personal Details
              </div>
              <div><strong>DOB:</strong> {fmt(profile.dateOfBirth)}</div>
              <div><strong>Birth Time:</strong> {fmt(profile.birthTime)}</div>
              <div><strong>Birthplace:</strong> {fmt(profile.birthPlace)}</div>
              <div><strong>Weight:</strong> {profile.weight ? `${profile.weight} kg` : 'N/A'}</div>
              <div><strong>Blood Group:</strong> {fmt(profile.bloodGroup)}</div>
              <div><strong>Gotra:</strong> {fmt(profile.gotra)}</div>
              <div><strong>Diet:</strong> {fmt(profile.diet)}</div>
              <div><strong>Mangal/Sani:</strong> {profile.hasMangal ? 'Yes' : 'No'} / {profile.hasSani ? 'Yes' : 'No'}</div>
            </div>

            {/* Card 2: Contact & Address */}
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-sm space-y-1.5">
              <div className="font-serif font-bold text-emerald-900 border-b border-emerald-200 pb-1 text-sm">
                📞 Contact &amp; Location
              </div>
              <div><strong>Mobile:</strong> {fmt(profile.mobileNo)}</div>
              <div><strong>Alt Mobile:</strong> {fmt(profile.alternateMobileNo)}</div>
              <div><strong>City &amp; State:</strong> {fmt(profile.city)}, {fmt(profile.state)}</div>
              <div><strong>Pincode:</strong> {fmt(profile.pincode)}</div>
              <div><strong>Address:</strong> {fmt(profile.addressLine)}</div>
            </div>

            {/* Card 3: Family Details */}
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-sm space-y-1.5">
              <div className="font-serif font-bold text-emerald-900 border-b border-emerald-200 pb-1 text-sm">
                👨‍👩‍👧 Family Background
              </div>
              <div><strong>Father:</strong> {fmt(profile.fatherName)}</div>
              <div><strong>Father Occ.:</strong> {fmt(profile.fatherOccupation)}</div>
              <div><strong>Mother:</strong> {fmt(profile.motherName)}</div>
              <div><strong>Mother Occ.:</strong> {fmt(profile.motherOccupation)}</div>
            </div>

            {/* Card 4: Partner Expectations */}
            <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-sm space-y-1.5">
              <div className="font-serif font-bold text-emerald-900 border-b border-emerald-200 pb-1 text-sm">
                💍 Partner Expectations
              </div>
              <div><strong>Age Range:</strong> {expectations.minAge && expectations.maxAge ? `${expectations.minAge} - ${expectations.maxAge} Yrs` : 'N/A'}</div>
              <div><strong>Status:</strong> {fmt(expectations.preferredMaritalStatus)}</div>
              <div><strong>Height:</strong> {expectations.preferredMinHeight || expectations.preferredMaxHeight ? `${fmt(expectations.preferredMinHeight)} - ${fmt(expectations.preferredMaxHeight)}` : 'N/A'}</div>
              <div><strong>Location:</strong> {fmt(expectations.preferredCity)} {fmt(expectations.preferredState)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!hideBranding && (
          <div className="pt-2 border-t border-emerald-300 text-center font-sans text-[11px] text-emerald-800 font-medium">
            Generated via PrajapatiSamaj Matrimonial Platform • Verifiable Member Profile
          </div>
        )}
      </div>
    );
  }

  // --- THEME 6: ROYAL RUBY & GOLD (CRIMSON & OPULENT GOLD) ---
  if (styleName === 'ruby') {
    return (
      <div
        ref={ref}
        className="w-[794px] h-[1123px] bg-[#FFFBFB] text-rose-950 p-7 font-serif border-[10px] border-double border-rose-800 shadow-2xl relative select-none overflow-hidden box-border flex flex-col justify-between"
        id="biodata-template-canvas"
      >
        <div>
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-rose-700/40 relative">
            <div className="text-base text-amber-600 font-bold tracking-widest uppercase">
              🕉️ || શ્રી ગણેશાય નમઃ || 🕉️
            </div>
            <h1 className="text-3xl font-extrabold text-rose-900 tracking-widest mt-1 uppercase">
              MARRIAGE BIODATA
            </h1>
            <div className="text-[11px] tracking-wider text-rose-700 font-sans uppercase mt-0.5">
              Royal Heritage Collection
            </div>
          </div>

          {/* Profile Photo & Quick Summary Banner */}
          <div className="grid grid-cols-12 gap-5 my-4 items-center bg-rose-50/60 p-4 rounded-2xl border border-rose-200">
            <div className="col-span-4 flex justify-center">
              <div className="w-36 h-44 rounded-xl border-2 border-rose-700 p-1 bg-white shadow-md">
                <img src={dpUrl} alt={fullName} className="w-full h-full object-cover rounded-lg" />
              </div>
            </div>
            <div className="col-span-8 space-y-2 pl-2">
              <h2 className="text-2xl font-extrabold text-rose-900">{fullName}</h2>
              <div className="grid grid-cols-2 gap-y-1.5 text-xs font-sans text-rose-900">
                <div><span className="font-bold text-rose-950">Age / Gender:</span> {fmt(profile.age)} Yrs | {fmt(profile.gender)}</div>
                <div><span className="font-bold text-rose-950">Height:</span> {fmt(profile.height)}</div>
                <div><span className="font-bold text-rose-950">Education:</span> {fmt(profile.education)}</div>
                <div><span className="font-bold text-rose-950">Profession:</span> {fmt(profile.profession)}</div>
                <div><span className="font-bold text-rose-950">Annual Income:</span> {fmt(profile.income)}</div>
                <div><span className="font-bold text-rose-950">Marital Status:</span> {fmt(profile.maritalStatus)}</div>
              </div>
            </div>
          </div>

          {/* Sections Layout */}
          <div className="space-y-3 font-sans text-xs">
            {/* Personal Details */}
            <div>
              <div className="bg-rose-100/90 py-1 px-3 rounded-lg border-l-4 border-rose-800 font-serif font-bold text-sm text-rose-950 flex items-center justify-between">
                <span>📌 Personal &amp; Astrological Details</span>
                <span className="text-[11px] font-sans font-normal text-rose-700">Horoscope Profile</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-1.5 px-2 text-rose-900">
                <div><strong>Date of Birth:</strong> {fmt(profile.dateOfBirth)}</div>
                <div><strong>Birth Time:</strong> {fmt(profile.birthTime)}</div>
                <div><strong>Birthplace:</strong> {fmt(profile.birthPlace)}</div>
                <div><strong>Weight:</strong> {profile.weight ? `${profile.weight} kg` : 'N/A'}</div>
                <div><strong>Blood Group:</strong> {fmt(profile.bloodGroup)}</div>
                <div><strong>Gotra:</strong> {fmt(profile.gotra)}</div>
                <div><strong>Diet:</strong> {fmt(profile.diet)}</div>
                <div><strong>Religion / Caste:</strong> {fmt(profile.religion || 'Hindu - Prajapati')}</div>
                <div><strong>Gujarati Mangal:</strong> {profile.hasMangal ? 'Yes' : 'No'}</div>
                <div><strong>Gujarati Sani:</strong> {profile.hasSani ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {/* Contact & Residential */}
            <div>
              <div className="bg-rose-100/90 py-1 px-3 rounded-lg border-l-4 border-rose-800 font-serif font-bold text-sm text-rose-950">
                📞 Contact &amp; Residential Address
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-1.5 px-2 text-rose-900">
                <div><strong>Mobile No:</strong> {fmt(profile.mobileNo)}</div>
                <div><strong>Alternate Mobile:</strong> {fmt(profile.alternateMobileNo)}</div>
                <div><strong>City &amp; State:</strong> {fmt(profile.city)}, {fmt(profile.state)}</div>
                <div><strong>Pincode:</strong> {fmt(profile.pincode)}</div>
                <div className="col-span-2"><strong>Full Address:</strong> {fmt(profile.addressLine)}</div>
              </div>
            </div>

            {/* Family Details */}
            <div>
              <div className="bg-rose-100/90 py-1 px-3 rounded-lg border-l-4 border-rose-800 font-serif font-bold text-sm text-rose-950">
                👨‍👩‍👦 Family Background
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-1.5 px-2 text-rose-900">
                <div><strong>Father's Name:</strong> {fmt(profile.fatherName)}</div>
                <div><strong>Father's Occupation:</strong> {fmt(profile.fatherOccupation)}</div>
                <div><strong>Mother's Name:</strong> {fmt(profile.motherName)}</div>
                <div><strong>Mother's Occupation:</strong> {fmt(profile.motherOccupation)}</div>
                {profile.managedBy && <div className="col-span-2"><strong>Managed By:</strong> {fmt(profile.managedBy)}</div>}
              </div>
            </div>

            {/* Partner Expectations */}
            <div>
              <div className="bg-rose-100/90 py-1 px-3 rounded-lg border-l-4 border-rose-800 font-serif font-bold text-sm text-rose-950">
                💍 Partner Expectations
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-1.5 px-2 text-rose-900">
                <div><strong>Preferred Age:</strong> {expectations.minAge && expectations.maxAge ? `${expectations.minAge} - ${expectations.maxAge} Yrs` : 'N/A'}</div>
                <div><strong>Preferred Marital Status:</strong> {fmt(expectations.preferredMaritalStatus)}</div>
                <div><strong>Preferred Height:</strong> {expectations.preferredMinHeight || expectations.preferredMaxHeight ? `${fmt(expectations.preferredMinHeight)} - ${fmt(expectations.preferredMaxHeight)}` : 'N/A'}</div>
                <div><strong>Preferred Location:</strong> {fmt(expectations.preferredCity)} {fmt(expectations.preferredState)}</div>
                <div className="col-span-2"><strong>Education &amp; Profession:</strong> {fmt(expectations.preferredEducation)} {expectations.preferredProfession ? `| ${expectations.preferredProfession}` : ''}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!hideBranding && (
          <div className="pt-2 border-t border-rose-300 text-center font-sans text-[11px] text-rose-800 font-medium">
            Generated via PrajapatiSamaj Matrimonial Platform • Verifiable Member Profile
          </div>
        )}
      </div>
    );
  }

  // --- THEME 7: ROYAL SAPPHIRE & SILVER (REGAL NAVY & METALLIC SILVER) ---
  if (styleName === 'sapphire') {
    return (
      <div
        ref={ref}
        className="w-[794px] h-[1123px] bg-[#F8FAFC] text-slate-900 p-7 font-sans border-[10px] border-double border-slate-700 shadow-2xl relative select-none overflow-hidden box-border flex flex-col justify-between"
        id="biodata-template-canvas"
      >
        <div>
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-slate-300 relative">
            <div className="text-sm text-blue-800 font-bold tracking-widest uppercase font-serif">
              🌸 || ॐ नमः शिवाय || 🌸
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-wider mt-1 uppercase font-serif">
              MARRIAGE BIODATA
            </h1>
            <div className="text-[11px] tracking-widest text-slate-500 uppercase mt-0.5">
              Royal Sapphire Edition
            </div>
          </div>

          {/* Profile Photo & Candidate Spotlight */}
          <div className="grid grid-cols-12 gap-5 my-4 items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="col-span-4 flex justify-center">
              <div className="w-36 h-44 rounded-xl border-2 border-slate-400 p-1 bg-slate-50 shadow">
                <img src={dpUrl} alt={fullName} className="w-full h-full object-cover rounded-lg" />
              </div>
            </div>
            <div className="col-span-8 space-y-2 border-l border-slate-200 pl-5">
              <h2 className="text-2xl font-bold text-slate-900 font-serif">{fullName}</h2>
              <div className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-700">
                <div><span className="font-semibold text-slate-900">Age / Gender:</span> {fmt(profile.age)} Yrs | {fmt(profile.gender)}</div>
                <div><span className="font-semibold text-slate-900">Height:</span> {fmt(profile.height)}</div>
                <div><span className="font-semibold text-slate-900">Education:</span> {fmt(profile.education)}</div>
                <div><span className="font-semibold text-slate-900">Profession:</span> {fmt(profile.profession)}</div>
                <div><span className="font-semibold text-slate-900">Income:</span> {fmt(profile.income)}</div>
                <div><span className="font-semibold text-slate-900">Marital Status:</span> {fmt(profile.maritalStatus)}</div>
              </div>
            </div>
          </div>

          {/* 4 Cards Grid Layout */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Card 1: Personal Details */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <div className="font-serif font-bold text-blue-900 border-b border-slate-200 pb-1 text-sm flex items-center justify-between">
                <span>📌 Personal Details</span>
              </div>
              <div><strong>DOB:</strong> {fmt(profile.dateOfBirth)}</div>
              <div><strong>Birth Time:</strong> {fmt(profile.birthTime)}</div>
              <div><strong>Birthplace:</strong> {fmt(profile.birthPlace)}</div>
              <div><strong>Weight:</strong> {profile.weight ? `${profile.weight} kg` : 'N/A'}</div>
              <div><strong>Blood Group:</strong> {fmt(profile.bloodGroup)}</div>
              <div><strong>Gotra:</strong> {fmt(profile.gotra)}</div>
              <div><strong>Diet:</strong> {fmt(profile.diet)}</div>
              <div><strong>Mangal / Sani:</strong> {profile.hasMangal ? 'Yes' : 'No'} / {profile.hasSani ? 'Yes' : 'No'}</div>
            </div>

            {/* Card 2: Contact Details */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <div className="font-serif font-bold text-blue-900 border-b border-slate-200 pb-1 text-sm">
                📞 Contact &amp; Address
              </div>
              <div><strong>Mobile:</strong> {fmt(profile.mobileNo)}</div>
              <div><strong>Alt Mobile:</strong> {fmt(profile.alternateMobileNo)}</div>
              <div><strong>City &amp; State:</strong> {fmt(profile.city)}, {fmt(profile.state)}</div>
              <div><strong>Pincode:</strong> {fmt(profile.pincode)}</div>
              <div className="truncate"><strong>Address:</strong> {fmt(profile.addressLine)}</div>
            </div>

            {/* Card 3: Family Details */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <div className="font-serif font-bold text-blue-900 border-b border-slate-200 pb-1 text-sm">
                👨‍👩‍👧 Family Background
              </div>
              <div><strong>Father:</strong> {fmt(profile.fatherName)}</div>
              <div><strong>Father Occ.:</strong> {fmt(profile.fatherOccupation)}</div>
              <div><strong>Mother:</strong> {fmt(profile.motherName)}</div>
              <div><strong>Mother Occ.:</strong> {fmt(profile.motherOccupation)}</div>
              {profile.managedBy && <div><strong>Managed By:</strong> {fmt(profile.managedBy)}</div>}
            </div>

            {/* Card 4: Partner Expectations */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <div className="font-serif font-bold text-blue-900 border-b border-slate-200 pb-1 text-sm">
                💍 Partner Expectations
              </div>
              <div><strong>Age Range:</strong> {expectations.minAge && expectations.maxAge ? `${expectations.minAge} - ${expectations.maxAge} Yrs` : 'N/A'}</div>
              <div><strong>Status:</strong> {fmt(expectations.preferredMaritalStatus)}</div>
              <div><strong>Height:</strong> {expectations.preferredMinHeight || expectations.preferredMaxHeight ? `${fmt(expectations.preferredMinHeight)} - ${fmt(expectations.preferredMaxHeight)}` : 'N/A'}</div>
              <div><strong>Location:</strong> {fmt(expectations.preferredCity)} {fmt(expectations.preferredState)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!hideBranding && (
          <div className="pt-2 border-t border-slate-300 text-center font-sans text-[11px] text-slate-600 font-medium">
            Generated via PrajapatiSamaj Matrimonial Platform • Verifiable Member Profile
          </div>
        )}
      </div>
    );
  }

  return null;
});

export default BiodataTemplates;
