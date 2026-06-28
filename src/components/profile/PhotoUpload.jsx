import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import { uploadPhoto, deletePhoto } from '../../api/profileApi';
import ConfirmDialog from '../common/ConfirmDialog';
import Spinner from '../common/Spinner';
import { resolveImageUrl } from '../../utils/imageHelper';
import logger from '../../utils/logger';

/**
 * Photo management section — upload new photos, delete existing ones.
 * Used inside EditProfilePage.
 * Props: photos (array of { id, url }), onPhotosChange(updatedProfile?)
 *
 * KNOWN LIMITATION: Backend returns photoUrls as List<String> (URLs only, no IDs).
 * Workaround: filename extracted from URL is used as the delete ID.
 * See EditProfilePage extractPhotoId() for details.
 */
const PhotoUpload = ({ photos = [], onPhotosChange }) => {
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, url }
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  /** Compress image then upload via multipart/form-data */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    logger.info('User clicked upload photo');
    logger.info('Compressing image before upload...');

    try {
      setUploading(true);
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append('photo', compressed, file.name);

      logger.api('POST', '/api/profile/photos');
      const updatedProfile = await uploadPhoto(formData);
      logger.info('Photo uploaded successfully');
      toast.success('Photo uploaded!');
      onPhotosChange(updatedProfile);
    } catch (error) {
      logger.error('Photo upload failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /** Delete photo after user confirms in dialog */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    logger.info('User clicked delete photo', { photoId: deleteTarget.id });
    logger.api('DELETE', `/api/profile/photos/${deleteTarget.id}`);

    try {
      setDeleting(true);
      await deletePhoto(deleteTarget.id);
      logger.info('Photo deleted successfully');
      toast.success('Photo deleted.');
      onPhotosChange(); // no arg → parent reloads profile from API
    } catch (error) {
      logger.error('Photo delete failed', error.response?.data);
      toast.error(error.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      {/* Photo count badge */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {photos.length} / 5 photos
      </p>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group">
            {/*
              resolveImageUrl converts "http://localhost:8080/uploads/photos/4/uuid.jpg"
              to "/uploads/photos/4/uuid.jpg" so Vite proxy forwards the request correctly.
            */}
            <img
              src={resolveImageUrl(photo.url)}
              alt="Profile photo"
              className="w-full h-28 object-cover rounded-lg border border-border"
            />
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

      {/* Upload button — hidden when limit reached */}
      {photos.length < 5 && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition"
          >
            {uploading ? <Spinner /> : '📷'}
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </label>
        </>
      )}

      {/* Confirmation dialog for delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
};

export default PhotoUpload;
