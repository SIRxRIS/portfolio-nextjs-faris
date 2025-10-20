// src/components/Certificate.tsx
"use client";

import React, { useState } from "react";
import { X, Maximize, FileText, Download } from "lucide-react";

import { CertificateData } from "@/types";

interface CertificateProps {
  certificate: CertificateData;
}

const Certificate: React.FC<CertificateProps> = ({ certificate }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const openPdfInNewTab = () => {
    window.open(certificate.img, "_blank");
  };

  const downloadPdf = () => {
    const link = document.createElement("a");
    link.href = certificate.img;
    link.download = `${certificate.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full">
      {/* Certificate Card */}
      <div
        className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 cursor-pointer hover:-translate-y-1 hover:shadow-purple-500/30 group"
        onClick={handleOpen}
      >
        {/* Certificate Content */}
        <div className="p-6 text-center min-h-[200px] flex flex-col justify-center items-center relative">
          {/* PDF Icon */}
          <FileText
            className="text-red-400 mb-4 drop-shadow-md"
            size={48}
          />

          {/* Certificate Title */}
          <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
            {certificate.title}
          </h3>

          {/* Issuer */}
          <p className="text-purple-300 mb-2 font-medium text-sm">
            {certificate.issuer}
          </p>

          {/* Year and Category */}
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded text-xs">
              {certificate.year}
            </span>
            <span className="bg-blue-500/20 text-blue-200 px-2 py-1 rounded text-xs">
              {certificate.category}
            </span>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-10">
          {/* Hover Content */}
          <div className="text-center text-white transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
            <Maximize className="mx-auto mb-2 drop-shadow-md" size={40} />
            <h4 className="text-lg font-semibold drop-shadow-md">
              Lihat Sertifikat
            </h4>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 rounded-lg border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-2 top-2 z-10 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            {/* Modal Content */}
            <div className="p-6 text-center">
              {/* Certificate Info */}
              <FileText className="mx-auto text-red-400 mb-4" size={64} />

              <h2 className="text-2xl font-semibold text-white mb-2">
                {certificate.title}
              </h2>

              <p className="text-purple-300 mb-4 font-medium text-lg">
                {certificate.issuer}
              </p>

              <p className="text-slate-400 mb-6 leading-relaxed">
                {certificate.description}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={downloadPdf}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center gap-2"
                >
                  <Download size={20} />
                  Download PDF
                </button>
                <button
                  onClick={openPdfInNewTab}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center gap-2"
                >
                  <Maximize size={20} />
                  Lihat Fullscreen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificate;