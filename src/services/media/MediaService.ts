import {
  storageAdapter,
  type IStorageAdapter,
} from '../../infrastructure/storage';

export interface UploadMediaOptions {
  folder?: string;
  customPath?: string;
  timeoutMs?: number;
  onProgress?: (progressPercent: number) => void;
}

export interface IMediaService {
  isAvailable(): boolean;
  uploadFile(file: File, options?: UploadMediaOptions): Promise<string>;
  uploadAdminMedia(file: File, timeoutMs?: number): Promise<string>;
  uploadReviewPhoto(file: File, onProgress?: (progress: number) => void): Promise<string>;
  deleteMedia(pathOrUrl: string): Promise<void>;
}

/**
 * MediaService
 *
 * Domain-level media orchestration service.
 * Sanitizes file names, determines target storage paths, validates file inputs,
 * and coordinates upload/deletion workflows with the storage infrastructure adapter.
 * Contains NO React state and NO direct Firebase SDK dependencies.
 */
export class MediaService implements IMediaService {
  private readonly storageAdapter: IStorageAdapter;

  constructor(adapter: IStorageAdapter = storageAdapter) {
    this.storageAdapter = adapter;
  }

  /**
   * Checks whether the underlying storage infrastructure is available and ready for use.
   */
  isAvailable(): boolean {
    return this.storageAdapter.isAvailable();
  }

  /**
   * Sanitizes a file name by removing potentially hazardous or non-standard characters.
   */
  private sanitizeFileName(fileName: string, allowDash: boolean = true): string {
    const pattern = allowDash ? /[^a-zA-Z0-9._-]/g : /[^a-zA-Z0-9.]/g;
    return fileName.replace(pattern, '_');
  }

  /**
   * Performs a managed file upload through the storage infrastructure.
   * Resolves with the public download URL upon successful completion.
   */
  async uploadFile(file: File, options?: UploadMediaOptions): Promise<string> {
    if (!file || !file.name) {
      throw new Error('Invalid file provided for media upload');
    }

    const folder = options?.folder || 'uploads';
    const safeName = this.sanitizeFileName(file.name, true);
    const fullPath = options?.customPath || `${folder}/${Date.now()}_${safeName}`;

    return await this.storageAdapter.upload(fullPath, file, {
      timeoutMs: options?.timeoutMs,
      onProgress: options?.onProgress,
    });
  }

  /**
   * Uploads admin CMS media assets (covers, logos, portfolio photos) under `uploads/`.
   * Defaults to a 3.5s timeout for fast UI fallback when network conditions are constrained.
   */
  async uploadAdminMedia(file: File, timeoutMs: number = 3500): Promise<string> {
    const safeName = this.sanitizeFileName(file.name, true);
    const customPath = `uploads/${Date.now()}_${safeName}`;
    return this.uploadFile(file, { customPath, timeoutMs });
  }

  /**
   * Uploads customer review photos and wedding selfies under `bride_reviews/`.
   * Reports upload progress back to the submitting modal.
   */
  async uploadReviewPhoto(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const safeName = this.sanitizeFileName(file.name, false);
    const customPath = `bride_reviews/${Date.now()}_${safeName}`;
    return this.uploadFile(file, { customPath, onProgress });
  }

  /**
   * Deletes a media asset from storage by its relative path or full URL.
   */
  async deleteMedia(pathOrUrl: string): Promise<void> {
    if (!pathOrUrl || typeof pathOrUrl !== 'string') {
      throw new Error('Invalid media path or URL provided for deletion');
    }
    await this.storageAdapter.delete(pathOrUrl);
  }
}

export const mediaService = new MediaService();
