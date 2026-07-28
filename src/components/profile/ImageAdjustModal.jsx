import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * ImageAdjustModal — Instagram-Style Image Preview, Aspect Ratio & Crop Adjustment Modal.
 *
 * Features:
 *   - Multi-photo queue navigation (thumbnails bar, prev/next, counter)
 *   - Aspect ratio selection (4:5 Instagram Portrait, 1:1 Square, 16:9 Landscape, Original)
 *   - Interactive dragging / panning on canvas
 *   - Zoom scale slider (1x - 3x)
 *   - 90° Rotate button & Reset adjustments button
 *   - Exports high-quality cropped JPEG Blobs for each adjusted photo
 */
const ASPECT_RATIOS = [
  { id: '4:5', label: '4:5 Portrait', ratio: 4 / 5 },
  { id: '1:1', label: '1:1 Square', ratio: 1 / 1 },
  { id: '16:9', label: '16:9 Wide', ratio: 16 / 9 },
  { id: 'ORIGINAL', label: 'Original', ratio: null },
];

const ImageAdjustModal = ({ files = [], onClose, onConfirm, uploading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Per-photo adjustments state map
  const [adjustments, setAdjustments] = useState({});

  // Canvas ref
  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Loaded HTML Image element for current photo
  const [currentImage, setCurrentImage] = useState(null);

  // Initialize adjustments map for each file
  useEffect(() => {
    const initialMap = {};
    files.forEach((file, index) => {
      initialMap[index] = {
        zoom: 1,
        rotation: 0, // 0, 90, 180, 270
        panX: 0,
        panY: 0,
        aspectRatioId: '4:5', // Instagram portrait by default
      };
    });
    setAdjustments(initialMap);
    setCurrentIndex(0);
  }, [files]);

  // Load image object whenever currentIndex changes
  useEffect(() => {
    if (!files[currentIndex]) return;
    const file = files[currentIndex];
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      setCurrentImage(img);
    };
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [files, currentIndex]);

  const currentAdj = adjustments[currentIndex] || {
    zoom: 1,
    rotation: 0,
    panX: 0,
    panY: 0,
    aspectRatioId: '4:5',
  };

  const updateCurrentAdj = useCallback((updater) => {
    setAdjustments((prev) => {
      const current = prev[currentIndex] || {
        zoom: 1,
        rotation: 0,
        panX: 0,
        panY: 0,
        aspectRatioId: '4:5',
      };
      const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      return { ...prev, [currentIndex]: updated };
    });
  }, [currentIndex]);

  // Render preview canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentImage) return;

    const ctx = canvas.getContext('2d');
    const { zoom, rotation, panX, panY, aspectRatioId } = currentAdj;

    const containerWidth = canvas.clientWidth || 360;
    const containerHeight = canvas.clientHeight || 450;
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Calculate crop frame dimensions
    let cropW = containerWidth - 32;
    let cropH = containerHeight - 32;

    const targetRatioConfig = ASPECT_RATIOS.find((r) => r.id === aspectRatioId);
    let targetRatio = targetRatioConfig?.ratio;

    if (!targetRatio) {
      // Original ratio
      targetRatio = currentImage.width / currentImage.height;
    }

    if (cropW / cropH > targetRatio) {
      cropW = cropH * targetRatio;
    } else {
      cropH = cropW / targetRatio;
    }

    const cropX = (containerWidth - cropW) / 2;
    const cropY = (containerHeight - cropH) / 2;

    // Draw dark overlay outside crop area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, containerWidth, containerHeight);

    // Save state for clipped drawing area inside crop frame
    ctx.save();
    ctx.beginPath();
    ctx.rect(cropX, cropY, cropW, cropH);
    ctx.clip();

    // Fill background inside crop frame
    ctx.fillStyle = '#111827';
    ctx.fillRect(cropX, cropY, cropW, cropH);

    // Move to center of crop box
    const centerX = cropX + cropW / 2 + panX;
    const centerY = cropY + cropH / 2 + panY;

    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw current image centered
    const imgWidth = currentImage.width;
    const imgHeight = currentImage.height;

    // Scale image to cover the crop box initially
    const scaleToCover = Math.max(cropW / imgWidth, cropH / imgHeight);
    const drawW = imgWidth * scaleToCover;
    const drawH = imgHeight * scaleToCover;

    ctx.drawImage(currentImage, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();

    // Draw crop frame border & grid lines
    ctx.strokeStyle = '#ea580c'; // primary color
    ctx.lineWidth = 2.5;
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // Rule of thirds grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Vertical lines
    ctx.moveTo(cropX + cropW / 3, cropY);
    ctx.lineTo(cropX + cropW / 3, cropY + cropH);
    ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
    ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);
    // Horizontal lines
    ctx.moveTo(cropX, cropY + cropH / 3);
    ctx.lineTo(cropX + cropW, cropY + cropH / 3);
    ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
    ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
    ctx.stroke();
  }, [currentImage, currentAdj]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Mouse & Touch Drag Event Handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    updateCurrentAdj((prev) => ({
      ...prev,
      panX: prev.panX + dx,
      panY: prev.panY + dy,
    }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

    updateCurrentAdj((prev) => ({
      ...prev,
      panX: prev.panX + dx,
      panY: prev.panY + dy,
    }));
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    updateCurrentAdj((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  // Reset current photo adjustments
  const handleReset = () => {
    updateCurrentAdj({
      zoom: 1,
      rotation: 0,
      panX: 0,
      panY: 0,
      aspectRatioId: '4:5',
    });
  };

  // Crop image into a final File Blob using full resolution offscreen canvas
  const processCroppedFile = (file, adj) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const url = URL.createObjectURL(file);
      img.src = url;
      img.onload = () => {
        const { zoom, rotation, panX, panY, aspectRatioId } = adj;

        let targetRatio = ASPECT_RATIOS.find((r) => r.id === aspectRatioId)?.ratio;
        if (!targetRatio) {
          targetRatio = img.width / img.height;
        }

        // Target high-res export size (max 1200px)
        let exportW = 1200;
        let exportH = Math.round(exportW / targetRatio);
        if (exportH > 1500) {
          exportH = 1500;
          exportW = Math.round(exportH * targetRatio);
        }

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = exportW;
        exportCanvas.height = exportH;
        const ctx = exportCanvas.getContext('2d');

        // Dark background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, exportW, exportH);

        // Map panX and panY from preview canvas space to export canvas space
        const previewCanvas = canvasRef.current;
        const scaleFactor = previewCanvas ? exportW / (previewCanvas.clientWidth || 360) : 3.3;

        ctx.translate(exportW / 2 + panX * scaleFactor, exportH / 2 + panY * scaleFactor);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        const scaleToCover = Math.max(exportW / img.width, exportH / img.height);
        const drawW = img.width * scaleToCover;
        const drawH = img.height * scaleToCover;

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

        exportCanvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          const croppedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(croppedFile);
        }, 'image/jpeg', 0.92);
      };
    });
  };

  // Confirm and process all photos
  const handleConfirmAll = async () => {
    const processedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const adj = adjustments[i] || {
        zoom: 1,
        rotation: 0,
        panX: 0,
        panY: 0,
        aspectRatioId: '4:5',
      };
      const processed = await processCroppedFile(file, adj);
      processedFiles.push(processed);
    }
    onConfirm(processedFiles);
  };

  if (!files || files.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-xl bg-gray-900 border border-gray-800 text-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60">
          <div>
            <h2 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <span>📷</span> Adjust &amp; Crop Photo
            </h2>
            <p className="text-xs text-gray-400">
              Photo {currentIndex + 1} of {files.length} • Drag to reposition
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-gray-400 hover:text-white text-xl font-bold p-1 rounded-lg transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Canvas Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center p-2 min-h-[320px] max-h-[440px] overflow-hidden select-none">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full h-full object-contain cursor-grab active:cursor-grabbing rounded-xl"
          />
        </div>

        {/* Adjustments Toolbar */}
        <div className="p-4 bg-gray-900 border-t border-gray-800 space-y-4">
          
          {/* Aspect Ratio Buttons */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ASPECT_RATIOS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateCurrentAdj({ aspectRatioId: item.id })}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    currentAdj.aspectRatioId === item.id
                      ? 'bg-primary border-primary text-white shadow-md'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Slider & Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>🔍 Zoom</span>
                <span>{Math.round(currentAdj.zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateCurrentAdj((prev) => ({ ...prev, zoom: Math.max(1, prev.zoom - 0.1) }))
                  }
                  className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-bold flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={currentAdj.zoom}
                  onChange={(e) =>
                    updateCurrentAdj({ zoom: parseFloat(e.target.value) })
                  }
                  className="w-full accent-primary cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateCurrentAdj((prev) => ({ ...prev, zoom: Math.min(3, prev.zoom + 0.1) }))
                  }
                  className="w-7 h-7 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-bold flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <button
                type="button"
                onClick={handleRotate}
                title="Rotate 90 degrees"
                className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-gray-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>🔄</span> 90°
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset crop"
                className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-gray-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>↺</span> Reset
              </button>
            </div>
          </div>

          {/* Multi-Photo Carousel Queue (shown if > 1 photo) */}
          {files.length > 1 && (
            <div className="pt-2 border-t border-gray-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <span>Select photo to adjust ({files.length} selected):</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="px-2 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-40 cursor-pointer text-xs"
                  >
                    ← Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(files.length - 1, prev + 1))}
                    disabled={currentIndex === files.length - 1}
                    className="px-2 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-40 cursor-pointer text-xs"
                  >
                    Next →
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {files.map((file, idx) => {
                  const previewSrc = URL.createObjectURL(file);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${
                        currentIndex === idx
                          ? 'border-primary ring-2 ring-primary/40'
                          : 'border-gray-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={previewSrc} alt={`File ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 right-0 bg-black/70 text-[10px] text-white px-1 font-mono">
                        #{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 font-semibold text-xs hover:bg-gray-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAll}
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white font-bold text-xs shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {uploading ? 'Processing...' : `Upload ${files.length} ${files.length > 1 ? 'Photos' : 'Photo'}`}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ImageAdjustModal;
