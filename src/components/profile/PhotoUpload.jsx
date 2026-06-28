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
 *                    mapped from backend PhotoDto by EditProfilePage.mapPhotos()
 *   onPhotosChange — callback(updatedProfile?) called after upload or delete
 *
 * Delete flow:
 *   photo.id is the numeric photoId from the backend (e.g. 6, 7, 8).
 *   DELETE /api/profile/photos/{photoId} uses this ID directly.
 *   Old workaround (filename extraction) is fully removed.
 *
 * Upload flow:
 *   User clicks "Upload Photo" → picks one file → compressed → POST multipart.
 *   Repeat up to 5 times (one file per click, limit enforced by photos.length < 5).
 */
const PhotoUpload = ({ photos = [], onPhotosChange }) => {
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, url, isPrimary }
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  /** Compress → upload one photo file */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    logger.info('Photo selected for upload', { fileName: file.name, size: file.size });

    try {
      setUploading(true);

      // Compress before upload — keeps payload small
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
      onPhotosChange(updatedProfile); // parent updates photos state from response
    } catch (error) {
      logger.error('Photo upload failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /**
   * Delete confirmed — calls DELETE /api/profile/photos/{photoId}.
   * deleteTarget.id is the numeric photoId (e.g. 8), not a filename.
   * After success: onPhotosChange() with no arg → parent reloads profile from API.
   */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    logger.info('Deleting photo', { photoId: deleteTarget.id, url: deleteTarget.url });
    logger.api('DELETE', `/api/profile/photos/${deleteTarget.id}`);

    try {
      setDeleting(true);
      await deletePhoto(deleteTarget.id);
      logger.info('Photo deleted successfully', { photoId: deleteTarget.id });
      toast.success('Photo deleted.');
      onPhotosChange(); // no arg → EditProfilePage calls loadData() to refresh
    } catch (error) {
      logger.error('Photo delete failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Delete failed. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div>

      {/* Photo count */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {photos.length} / 5 photos uploaded
      </p>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              {/*
                photo.url is a relative path from backend: "/uploads/photos/5/uuid.jpg"
                resolveImageUrl() strips the backend host if present.
                Vite proxy forwards /uploads/* to localhost:8080.
              */}
              <img
                src={resolveImageUrl(photo.url)}
                alt="Profile photo"
                className="w-full h-28 object-cover rounded-lg border border-border"
              />

              {/* Primary badge */}
              {photo.isPrimary && (
                <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded font-medium">
                  Primary
                </span>
              )}

              {/* Delete button — visible on hover */}
              <button
                onClick={() => setDeleteTarget(photo)}
                className="absolute top-1 right-1 bg-error text-white text-xs rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                title="Delete photo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button — one file at a time, hidden when limit reached */}
      {photos.length < 5 && (
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
                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                : 'border-primary text-primary cursor-pointer hover:bg-primary hover:text-white'
              }`}
          >
            {uploading ? <Spinner /> : '📷'}
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </label>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Click to open file manager and select one photo. Repeat for each photo (max 5).
          </p>
        </>
      )}

      {photos.length >= 5 && (
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
