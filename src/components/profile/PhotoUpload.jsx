import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import { uploadPhoto, deletePhoto } from '../../api/profileApi';
import ConfirmDialog from '../common/ConfirmDialog';
import Spinner from '../common/Spinner';
import { resolveImageUrl } from '../../utils/imageHelper';
import logger from '../../utils/logger';

/**
 * PhotoUpload — upload new photos one at a time, delete existing ones.
 *
 * Props:
 *   photos         — array of { id: photoId, url: photoUrl, isPrimary }
 *   onPhotosChange — callback(updatedProfile?) called after upload or delete
 *
 * Upload flow:
 *   1. User picks file → local preview shown immediately via object URL
 *   2. Image compressed → POST multipart to backend
 *   3. On success → preview replaced by backend URL, parent state updated
 *   4. On failure → preview removed, error toast shown
 */
const PhotoUpload = ({ photos = [], onPhotosChange }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null); // local object URL for instant preview
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  /** Show instant local preview, then compress and upload */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    logger.info('Photo selected for upload', { fileName: file.name, size: file.size });

    // Show instant local preview before upload starts
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploading(true);

    try {
      // Compress before upload
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });
      logger.info('Image compressed', {
        originalKB: Math.round(file.size / 1024),
        compressedKB: Math.round(compressed.size / 1024),
      });

      // Use original file.name — compressed is a Blob, not a File
      const formData = new FormData();
      formData.append('photo', compressed, file.name);

      logger.api('POST', '/api/profile/photos');
      const updatedProfile = await uploadPhoto(formData);
      logger.info('Photo uploaded successfully');
      toast.success('Photo uploaded!');

      // Clear local preview — parent will render the backend URL
      setPreviewUrl(null);
      onPhotosChange(updatedProfile);
    } catch (error) {
      logger.error('Photo upload failed', error.response?.data);
      setPreviewUrl(null);
      toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      // Revoke object URL to free memory
      URL.revokeObjectURL(localPreview);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Delete confirmed — calls DELETE /api/profile/photos/{photoId}.
   * After success: onPhotosChange() with no arg → parent reloads profile.
   */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    logger.info('Deleting photo', { photoId: deleteTarget.id });
    logger.api('DELETE', `/api/profile/photos/${deleteTarget.id}`);

    try {
      setDeleting(true);
      await deletePhoto(deleteTarget.id);
      logger.info('Photo deleted successfully', { photoId: deleteTarget.id });
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

  // Total visible slots = uploaded photos + (1 preview slot while uploading)
  const totalCount = photos.length + (previewUrl ? 1 : 0);

  return (
    <div>

      {/* Photo count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {totalCount} / 5 photos uploaded
      </p>

      {/* Photo grid — existing photos + instant preview slot */}
      {(photos.length > 0 || previewUrl) && (
        <div className="grid grid-cols-3 gap-3 mb-4">

          {/* Confirmed photos from backend */}
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={resolveImageUrl(photo.url)}
                alt="Profile photo"
                className="w-full h-28 object-cover rounded-lg border border-border"
              />
              {photo.isPrimary && (
                <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded font-medium">
                  Primary
                </span>
              )}
              <button
                onClick={() => setDeleteTarget(photo)}
                className="absolute top-1 right-1 bg-error text-white text-xs rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                title="Delete photo"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Instant preview slot — shown while upload is in progress */}
          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Uploading..."
                className="w-full h-28 object-cover rounded-lg border border-primary opacity-70"
              />
              {/* Spinner overlay on top of preview */}
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

      {/* Upload button — hidden when 5 photos reached */}
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
            {/* Use primary color spinner on the light label background */}
            {uploading ? <Spinner color="primary" /> : '📷'}
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </label>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Click to select a photo. Repeat for each photo (max 5).
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
            ? 'This is your primary photo. Deleting it will remove it from your profile cover. Are you sure?'
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
