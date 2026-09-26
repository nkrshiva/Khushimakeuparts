import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../firebase';

export interface StorageUploadOptions {
  timeoutMs?: number;
  onProgress?: (progressPercent: number) => void;
}

export interface IStorageAdapter {
  isAvailable(): boolean;
  upload(fullPath: string, file: File, options?: StorageUploadOptions): Promise<string>;
  delete(pathOrUrl: string): Promise<void>;
  getDownloadUrl(fullPath: string): Promise<string>;
}

/**
 * FirebaseStorageAdapter
 *
 * Low-level infrastructure adapter encapsulating Firebase Storage SDK primitives.
 * Provides resumable uploads with progress tracking, timeouts, download URL resolution,
 * and object deletion.
 */
export class FirebaseStorageAdapter implements IStorageAdapter {
  /**
   * Checks whether Firebase Storage runtime singleton is initialized and accessible.
   */
  isAvailable(): boolean {
    return Boolean(storage);
  }

  /**
   * Performs a resumable binary upload to Firebase Storage at the specified storage path.
   * Supports upload cancellation via timeout and continuous progress monitoring.
   */
  async upload(
    fullPath: string,
    file: File,
    options?: StorageUploadOptions
  ): Promise<string> {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized or unavailable');
    }

    const storageRef = ref(storage, fullPath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise<string>((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      if (options?.timeoutMs && options.timeoutMs > 0) {
        timer = setTimeout(() => {
          uploadTask.cancel();
          reject(new Error('Firebase upload timed out'));
        }, options.timeoutMs);
      }

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (options?.onProgress && snapshot.totalBytes > 0) {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            options.onProgress(progress);
          }
        },
        (error) => {
          if (timer) clearTimeout(timer);
          reject(error);
        },
        async () => {
          if (timer) clearTimeout(timer);
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (urlErr) {
            reject(urlErr);
          }
        }
      );
    });
  }

  /**
   * Resolves the public HTTPS download URL for an existing storage path.
   */
  async getDownloadUrl(fullPath: string): Promise<string> {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized or unavailable');
    }
    const storageRef = ref(storage, fullPath);
    return await getDownloadURL(storageRef);
  }

  /**
   * Deletes a storage object given either a relative storage path or a full storage URL.
   */
  async delete(pathOrUrl: string): Promise<void> {
    if (!storage) {
      throw new Error('Firebase Storage is not initialized or unavailable');
    }
    const storageRef = ref(storage, pathOrUrl);
    await deleteObject(storageRef);
  }
}

export const storageAdapter = new FirebaseStorageAdapter();
