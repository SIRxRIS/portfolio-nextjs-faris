// src/utils/fileUpload.ts

// Definisikan tipe untuk hasil validasi
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Definisikan tipe untuk opsi validasi
export interface ValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
}

// Definisikan tipe untuk hasil upload
export interface UploadResult {
  success: boolean;
  url: string;
  fileName: string;
  metadata?: {
    contentType?: string;
    cacheControl?: string | null;
  };
  localPath?: string;
  error?: string;
}

export const fileUploadUtils = {
  // Validate file type and size
  validateFile: (
    file: File | null | undefined,
    options: ValidationOptions = {}
  ): ValidationResult => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ],
    } = options;

    if (!file) {
      return { valid: false, error: "No file selected" };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(
          ", "
        )}`,
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size too large. Maximum size: ${(
          maxSize /
          1024 /
          1024
        ).toFixed(1)}MB`,
      };
    }

    return { valid: true };
  },

  // Upload via API route to Firebase Storage (atau layanan sejenis)
  saveToStorage: async (
    file: File,
    directory = "uploads"
  ): Promise<UploadResult> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", directory);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const errorMessage =
          errorBody?.error ?? `Upload failed with status ${response.status}`;
        return {
          success: false,
          url: "",
          fileName: "",
          error: errorMessage,
        };
      }

      const result = (await response.json()) as UploadResult;

      if (!result.success) {
        return {
          success: false,
          url: "",
          fileName: "",
          error: result.error ?? "Unknown upload error",
        };
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        url: "",
        fileName: "",
        error: errorMessage,
      };
    }
  },
};
