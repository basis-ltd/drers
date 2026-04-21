import { useCallback, useRef, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { selectAccessToken } from '@/features/auth/model/selectors';
import type { DocumentType } from '../api/types';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080/api/v1';
const CLOUDINARY_PROGRESS_CAP = 95;

export type DocumentUploadPhase = 'uploading' | 'registering' | null;

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  url?: string;
  public_id: string;
  bytes: number;
  format?: string;
  resource_type?: string;
}

interface UploadState {
  progress: number;
  phase: DocumentUploadPhase;
  isUploading: boolean;
  isComplete: boolean;
  error: string | null;
}

const initialState: UploadState = {
  progress: 0,
  phase: null,
  isUploading: false,
  isComplete: false,
  error: null,
};

export interface UploadDocumentPayload {
  applicationId: string;
  documentType: DocumentType;
  isRequired: boolean;
  file: File;
}

const useDocumentUpload = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const [state, setState] = useState<UploadState>(initialState);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers.authorization = `Bearer ${accessToken}`;
    }
    return headers;
  }, [accessToken]);

  const fetchSignature = useCallback(
    async (applicationId: string): Promise<UploadSignature> => {
      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/documents/sign`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        let message = 'Failed to get upload signature.';
        try {
          const body = (await response.json()) as { message?: string };
          message = body.message ?? message;
        } catch {
          // keep default
        }
        throw new Error(message);
      }

      return (await response.json()) as UploadSignature;
    },
    [getAuthHeaders],
  );

  const uploadToCloudinary = useCallback(
    (file: File, signature: UploadSignature): Promise<CloudinaryUploadResponse> =>
      new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable || event.total <= 0) return;
          const ratio = event.loaded / event.total;
          const cappedProgress = Math.round(ratio * CLOUDINARY_PROGRESS_CAP);
          setState((prev) => ({
            ...prev,
            progress: Math.min(cappedProgress, CLOUDINARY_PROGRESS_CAP),
          }));
        };

        xhr.onload = () => {
          xhrRef.current = null;

          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText) as CloudinaryUploadResponse);
            } catch {
              reject(new Error('Invalid response from Cloudinary.'));
            }
            return;
          }

          let message = 'Upload to Cloudinary failed.';
          try {
            const body = JSON.parse(xhr.responseText) as { error?: { message?: string } };
            message = body.error?.message ?? message;
          } catch {
            // keep default
          }
          reject(new Error(message));
        };

        xhr.onerror = () => {
          xhrRef.current = null;
          reject(new Error('Network error during upload.'));
        };

        xhr.onabort = () => {
          xhrRef.current = null;
          reject(new Error('Upload aborted.'));
        };

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', signature.apiKey);
        formData.append('timestamp', String(signature.timestamp));
        formData.append('signature', signature.signature);
        formData.append('folder', signature.folder);

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`);
        xhr.send(formData);
      }),
    [],
  );

  const registerWithBackend = useCallback(
    async (
      payload: UploadDocumentPayload,
      cloudinaryResult: CloudinaryUploadResponse,
    ): Promise<unknown> => {
      const response = await fetch(
        `${API_BASE_URL}/applications/${payload.applicationId}/documents/register`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            documentType: payload.documentType,
            isRequired: payload.isRequired,
            originalFilename: payload.file.name,
            mimeType: payload.file.type || undefined,
            publicId: cloudinaryResult.public_id,
            secureUrl: cloudinaryResult.secure_url,
            url: cloudinaryResult.url,
            resourceType: cloudinaryResult.resource_type,
            format:
              cloudinaryResult.format ||
              payload.file.name.split('.').pop()?.toLowerCase() ||
              'unknown',
            fileSizeBytes: cloudinaryResult.bytes || payload.file.size,
          }),
        },
      );

      if (!response.ok) {
        let message = 'File uploaded but could not be saved.';
        try {
          const body = (await response.json()) as { message?: string };
          message = body.message ?? message;
        } catch {
          // keep default
        }
        throw new Error(message);
      }

      return response.json();
    },
    [getAuthHeaders],
  );

  const uploadDocument = useCallback(
    async (payload: UploadDocumentPayload): Promise<unknown> => {
      setState({
        progress: 0,
        phase: 'uploading',
        isUploading: true,
        isComplete: false,
        error: null,
      });

      try {
        const signature = await fetchSignature(payload.applicationId);
        const cloudinaryResult = await uploadToCloudinary(payload.file, signature);

        setState((prev) => ({
          ...prev,
          phase: 'registering',
          progress: CLOUDINARY_PROGRESS_CAP,
        }));

        const result = await registerWithBackend(payload, cloudinaryResult);
        setState({
          progress: 100,
          phase: null,
          isUploading: false,
          isComplete: true,
          error: null,
        });
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed.';
        setState((prev) => ({
          ...prev,
          phase: null,
          isUploading: false,
          isComplete: false,
          error: message,
        }));
        throw error;
      }
    },
    [fetchSignature, registerWithBackend, uploadToCloudinary],
  );

  const abort = useCallback(() => {
    xhrRef.current?.abort();
    setState(initialState);
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    uploadDocument,
    abort,
    reset,
    progress: state.progress,
    phase: state.phase,
    isUploading: state.isUploading,
    isComplete: state.isComplete,
    error: state.error,
  };
};

export default useDocumentUpload;
