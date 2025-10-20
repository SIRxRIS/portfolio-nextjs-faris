// src/components/Portfolio.tsx
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CardProject from "@/components/CardProject";
import TechStackIcon from "@/components/TechStackIcon";
import AOS from "aos";
import "aos/dist/aos.css";
import CertificateCard from "@/components/Certificate";
import { Code, Award, Boxes, Settings } from "lucide-react";
import { projectsData, certificatesData } from "@/utils/staticData";
import {
  projectsService,
  certificatesService,
} from "@/services/firebaseService";
import AdminPanel from "@/components/AdminPanel";
import { ProjectForm, CertificateForm } from "@/components/AdminForms";

// ToggleButton Component
const ToggleButton = ({ onClick, isShowingMore }: { onClick: () => void; isShowingMore: boolean }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 text-slate-300 hover:text-white text-sm font-medium transition-all duration-300 ease-in-out flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 hover:border-white/20 backdrop-blur-sm group relative overflow-hidden"
  >
    <span className="relative z-10 flex items-center gap-2">
      {isShowingMore ? "Lihat Lebih Sedikit" : "Lihat Lebih Banyak"}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-300 ${isShowingMore
          ? "group-hover:-translate-y-0.5"
          : "group-hover:translate-y-0.5"
          }`}
      >
        <polyline points={isShowingMore ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
      </svg>
    </span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500/50 transition-all duration-300 group-hover:w-full" />
  </button>
);

// TabPanel Component
function TabPanel({
  children,
  value,
  index,
  ...other
}: {
  children: React.ReactNode;
  value: number;
  index: number;
  [key: string]: unknown;
}) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

const techStacks = [
  { icon: "html.svg", language: "HTML" },
  { icon: "css.svg", language: "CSS" },
  { icon: "javascript.svg", language: "JavaScript" },
  { icon: "tailwind.svg", language: "Tailwind CSS" },
  { icon: "reactjs.svg", language: "ReactJS" },
  { icon: "Supabase-Dark.svg", language: "Supabase" },
  { icon: "nodejs.svg", language: "Node JS" },
  { icon: "bootstrap.svg", language: "Bootstrap" },
  { icon: "NextJS-Dark.svg", language: "Next.js" },
  { icon: "shadcnui.svg", language: "ShadCN UI" },
  { icon: "vercel.svg", language: "Vercel" },
  { icon: "SweetAlert.svg", language: "SweetAlert2" },
];

import { Project, Certificate } from "@/types";

interface SwiperRefType {
  activeIndex: number;
  slideTo: (index: number) => void;
}

interface DataCounts {
  totalProjects: number;
  totalCertificates: number;
  firestoreProjects: number;
  firestoreCertificates: number;
  localProjects: number;
  localCertificates: number;
}

export default function Portfolio() {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const swiperRef = useRef<SwiperRefType>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [dataCounts, setDataCounts] = useState<DataCounts | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showCertificateForm, setShowCertificateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const initialItems = isMobile ? 4 : 6;

  // Handle hydration
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const [firestoreData, localData] = await Promise.all([
        Promise.all([
          projectsService.getAllProjects(),
          certificatesService.getAllCertificates(),
        ]).catch((error) => {
          console.error("Error loading from Firestore:", error);
          return [{ success: false, data: [] }, { success: false, data: [] }];
        }),
        Promise.resolve({
          projects: projectsData.map((project: Record<string, unknown>) => ({
            ...project,
            TechStack: project.TechStack || [],
            Features: project.Features || [],
            id: project.id || String(Date.now()),
          })) as Project[],
          certificates: certificatesData.map((cert: Record<string, unknown>) => ({
            id: cert.id || String(Date.now()),
            title: cert.Title || cert.title,
            issuer: cert.issuer,
            year: cert.year || String(new Date().getFullYear()),
            category: cert.category,
            description: cert.description,
            img: cert.img || cert.image || '',
            image: cert.image || cert.img || '',
            type: cert.type || 'achievement',
            skills: cert.skills || [],
            credentialUrl: cert.credentialUrl,
          })) as unknown as Certificate[],
        }),
      ]);

      const [projectsResult, certificatesResult] = firestoreData;

      let combinedProjects: Project[] = [...localData.projects];
      let combinedCertificates: Certificate[] = [...localData.certificates];

      let firestoreProjectCount = 0;
      let firestoreCertificateCount = 0;

      if (projectsResult.success) {
        const firestoreProjects = (projectsResult.data as Project[]).map((project) => ({
          ...project,
          TechStack: project.TechStack || [],
          Features: project.Features || [],
        }));
        firestoreProjectCount = firestoreProjects.length;
        combinedProjects = [...firestoreProjects, ...combinedProjects];
      }

      if (certificatesResult.success) {
        const firestoreCertificates = (certificatesResult.data || []).map((cert: Record<string, unknown>) => ({
          id: cert.id || String(Date.now()),
          title: cert.Title || cert.title,
          issuer: cert.issuer,
          year: cert.year || String(new Date().getFullYear()),
          category: cert.category,
          description: cert.description,
          img: cert.img || cert.image || '',
          image: cert.image || cert.img || '',
          type: cert.type || 'achievement',
          skills: cert.skills || [],
          credentialUrl: cert.credentialUrl,
        })) as unknown as Certificate[];
        firestoreCertificateCount = firestoreCertificates.length;
        combinedCertificates = [
          ...firestoreCertificates,
          ...combinedCertificates,
        ];
      }

      const uniqueProjects = Array.from(
        new Map(
          combinedProjects.map((project) => [project.id || project.Title, project])
        ).values()
      );

      const uniqueCertificates = Array.from(
        new Map(
          combinedCertificates.map((cert) => [cert.id || cert.title, cert])
        ).values()
      );

      setProjects(uniqueProjects);
      setCertificates(uniqueCertificates);

      const counts: DataCounts = {
        totalProjects: uniqueProjects.length,
        totalCertificates: uniqueCertificates.length,
        firestoreProjects: firestoreProjectCount,
        firestoreCertificates: firestoreCertificateCount,
        localProjects: localData.projects.length,
        localCertificates: localData.certificates.length,
      };

      setDataCounts(counts);

      console.log("Data loaded successfully:", counts);
    } catch (error) {
      console.error("Error loading data:", error);
      const fallbackProjects = projectsData.map((project: Record<string, unknown>) => ({
        ...project,
        TechStack: project.TechStack || [],
        Features: project.Features || [],
        id: project.id || String(Date.now()),
      })) as Project[];
      const fallbackCertificates = certificatesData.map((cert: Record<string, unknown>) => ({
        id: cert.id || String(Date.now()),
        title: cert.Title || cert.title,
        issuer: cert.issuer,
        year: cert.year || String(new Date().getFullYear()),
        category: cert.category,
        description: cert.description,
        img: cert.img || cert.image || '',
        image: cert.image || cert.img || '',
        type: cert.type || 'achievement',
        skills: cert.skills || [],
        credentialUrl: cert.credentialUrl,
      })) as unknown as Certificate[];

      setProjects(fallbackProjects);
      setCertificates(fallbackCertificates);
      setDataCounts({
        totalProjects: fallbackProjects.length,
        totalCertificates: fallbackCertificates.length,
        firestoreProjects: 0,
        firestoreCertificates: 0,
        localProjects: fallbackProjects.length,
        localCertificates: fallbackCertificates.length,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.activeIndex !== value) {
      swiperRef.current.slideTo(value);
    }
  }, [value]);

  const toggleShowMore = useCallback((type: "projects" | "certificates") => {
    if (type === "projects") {
      setShowAllProjects((prev) => !prev);
    } else {
      setShowAllCertificates((prev) => !prev);
    }
  }, []);

  const displayedProjects = showAllProjects ? projects : projects.slice(0, initialItems);
  const displayedCertificates = showAllCertificates ? certificates : certificates.slice(0, initialItems);

  const handleAdminSave = () => {
    setShowProjectForm(false);
    setShowCertificateForm(false);
    setEditingProject(null);
    setEditingCertificate(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-white">Loading Portfolio...</h2>
          <p className="text-slate-400">Memuat data proyek dan sertifikat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="md:px-[10%] px-[5%] w-full sm:mt-0 mt-[3rem] bg-[#030014] overflow-hidden" id="Portofolio">
      {/* Header */}
      <div className="text-center pb-10" data-aos="fade-up" data-aos-duration="1000">
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setShowAdminPanel(true)}
            className="px-4 py-2 bg-blue-600/20 text-blue-300 border border-blue-600/30 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-blue-600/30 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Admin Panel
          </button>
        </div>
      </div>

      <Box sx={{ width: "100%" }}>
        {/* Tabs */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)",
              backdropFilter: "blur(10px)",
              zIndex: 0,
            },
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            variant="fullWidth"
            sx={{
              minHeight: "70px",
              "& .MuiTab-root": {
                fontSize: { xs: "0.9rem", md: "1rem" },
                fontWeight: "600",
                color: "#94a3b8",
                textTransform: "none",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                padding: "20px 0",
                zIndex: 1,
                margin: "8px",
                borderRadius: "12px",
                "&:hover": {
                  color: "#ffffff",
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  transform: "translateY(-2px)",
                },
                "&.Mui-selected": {
                  color: "#fff",
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))",
                  boxShadow: "0 4px 15px -3px rgba(139, 92, 246, 0.2)",
                },
              },
              "& .MuiTabs-indicator": { height: 0 },
              "& .MuiTabs-flexContainer": { gap: "8px" },
            }}
          >
            <Tab icon={<Code className="mb-2 w-5 h-5" />} label="Proyek" {...a11yProps(0)} />
            <Tab icon={<Award className="mb-2 w-5 h-5" />} label="Sertifikat" {...a11yProps(1)} />
            <Tab icon={<Boxes className="mb-2 w-5 h-5" />} label="Tech Stack" {...a11yProps(2)} />
          </Tabs>
        </AppBar>

        {/* Swiper */}
        <Swiper
          modules={[Pagination, A11y]}
          onSlideChange={(swiper) => setValue(swiper.activeIndex)}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          initialSlide={value}
          pagination={{ clickable: true }}
          style={{
            direction: theme.direction === "rtl" ? "rtl" : "ltr",
            marginTop: "24px",
          }}
        >
          {/* Projects Slide */}
          <SwiperSlide>
            <div className="overflow-hidden pb-[5%]">
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 lg:gap-8 gap-5">
                  {displayedProjects.map((project, index) => (
                    <div
                      key={project.id || index}
                      data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                      data-aos-duration={index % 3 === 0 ? "1000" : index % 3 === 1 ? "1200" : "1000"}
                    >
                      <CardProject
                        Img={project.Img}
                        Title={project.Title}
                        Description={project.Description}
                        Demo={project.Demo}
                        id={project.id}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📁</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Proyek</h3>
                  <p className="text-slate-400">Proyek-proyek baru akan segera ditambahkan.</p>
                </div>
              )}
            </div>
            {projects.length > initialItems && (
              <div className="mt-6 w-full flex justify-start">
                <ToggleButton onClick={() => toggleShowMore("projects")} isShowingMore={showAllProjects} />
              </div>
            )}
          </SwiperSlide>

          {/* Certificates Slide */}
          <SwiperSlide>
            <div className="overflow-hidden pb-[5%]">
              {certificates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 gap-5">
                  {displayedCertificates.map((certificate, index) => (
                    <div
                      key={certificate.id || index}
                      data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                      data-aos-duration={index % 3 === 0 ? "1000" : index % 3 === 1 ? "1200" : "1000"}
                    >
                      <CertificateCard certificate={certificate} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Sertifikat</h3>
                  <p className="text-slate-400">Sertifikat-sertifikat baru akan segera ditambahkan.</p>
                </div>
              )}
            </div>
            {certificates.length > initialItems && (
              <div className="mt-6 w-full flex justify-start">
                <ToggleButton onClick={() => toggleShowMore("certificates")} isShowingMore={showAllCertificates} />
              </div>
            )}
          </SwiperSlide>

          {/* Tech Stack Slide */}
          <SwiperSlide>
            <div className="overflow-hidden pb-[5%]">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-8 gap-5">
                {techStacks.map((stack, index) => (
                  <div
                    key={index}
                    data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                    data-aos-duration={index % 3 === 0 ? "1000" : index % 3 === 1 ? "1200" : "1000"}
                  >
                    <TechStackIcon TechStackIcon={stack.icon} Language={stack.language} />
                  </div>
                ))}
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </Box>

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel
          onClose={() => setShowAdminPanel(false)}
          onOpenProjectForm={(project) => {
            setEditingProject(project || null);
            setShowProjectForm(true);
          }}
          onOpenCertificateForm={(certificate) => {
            setEditingCertificate(certificate || null);
            setShowCertificateForm(true);
          }}
        />
      )}

      {/* Project Form */}
      {showProjectForm && (
        <ProjectForm
          project={editingProject}
          onSave={handleAdminSave}
          onCancel={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Certificate Form */}
      {showCertificateForm && (
        <CertificateForm
          certificate={editingCertificate}
          onSave={handleAdminSave}
          onCancel={() => {
            setShowCertificateForm(false);
            setEditingCertificate(null);
          }}
        />
      )}
    </div>
  );
}