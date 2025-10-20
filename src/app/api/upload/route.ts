// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { storage, ref, uploadBytes, getDownloadURL } from "@/lib/firebaseAdmin";
import type { UploadMetadata } from "@/lib/firebaseAdmin";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    (process.env.FIREBASE_STORAGE_BUCKET ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
);

function generateFileName(originalName: string, prefix = "uploads") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const extension = originalName.split(".").pop() ?? "dat";
  return `${prefix}/${timestamp}_${random}.${extension}`;
}

function resolveDirectory(directory?: string | null) {
  if (!directory) return "uploads";
  return directory.replace(/\\+/g, "/").replace(/^\/+|\/+$|\.\//g, "");
}

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured) {
      return NextResponse.json(
        { success: false, error: "Firebase belum dikonfigurasi." },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type");
    const isFormData = contentType?.startsWith("multipart/form-data");

    if (!isFormData) {
      return NextResponse.json(
        { success: false, error: "Request harus berupa form-data." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "File tidak ditemukan." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Tipe file tidak diizinkan." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "Ukuran file terlalu besar (maks 5MB)." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = generateFileName(file.name);
    const metadata: UploadMetadata = {
      contentType: file.type,
      cacheControl: "public,max-age=31536000",
    };

    console.log("Resolved storage bucket:", {
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      nextPublicStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    const bucketInstance = storage.bucket();
    const [bucketExists] = await bucketInstance.exists();
    console.log("Bucket existence check:", {
      bucketName: bucketInstance.name,
      bucketExists,
    });

    if (!bucketExists) {
      return NextResponse.json(
        {
          success: false,
          error: `Bucket ${bucketInstance.name} belum tersedia. Aktifkan Cloud Storage di Firebase console dan coba lagi.`,
        },
        { status: 500 }
      );
    }

    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, buffer, metadata);
    const downloadUrl = await getDownloadURL(storageRef);

    return NextResponse.json({
      success: true,
      url: downloadUrl,
      fileName,
      metadata: {
        contentType: metadata.contentType,
        cacheControl: metadata.cacheControl,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Gagal mengunggah file.",
      },
      { status: 500 }
    );
  }
}
