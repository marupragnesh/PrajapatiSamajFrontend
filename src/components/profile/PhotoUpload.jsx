import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import { uploadPhoto, deletePhoto, setPrimaryPhoto } from '../../api/profileApi';
import ConfirmDialog from '../common/ConfirmDialog';
import Spinner from '../common/Spinner';
import ImageAdjustModal from './ImageAdjustModal';
import { resolveImageUrl } from '../../utils/imageHelper';
import logger from '../../utils/logger';

/**
 * PhotoUpload — upload, preview/adjust, delete, and set primary photo.
 * Supports Instagram-style multi-photo selection, cropping, zoom, and aspect ratio adjustment.
 * Max 10 photos per profile (enforced in backend, reflected here in UI).
 */
const MAX_PHOTOS = 10;

const PhotoUpload = ({ photos = [], onPhotosChange }) => {
  const [uploading, setUploading]               = useState(false);
  const [uploadProgress, setUploadProgress]     = useState('');
  const [deleteTarget, setDeleteTarget]         = useState(null);
  const [deleting, setDeleting]                 = useState(false);
  const [settingPrimaryId, setSettingPrimaryId] = useState(null);
  const [selectedFiles, setSelectedFiles]       = useState(null); // Files passed to ImageAdjustModal
  const fileInputRef                            = useRef(null);

  const handleFileChange = (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      toast.error(`Maximum limit of ${MAX_PHOTOS} photos reached.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    let filesToProcess = rawFiles;
    if (rawFiles.length > remaining) {
      toast.error(`You can only upload ${remaining} more photo(s). Selecting first ${remaining}.`);
      filesToProcess = rawFiles.slice(0, remaining);
    }

    logger.info(`${filesToProcess.length} photo(s) selected for adjustment modal`);
    setSelectedFiles(filesToProcess);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmAdjustments = async (adjustedFiles) => {
    setSelectedFiles(null);
    if (!adjustedFiles || adjustedFiles.length === 0) return;

    setUploading(true);
    let lastUpdatedProfile = null;

    try {
      for (let i = 0; i < adjustedFiles.length; i++) {
        const file = adjustedFiles[i];
        setUploadProgress(`Uploading ${i + 1} of ${adjustedFiles.length}...`);
        logger.info(`Processing & compressing photo ${i + 1}`, { fileName: file.name, size: file.size });

        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });

        const formData = new FormData();
        formData.append('photo', compressed, file.name || `photo_${Date.now()}.jpg`);

        lastUpdatedProfile = await uploadPhoto(formData);
        logger.info(`Photo ${i + 1} uploaded successfully`);
      }

      toast.success(
        adjustedFiles.length > 1
          ? `All ${adjustedFiles.length} photos uploaded successfully!`
          : 'Photo uploaded successfully!'
      );
      if (onPhotosChange) onPhotosChange(lastUpdatedProfile);
    } catch (error) {
      logger.error('Batch photo upload failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleSetPrimary = async (photo) => {
    if (photo.isPrimary) return;
    setSettingPrimaryId(photo.id);
    try {
      const updatedProfile = await setPrimaryPhoto(photo.id);
      toast.success('Primary photo updated!');
      onPhotosChange(updatedProfile);
    } catch (error) {
      logger.error('Set primary failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not set primary photo.');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deletePhoto(deleteTarget.id);
      toast.success('Photo deleted.');
      onPhotosChange();
    } catch (error) {
      logger.error('Photo delete failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Delete failed. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const totalCount = photos.length;

  return (
    <div>
      {/* Photo count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {totalCount} / {MAX_PHOTOS} photos uploaded
      </p>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {photos.map((photo) => {
            const isSettingThis = settingPrimaryId === photo.id;
            return (
              <div key={photo.id} className="relative group">
                <img
                  src={resolveImageUrl(photo.url)}
                  alt="Profile photo"
                  className="w-full h-28 object-cover rounded-lg border border-border"
                />
                {photo.isPrimary && (
                  <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded font-medium pointer-events-none">
                    ⭐ Primary
                  </span>
                )}
                {!photo.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(photo)}
                    disabled={isSettingThis || !!settingPrimaryId}
                    title="Set as primary photo"
                    className="absolute top-1 left-1 bg-black/60 text-white text-xs rounded px-1.5 py-0.5
                               opacity-0 group-hover:opacity-100 transition disabled:opacity-40
                               flex items-center gap-1"
                  >
                    {isSettingThis ? <Spinner color="white" size="xs" /> : '⭐'}
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(photo)}
                  disabled={isSettingThis}
                  className="absolute top-1 right-1 bg-error text-white text-xs rounded-full w-6 h-6
                             flex items-center justify-center opacity-0 group-hover:opacity-100 transition
                             disabled:opacity-40"
                  title="Delete photo"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload button — hidden when limit reached */}
      {totalCount < MAX_PHOTOS && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
            disabled={uploading}
          />
          <label
            htmlFor="photo-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition
              ${uploading
                ? 'border-gray-300 text-gray-400 cursor-not-allowed pointer-events-none'
                : 'border-primary text-primary cursor-pointer hover:bg-primary hover:text-white'
              }`}
          >
            {uploading ? <Spinner color="primary" /> : '📷'}
            {uploading ? uploadProgress || 'Uploading...' : 'Select Photo(s) to Upload'}
          </label>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            You can select multiple photos from file manager and adjust aspect ratio, crop &amp; zoom before uploading.
          </p>
        </>
      )}

      {totalCount >= MAX_PHOTOS && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Maximum {MAX_PHOTOS} photos reached. Delete one to upload a new photo.
        </p>
      )}

      {/* Instagram-style Photo Preview & Adjust Modal */}
      {selectedFiles && (
        <ImageAdjustModal
          files={selectedFiles}
          onClose={() => setSelectedFiles(null)}
          onConfirm={handleConfirmAdjustments}
          uploading={uploading}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Photo"
        message={
          deleteTarget?.isPrimary
            ? 'This is your primary photo. Deleting it will automatically promote the next photo. Are you sure?'
            : 'Are you sure you want to delete this photo? This cannot be undone.'
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default PhotoUpload;

