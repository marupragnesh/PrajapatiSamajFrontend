import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import BiodataTemplates from './BiodataTemplates';

/**
 * BiodataPreview Component
 * Renders protected preview of Marriage Biodata with 6 Traditional Themes.
 * Enforces anti-screenshot protection and security watermark for unpaid users.
 */
const BiodataPreview = ({ profile, isUnlocked, onPayNow, userEmail }) => {
  const [selectedStyle, setSelectedStyle] = useState('royal');
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const templateRef = useRef(null);

  // Security Listener: Detect tab/window blur (loss of focus)
  useEffect(() => {
    const handleBlur = () => setIsWindowBlurred(true);
    const handleFocus = () => setIsWindowBlurred(false);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    const handleVisibility = () => {
      if (document.hidden) setIsWindowBlurred(true);
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Security Listener: Intercept key combinations for PrintScreen, Win+Shift+S, DevTools
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isWinShiftS = e.shiftKey && (e.key.toLowerCase() === 's' || e.code === 'KeyS') && (e.metaKey || e.ctrlKey || e.altKey);
      const isMacScreenshot = (e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5' || e.key.toLowerCase() === 's');

      if (e.key === 'PrintScreen' || isWinShiftS || isMacScreenshot) {
        e.preventDefault();
        e.stopPropagation();
        toast.error('Screenshots & Snipping Tool are disabled during preview mode!', { id: 'no-screenshot' });
        setIsWindowBlurred(true);
        setTimeout(() => setIsWindowBlurred(false), 2500);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        toast.error('Printing is disabled in preview mode. Please download via Premium!', { id: 'no-print' });
      }
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'c')
      ) {
        toast.error('Inspect mode protected during biodata preview.', { id: 'no-devtools' });
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Meta' || e.key === 'Windows' || e.key === 'PrintScreen') {
        setIsWindowBlurred(true);
        setTimeout(() => setIsWindowBlurred(false), 2000);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, []);

  const [scale, setScale] = useState(0.5);
  const previewContainerRef = useRef(null);

  // Dynamic responsive auto-scaling for A4 preview based on container width
  const updateScale = () => {
    if (previewContainerRef.current) {
      const containerWidth = previewContainerRef.current.clientWidth;
      const targetWidth = Math.max(containerWidth - 24, 280);
      const calculatedScale = targetWidth / 794;
      setScale(Math.min(Math.max(calculatedScale, 0.35), 0.95));
    }
  };

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    const observer = new ResizeObserver(() => updateScale());
    if (previewContainerRef.current) observer.observe(previewContainerRef.current);
    return () => {
      window.removeEventListener('resize', updateScale);
      observer.disconnect();
    };
  }, []);

  // Download Action for Premium users / Direct Checkout trigger for unpaid users
  const handleDownload = () => {
    if (!isUnlocked) {
      if (onPayNow) onPayNow();
      return;
    }

    setIsExporting(true);
    toast.loading('Preparing single-page Biodata PDF...', { id: 'export-biodata' });

    setTimeout(() => {
      try {
        const templateNode = templateRef.current;
        if (!templateNode) throw new Error('Template element unavailable.');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${profile?.fullName || 'Marriage_Biodata'} - Marriage Biodata</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @page { size: 210mm 297mm; margin: 0; }
                html, body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; width: 210mm; height: 297mm; overflow: hidden; }
                #biodata-template-canvas { width: 210mm !important; height: 297mm !important; max-height: 297mm !important; box-shadow: none !important; border-radius: 0 !important; margin: 0 auto; box-sizing: border-box; }
              </style>
            </head>
            <body>
              ${templateNode.outerHTML}
              <script>
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 800);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        toast.success('Biodata ready for download!', { id: 'export-biodata' });
      } catch (err) {
        toast.error('Failed to generate export. Please try again.', { id: 'export-biodata' });
      } finally {
        setIsExporting(false);
      }
    }, 500);
  };

  const themes = [
    { id: 'royal', label: '🌸 Royal Heritage' },
    { id: 'vedic', label: '🛕 Vedic Shubh' },
    { id: 'kesari', label: '📙 Kesari Vintage' },
    { id: 'temple', label: '🪷 Temple Elegance' },
    { id: 'emerald', label: '🌿 Vedic Gold' },
    { id: 'ruby', label: '👑 Royal Ruby' },
    { id: 'sapphire', label: '💠 Royal Sapphire' },
  ];

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body { display: none !important; }
        }
        .biodata-protected-container {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
      `}</style>

      {/* Header Controls: Traditional Themes, Icon-Only Eye Button & Download Button */}
      <div className="bg-white dark:bg-card-dark rounded-2xl p-4 sm:p-5 shadow-lg border border-border/80 dark:border-gray-700 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 dark:border-gray-700 pb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>📜</span> Marriage Biodata Studio
            </h3>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                isUnlocked
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-primary hover:bg-primary-light text-white'
              }`}
            >
              <span>{isUnlocked ? '📥' : '🔒'}</span>
              <span>{isUnlocked ? 'Download PDF (A4)' : 'Unlock PDF (₹99)'}</span>
            </button>
          </div>
        </div>

        {/* 6 Traditional Theme Buttons — responsive horizontal scroll on mobile, grid on sm+ */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Traditional Marriage Themes:</p>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none sm:grid sm:grid-cols-3 md:grid-cols-6">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedStyle(t.id)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer text-center whitespace-nowrap sm:whitespace-normal flex-shrink-0 ${
                  selectedStyle === t.id
                    ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-500/40'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Protected Preview Display Container */}
      <div
        ref={previewContainerRef}
        onContextMenu={(e) => {
          e.preventDefault();
          toast.error('Right-click disabled during preview mode.', { id: 'no-right-click' });
        }}
        className="biodata-protected-container relative overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gray-950 p-2 sm:p-6 flex justify-center items-center shadow-2xl transition-all"
        style={{ minHeight: `${Math.round(1123 * scale + 24)}px` }}
      >
        {/* Anti-Screen Recording / Snipping Tool Focus Loss Overlay */}
        {isWindowBlurred && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6 space-y-3">
            <span className="text-4xl">🛡️</span>
            <h4 className="text-xl font-bold text-white">Preview Content Protected</h4>
            <p className="text-xs text-gray-400 max-w-sm">
              Screen recording and snapshot protection active. Click back into this window to resume preview.
            </p>
          </div>
        )}

        {/* Dynamic Responsive Auto-Scaling Wrapper */}
        <div
          className="relative transition-all"
          style={{
            width: `${Math.round(794 * scale)}px`,
            height: `${Math.round(1123 * scale)}px`,
            overflow: 'hidden',
            margin: '0 auto',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div
            style={{
              width: '794px',
              height: '1123px',
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <BiodataTemplates
              ref={templateRef}
              profile={profile}
              styleName={selectedStyle}
              hideBranding={isUnlocked}
            />

            {/* Security Watermark Overlay directly inside Template Canvas */}
            {!isUnlocked && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-25 select-none z-30">
                <div className="transform -rotate-45 text-center space-y-12">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="text-3xl font-black tracking-widest text-amber-900 uppercase whitespace-nowrap">
                      PREVIEW ONLY • DO NOT RECORD / COPY • {userEmail || 'MATRIMONIAL'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiodataPreview;
