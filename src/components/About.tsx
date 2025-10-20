"use client";

import React, { useEffect, memo, useMemo, useState } from "react";
import {
  FileText,
  Code,
  Award,
  Globe,
  ArrowUpRight,
  Sparkles,
  LucideIcon,
} from "lucide-react";
import { projectsData, certificatesData } from "@/utils/staticData";
import { certificatesService, projectsService } from "@/services/firebaseService";

const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

const calculateExperience = () => {
  const startDate = new Date("2023-10-06");
  const today = new Date();
  const hasReachedAnniversary =
    today >=
    new Date(today.getFullYear(), startDate.getMonth(), startDate.getDate());

  const experience =
    today.getFullYear() - startDate.getFullYear() - (hasReachedAnniversary ? 0 : 1);

  return experience < 0 ? 0 : experience;
};

type ProjectLike = {
  id?: string | number;
  Title?: string;
};

type CertificateLike = {
  id?: string | number;
  title?: string;
};

const mergeUniqueEntries = <T extends Record<string, unknown>>(
  primaryData: T[],
  secondaryData: T[],
  keySelector: (item: T) => string
): T[] => {
  const seen = new Map<string, T>();

  primaryData.forEach((item) => {
    const key = keySelector(item);
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  });

  secondaryData.forEach((item) => {
    const key = keySelector(item);
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  });

  return Array.from(seen.values());
};

const getProjectKey = (project: ProjectLike) => {
  if (project.id !== undefined && project.id !== null) {
    return String(project.id);
  }

  if (typeof project.Title === "string" && project.Title.trim().length) {
    return project.Title.toLowerCase();
  }

  return JSON.stringify(project);
};

const getCertificateKey = (certificate: CertificateLike) => {
  if (certificate.id !== undefined && certificate.id !== null) {
    return String(certificate.id);
  }

  if (typeof certificate.title === "string" && certificate.title.trim().length) {
    return certificate.title.toLowerCase();
  }

  return JSON.stringify(certificate);
};

const defaultProjects = projectsData as ProjectLike[];
const defaultCertificates = certificatesData as CertificateLike[];

// Memoized Components
const Header = memo(() => (
  <div className="text-center lg:mb-8 mb-2 px-[5%]">
    <div className="inline-block relative group">
      <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
        About Me
      </h2>
    </div>
    <p className="mt-2 text-gray-400 max-w-2xl mx-auto text-base sm:text-lg flex items-center justify-center gap-2">
      <Sparkles className="w-5 h-5 text-purple-400" />
      Mengubah ide menjadi pengalaman digital
      <Sparkles className="w-5 h-5 text-purple-400" />
    </p>
  </div>
));

Header.displayName = "Header";

interface ProfileImageProps {
  profilePhoto: string;
}

const ProfileImage = memo<ProfileImageProps>(({ profilePhoto }) => (
  <div className="flex justify-end items-center sm:p-12 sm:py-0 sm:pb-0 p-0 py-2 pb-2">
    <div className="relative group">
      {/* Optimized gradient backgrounds with reduced complexity for mobile */}
      <div className="absolute -inset-6 opacity-[25%] z-0 hidden sm:block">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 rounded-full blur-2xl animate-spin-slower" />
        <div className="absolute inset-0 bg-gradient-to-l from-fuchsia-500 via-rose-500 to-pink-600 rounded-full blur-2xl animate-pulse-slow opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600 via-cyan-500 to-teal-400 rounded-full blur-2xl animate-float opacity-50" />
      </div>
      <div className="relative">
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-[0_0_40px_rgba(120,119,198,0.3)] transform transition-all duration-700 group-hover:scale-105">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full z-20 transition-all duration-700 group-hover:border-white/40 group-hover:scale-105" />

          {/* Optimized overlay effects - disabled on mobile */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10 transition-opacity duration-700 group-hover:opacity-0 hidden sm:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-blue-500/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden sm:block" />

          <img
            src={profilePhoto}
            alt="Profile"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
            loading="lazy"
          />

          {/* Advanced hover effects - desktop only */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 z-20 hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/10 to-transparent transform translate-y-full group-hover:-translate-y-full transition-transform duration-1000 delay-100" />
            <div className="absolute inset-0 rounded-full border-8 border-white/10 scale-0 group-hover:scale-100 transition-transform duration-700 animate-pulse-slow" />
          </div>
        </div>
      </div>
    </div>
  </div>
));

ProfileImage.displayName = "ProfileImage";

interface StatCardProps {
  icon: LucideIcon;
  color: string;
  value: number;
  label: string;
  description: string;
}

const StatCard = memo<StatCardProps>(({ icon: Icon, color, value, label, description }) => (
  <div className="relative group">
    <div className="relative z-10 bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl h-full flex flex-col justify-between">
      <div
        className={`absolute -z-10 inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
      ></div>

      <div className="flex items-center justify-between mb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 transition-transform group-hover:rotate-6">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <span className="text-4xl font-bold text-white">{value}</span>
      </div>

      <div>
        <p className="text-sm uppercase tracking-wider text-gray-300 mb-2">
          {label}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">{description}</p>
          <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  </div>
));

StatCard.displayName = "StatCard";

const AboutPage = () => {
  const [profilePhoto, setProfilePhoto] = useState("/Photo.png");
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(() => ({
    totalProjects: defaultProjects.length,
    totalCertificates: defaultCertificates.length,
    yearsExperience: calculateExperience(),
  }));
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const savedPhoto = localStorage.getItem("profilePhoto");
    if (savedPhoto) {
      setProfilePhoto(savedPhoto);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    try {
      const storedProjects = JSON.parse(localStorage.getItem("projects") || "[]");
      const storedCertificates = JSON.parse(
        localStorage.getItem("certificates") || "[]"
      );

      const combinedProjects = mergeUniqueEntries(
        Array.isArray(storedProjects) ? storedProjects : [],
        defaultProjects,
        getProjectKey
      );

      const combinedCertificates = mergeUniqueEntries(
        Array.isArray(storedCertificates) ? storedCertificates : [],
        defaultCertificates,
        getCertificateKey
      );

      localStorage.setItem("projects", JSON.stringify(combinedProjects));
      localStorage.setItem("certificates", JSON.stringify(combinedCertificates));

      setStats((prev) => ({
        ...prev,
        totalProjects: combinedProjects.length,
        totalCertificates: combinedCertificates.length,
      }));
    } catch (error) {
      console.error("Failed to load local statistics:", error);
      setStats((prev) => ({
        ...prev,
        totalProjects: projectsData.length,
        totalCertificates: certificatesData.length,
      }));
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !isFirebaseConfigured) return;

    let isCancelled = false;

    const fetchFirebaseStats = async () => {
      setIsLoadingStats(true);
      setFirebaseError(null);

      try {
        const [projectsResult, certificatesResult] = await Promise.all([
          projectsService.getAllProjects(),
          certificatesService.getAllCertificates(),
        ]);

        if (isCancelled) return;

        let updatedProjects: number | null = null;
        let updatedCertificates: number | null = null;
        const errorMessages: string[] = [];

        if (projectsResult.success && projectsResult.data) {
          const mergedProjects = mergeUniqueEntries(
            projectsResult.data,
            defaultProjects,
            getProjectKey
          );
          updatedProjects = mergedProjects.length;
          localStorage.setItem("projects", JSON.stringify(mergedProjects));
        } else if (!projectsResult.success && projectsResult.error) {
          errorMessages.push(projectsResult.error);
        }

        if (certificatesResult.success && certificatesResult.data) {
          const mergedCertificates = mergeUniqueEntries(
            certificatesResult.data,
            defaultCertificates,
            getCertificateKey
          );
          updatedCertificates = mergedCertificates.length;
          localStorage.setItem("certificates", JSON.stringify(mergedCertificates));
        } else if (!certificatesResult.success && certificatesResult.error) {
          errorMessages.push(certificatesResult.error);
        }

        if (updatedProjects !== null || updatedCertificates !== null) {
          setStats((prev) => ({
            ...prev,
            totalProjects:
              updatedProjects !== null ? updatedProjects : prev.totalProjects,
            totalCertificates:
              updatedCertificates !== null
                ? updatedCertificates
                : prev.totalCertificates,
          }));
        }

        if (errorMessages.length) {
          setFirebaseError(errorMessages.join(". "));
        }
      } catch (error) {
        if (isCancelled) return;

        console.error("Failed to fetch statistics from Firebase:", error);
        setFirebaseError(
          error instanceof Error
            ? error.message
            : "Tidak dapat memuat data dari Firebase."
        );
      } finally {
        if (!isCancelled) {
          setIsLoadingStats(false);
        }
      }
    };

    fetchFirebaseStats();

    return () => {
      isCancelled = true;
    };
  }, [mounted, isFirebaseConfigured]);

  interface StatsData {
    icon: LucideIcon;
    color: string;
    value: number;
    label: string;
    description: string;
  }

  const statsData: StatsData[] = useMemo(
    () => [
      {
        icon: Code,
        color: "from-[#6366f1] to-[#a855f7]",
        value: stats.totalProjects,
        label: "Total Projects",
        description: "Innovative web solutions crafted",
      },
      {
        icon: Award,
        color: "from-[#a855f7] to-[#6366f1]",
        value: stats.totalCertificates,
        label: "Certificates",
        description: "Professional skills validated",
      },
      {
        icon: Globe,
        color: "from-[#6366f1] to-[#a855f7]",
        value: stats.yearsExperience,
        label: "Years of Experience",
        description: "Continuous learning journey",
      },
    ],
    [stats.totalProjects, stats.totalCertificates, stats.yearsExperience]
  );

  if (!mounted) return null;

  return (
    <div
      className="h-auto pb-[10%] text-white overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%] mt-10 sm-mt-0"
      id="About"
    >
      <Header />

      <div className="w-full mx-auto pt-8 sm:pt-12 relative">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                Hello, I&apos;m
              </span>
              <span className="block mt-2 text-gray-200">
                Faris Hazim Supriyadi
              </span>
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed text-justify pb-4 sm:pb-0">
              Saya adalah seorang pelajar SMK Telkom Makassar jurusan Rekayasa
              Perangkat Lunak yang antusias di bidang pengembangan web. Saya
              telah mengerjakan beberapa proyek menggunakan Next.js, Tailwind
              CSS, dan Supabase sebagai bagian dari proses belajar dan
              pengembangan diri. Saya terus berusaha mengasah kemampuan teknis
              serta membangun portofolio untuk masa depan.
            </p>

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:gap-4 lg:px-0 w-full">
              <a
                href="https://drive.google.com/uc?export=download&id=16vQFc_-F-C--4A73z-Z3_CbJsLwTu8dv"
                className="w-full lg:w-auto"
              >
                <button className="w-full lg:w-auto sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center lg:justify-start gap-2 shadow-lg hover:shadow-xl animate-bounce-slow">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Download CV
                </button>
              </a>
              <a href="#Portofolio" className="w-full lg:w-auto">
                <button className="w-full lg:w-auto sm:px-6 py-2 sm:py-3 rounded-lg border border-[#a855f7]/50 text-[#a855f7] font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center lg:justify-start gap-2 hover:bg-[#a855f7]/10 animate-bounce-slow delay-200">
                  <Code className="w-4 h-4 sm:w-5 sm:h-5" /> View Projects
                </button>
              </a>
            </div>
          </div>

          <ProfileImage profilePhoto={profilePhoto} />
        </div>

        <a href="#Portofolio">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 cursor-pointer">
            {statsData.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </a>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes spin-slower {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s infinite;
        }
        .animate-spin-slower {
          animation: spin-slower 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default memo(AboutPage);
