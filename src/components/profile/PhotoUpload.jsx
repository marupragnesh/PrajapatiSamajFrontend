import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import { uploadPhoto, deletePhoto, setPrimaryPhoto } from '../../api/profileApi';
import ConfirmDialog from '../common/ConfirmDialog';
import Spinner from '../common/Spinner';
import { resolveImageUrl } from '../../utils/imageHelper';
import logger from '../../utils/logger';

/**
 * PhotoUpload — upload, delete, and set primary photo.
 *
 * Props:
 *   photos         — array of { id, url, isPrimary }
 *   onPhotosChange — callback(updatedProfile?) — called after upload, delete, or set-primary
 *
 * Each photo card shows:
 *   ⭐ (top-left)  — "Set as Primary" button; hidden on already-primary photo
 *   ✕ (top-right)  — Delete button
 *   "Primary" badge (bottom-left) — shown only on the current primary photo
 */
const PhotoUpload = ({ photos = [], onPhotosChange }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);    // local object URL for instant preview
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [settingPrimaryId, setSettingPrimaryId] = useState(null); // photoId being set as primary
  const fileInputRef = useRef(null);

  /** Show instant local preview, compress, and upload */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    logger.info('Photo selected for upload', { fileName: file.name, size: file.size });

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      logger.info('Image compressed', {
        originalKB: Math.round(file.size / 1024),
        compressedKB: Math.round(compressed.size / 1024),
      });

      const formData = new FormData();
      formData.append('photo', compressed, file.name);

      logger.api('POST', '/api/profile/photos');
      const updatedProfile = await uploadPhoto(formData);
      logger.info('Photo uploaded successfully');
      toast.success('Photo uploaded!');

      setPreviewUrl(null);
      onPhotosChange(updatedProfile);
    } catch (error) {
      logger.error('Photo upload failed', error.response?.data);
      setPreviewUrl(null);
      toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Set a photo as primary — PUT /api/profile/photos/{photoId}/primary
   * Backend returns updated ProfileResponse → parent re-renders from it.
   */
  const handleSetPrimary = async (photo) => {
    if (photo.isPrimary) return; // already primary — no-op

    logger.info('Setting primary photo', { photoId: photo.id });
    logger.api('PUT', `/api/profile/photos/${photo.id}/primary`);

    setSettingPrimaryId(photo.id);
    try {
      const updatedProfile = await setPrimaryPhoto(photo.id);
      logger.info('Primary photo set', { photoId: photo.id });
      toast.success('Primary photo updated!');
      onPhotosChange(updatedProfile);
    } catch (error) {
      logger.error('Set primary failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Could not set primary photo.');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  /** Confirm delete — calls DELETE, then parent reloads profile */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    logger.info('Deleting photo', { photoId: deleteTarget.id });
    logger.api('DELETE', `/api/profile/photos/${deleteTarget.id}`);

    try {
      setDeleting(true);
      await deletePhoto(deleteTarget.id);
      logger.info('Photo deleted successfully', { photoId: deleteTarget.id });
      toast.success('Photo deleted.');
      onPhotosChange(); // no arg → parent reloads full profile
    } catch (error) {
      logger.error('Photo delete failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Delete failed. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const totalCount = photos.length + (previewUrl ? 1 : 0);

  return (
    <div>

      {/* Photo count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {totalCount} / 5 photos uploaded
      </p>

      {/* Photo grid */}
      {(photos.length > 0 || previewUrl) && (
        <div className="grid grid-cols-3 gap-3 mb-4">

          {/* Confirmed backend photos */}
          {photos.map((photo) => {
            const isSettingThis = settingPrimaryId === photo.id;

            return (
              <div key={photo.id} className="relative group">
                <img
                  src={resolveImageUrl(photo.url)}
                  alt="Profile photo"
                  className="w-full h-28 object-cover rounded-lg border border-border"
                />

                {/* Primary badge */}
                {photo.isPrimary && (
                  <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded font-medium pointer-events-none">
                    ⭐ Primary
                  </span>
                )}

                {/* Set as Primary button — shown on non-primary photos, top-left */}
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

                {/* Delete button — top-right */}
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

          {/* Instant preview while uploading */}
          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Uploading..."
                className="w-full h-28 object-cover rounded-lg border border-primary opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <Spinner color="white" />
              </div>
              <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                Uploading...
              </span>
            </div>
          )}

        </div>
      )}

      {/* Upload button — hidden when limit reached */}
      {totalCount < 5 && (
        <>
          <input
            ref={fileInputRef}
            type="file"
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
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </label>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Hover a photo and click ⭐ to set it as your primary display photo.
          </p>
        </>
      )}

      {totalCount >= 5 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Maximum 5 photos reached. Delete one to upload a new photo.
        </p>
      )}

      {/* Confirm delete dialog */}
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
