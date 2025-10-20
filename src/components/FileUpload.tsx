// src/components/FileUpload.tsx
"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, File } from 'lucide-react';
import { fileUploadUtils } from '@/utils/fileUpload';

interface FileUploadProps {
    onFileSelect: (url: string, fileName: string) => void;
    currentValue?: string;
    label?: string;
    accept?: string;
    maxSize?: number;
    allowedTypes?: string[];
    showPreview?: boolean;
    className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    currentValue = '',
    label = 'Upload Image',
    accept = 'image/*',
    maxSize = 5 * 1024 * 1024,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    showPreview = true,
    className = ''
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentValue);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList) => {
        const file = files[0];
        if (!file) return;

        const validation = fileUploadUtils.validateFile(file, { maxSize, allowedTypes });
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        setUploading(true);
        try {
            const result = await fileUploadUtils.saveToStorage(file, 'uploads');
            if (result.success) {
                setPreview(result.url);
                onFileSelect(result.url, result.fileName);
            } else {
                alert('Upload failed: ' + result.error);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert('Upload failed: ' + errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const openFileSelector = () => {
        fileInputRef.current?.click();
    };

    const removeFile = () => {
        setPreview('');
        onFileSelect('', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label}
            </label>

            <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive
                    ? 'border-blue-400 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                    } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    className="hidden"
                />

                {preview && showPreview ? (
                    <div className="relative">
                        <div className="flex items-center justify-center">
                            {preview.startsWith('data:image') || preview.includes('.jpg') || preview.includes('.png') || preview.includes('.gif') || preview.includes('.webp') ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-w-full max-h-48 rounded-lg object-contain"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-gray-400">
                                    <File className="w-8 h-8" />
                                    <span>File uploaded</span>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={removeFile}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="flex justify-center mb-3">
                            {uploading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            ) : (
                                <Upload className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <p className="text-gray-400 mb-2">
                            {uploading ? 'Uploading...' : 'Drag and drop your file here, or'}
                        </p>
                        <button
                            type="button"
                            onClick={openFileSelector}
                            disabled={uploading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Browse Files
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                            Max size: {(maxSize / 1024 / 1024).toFixed(1)}MB
                        </p>
                    </div>
                )}
            </div>

            <div className="text-center text-gray-400 text-sm">
                <span>or</span>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image URL
                </label>
                <input
                    type="url"
                    value={currentValue && !currentValue.startsWith('data:') ? currentValue : ''}
                    onChange={(e) => {
                        const url = e.target.value;
                        setPreview(url);
                        onFileSelect(url, '');
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
            </div>
        </div>
    );
};

export default FileUpload;