import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { getStorageService } from './config';

export interface UploadResult {
  url: string;
  path: string;
  success: boolean;
  error?: string;
}

/**
 * Upload file to Cloud Storage
 */
export const uploadFile = async (
  file: File,
  folder: string
): Promise<UploadResult> => {
  try {
    const storage = getStorageService();
    if (!storage) throw new Error('Storage not initialized');

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File size exceeds 5MB limit');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `${folder}/${fileName}`;
    const storageRef = ref(storage, filePath);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const url = await getDownloadURL(snapshot.ref);

    return {
      url,
      path: filePath,
      success: true,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      url: '',
      path: '',
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

/**
 * Upload product images
 */
export const uploadProductImage = async (
  file: File,
  productId: string
): Promise<UploadResult> => {
  return uploadFile(file, `products/${productId}`);
};

/**
 * Upload user avatar
 */
export const uploadUserAvatar = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  return uploadFile(file, `users/${userId}`);
};

/**
 * Delete file from Cloud Storage
 */
export const deleteFile = async (filePath: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const storage = getStorageService();
    if (!storage) throw new Error('Storage not initialized');

    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
};

/**
 * Get download URL for a file
 */
export const getFileUrl = async (filePath: string): Promise<string | null> => {
  try {
    const storage = getStorageService();
    if (!storage) throw new Error('Storage not initialized');

    const fileRef = ref(storage, filePath);
    const url = await getDownloadURL(fileRef);

    return url;
  } catch (error) {
    console.error('Error getting file URL:', error);
    return null;
  }
};

/**
 * List files in a directory
 */
export const listFiles = async (folderPath: string): Promise<string[]> => {
  try {
    const storage = getStorageService();
    if (!storage) throw new Error('Storage not initialized');

    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);

    return Promise.all(
      result.items.map((item) => getDownloadURL(item))
    );
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};
