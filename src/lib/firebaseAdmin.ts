// src/lib/firebaseAdmin.ts

// Import Firebase Admin SDK
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
// Hapus import type { SaveOptions } dari @google-cloud/storage karena kita menggunakan interface custom di bawah
// import type { SaveOptions } from "@google-cloud/storage";

// --- DEFINISI TIPE (Menggantikan impor tipe yang bermasalah) ---
// Ini adalah satu-satunya definisi untuk UploadMetadata
export interface UploadMetadata {
  contentType?: string;
  cacheControl?: string;
  customTime?: string;
  // Memungkinkan metadata kustom lainnya
  [key: string]: string | undefined;
}

// --- INISIALISASI ADMIN SDK ---
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!getApps().length) {
  if (!serviceAccountKey) {
    console.error(
      "FIREBASE_SERVICE_ACCOUNT_KEY tidak ditemukan. Admin SDK tidak dapat diinisialisasi."
    );
  } else {
    const serviceAccount = JSON.parse(serviceAccountKey);

    // Inisialisasi Admin SDK
    initializeApp({
      credential: cert(serviceAccount),
      storageBucket:
        process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }
}

// Dapatkan instance storage
export const storage = getStorage();

// --- FUNGSI WRAPPER (Pembantu) ---

/**
 * Mendapatkan referensi file di GCS.
 * @param storageInstance - Objek Storage (storage)
 * @param path - Path file
 */
function adminRef(storageInstance: Storage, path: string) {
  // Kita mendapatkan bucket default
  const bucket = storageInstance.bucket();
  // Kemudian kita mendapatkan referensi file dari bucket tersebut
  return bucket.file(path);
}

/**
 * Mengunggah buffer ke GCS.
 * @param fileRef - Objek File yang didapat dari adminRef
 * @param buffer - Buffer data yang akan diunggah
 * @param metadata - Metadata (menggunakan interface custom UploadMetadata)
 */
async function adminUploadBytes(
  fileRef: ReturnType<typeof adminRef>,
  buffer: Buffer,
  // PERBAIKAN: Gunakan tipe data 'UploadMetadata' yang baru saja kita definisikan.
  metadata: UploadMetadata
) {
  // Upload menggunakan metode save() dari objek File
  await fileRef.save(buffer, { metadata });
}

/**
 * Mendapatkan Download URL.
 */
async function adminGetDownloadURL(
  fileRef: ReturnType<typeof adminRef>
): Promise<string> {
  const [url] = await fileRef.getSignedUrl({
    action: "read",
    expires: "03-01-2500", // URL yang sangat panjang
  });
  return url;
}

// --- EXPORT AKHIR ---

// Export ulang dengan nama yang familiar
export const ref = adminRef;
export const uploadBytes = adminUploadBytes;
export const getDownloadURL = adminGetDownloadURL;

// HAPUS BARIS INI: export type UploadMetadata = AdminUploadMetadata;
// Karena 'UploadMetadata' sudah diekspor sebagai interface di awal file.
