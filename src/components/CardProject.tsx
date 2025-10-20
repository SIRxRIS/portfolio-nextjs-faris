"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ArrowRight } from "lucide-react";

interface CardProjectProps {
  Img: string;
  Title: string;
  Description: string;
  Demo?: string;
  id?: string;
}

const CardProject: React.FC<CardProjectProps> = ({
  Img,
  Title,
  Description,
  Demo,
  id
}) => {
  // Mengganti alert() dengan console.error()
  const handleLiveDemo = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!Demo) {
      console.error(`ERROR: Live demo link tidak tersedia untuk proyek: ${Title}`);
      e.preventDefault();
    }
  };

  const handleDetails = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!id) {
      console.error(`ERROR: Project ID tidak tersedia untuk proyek: ${Title}`);
      e.preventDefault();
    }
  };

  // Logika Pemeriksaan src="" untuk mengatasi Console Error
  const isImageValid = Img && Img.trim() !== "";

  return (
    <div className="group relative w-full">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-lg border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-purple-500/25 hover:border-purple-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/10 to-pink-500/5 opacity-50 group-hover:opacity-80 transition-opacity duration-300"></div>

        <div className="relative p-6 z-10">
          <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">

            {/* PENGGUNAAN NEXT/IMAGE YANG BENAR dengan pemeriksaan validitas src */}
            {isImageValid ? (
              <Image
                src={Img}
                alt={Title}
                layout="fill"
                objectFit="cover"
                className="transform group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              // Placeholder jika Img kosong/null/""
              <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                Image Placeholder
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent line-clamp-1">
              {Title}
            </h3>

            <p className="text-gray-300/90 text-sm leading-relaxed line-clamp-3 min-h-[3.75rem]">
              {Description}
            </p>

            <div className="pt-2 flex items-center justify-between gap-3">
              {Demo ? (
                <a
                  href={Demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLiveDemo}
                  className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm font-medium"
                >
                  <span>Live Demo</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <span className="text-gray-500 text-sm">
                  Demo Not Available
                </span>
              )}

              {id ? (
                // PENGGUNAAN NEXT/LINK YANG BENAR untuk navigasi internal
                <Link
                  href={`/project/${id}`}
                  onClick={handleDetails}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm font-medium"
                >
                  <span>Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="text-gray-500 text-sm">
                  Details Not Available
                </span>
              )}
            </div>
          </div>

          <div className="absolute inset-0 border border-white/0 group-hover:border-purple-500/30 rounded-xl transition-colors duration-300 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default CardProject;