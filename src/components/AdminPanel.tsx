// src/components/AdminPanel.tsx
'use client';

import React, { useState, useEffect } from "react";
import {
    authService,
    projectsService,
    certificatesService,
    commentsService,
} from "@/services/firebaseService";
import {
    User,
    LogOut,
    Plus,
    Edit,
    Trash2,
    Upload,
    X,
    Eye,
    EyeOff,
    Pin,
} from "lucide-react";
import Swal from "sweetalert2";
import FileUpload from "./FileUpload";
import { Project, Certificate } from "@/types";
import { Timestamp } from "firebase/firestore";

// Import data JSON untuk migrasi (pastikan path sesuai)
// import projectsData from "@/data/project.json";
// import certificatesData from "@/data/sertifikat.json";

interface AdminPanelProps {
    onClose: () => void;
    onOpenProjectForm: (project?: Project) => void;
    onOpenCertificateForm: (certificate?: Certificate) => void;
}

interface CommentData {
    id: string;
    content: string;
    userName: string;
    isAdmin: boolean;
    isPinned: boolean;
    createdAt: Timestamp | null;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
    onClose,
    onOpenProjectForm,
    onOpenCertificateForm
}) => {
    interface AdminUser {
        email: string | null;
        uid: string;
    }
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"projects" | "certificates" | "comments" | "profile">(() => {
        if (typeof window !== "undefined") {
            const saved = window.localStorage.getItem("adminPanelActiveTab");
            if (saved === "projects" || saved === "certificates" || saved === "comments" || saved === "profile") {
                return saved;
            }
        }
        return "projects";
    });
    const [projects, setProjects] = useState<Project[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [comments, setComments] = useState<CommentData[]>([]);
    const [showLoginForm, setShowLoginForm] = useState(true);
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState("/Photo.png");

    const setActiveTabWithPersist = (tab: "projects" | "certificates" | "comments" | "profile") => {
        setActiveTab(tab);
        if (typeof window !== "undefined") {
            window.localStorage.setItem("adminPanelActiveTab", tab);
        }
    };

    // Login form
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await authService.loginAdmin(
            loginData.email,
            loginData.password
        );

        if (result.success && result.user) {
            setUser({
                email: result.user.email || '',
                uid: result.user.uid
            });
            setShowLoginForm(false);
            await loadData();
            Swal.fire({
                icon: "success",
                title: "Login Berhasil!",
                text: "Selamat datang di Admin Panel",
                timer: 2000,
                showConfirmButton: false,
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Login Gagal!",
                text: result.error,
            });
        }

        setLoading(false);
    };

    // Logout
    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "Logout?",
            text: "Apakah Anda yakin ingin keluar?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, Logout",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            await authService.logoutAdmin();
            setUser(null);
            setShowLoginForm(true);
        }
    };

    // Load data
    const loadData = async () => {
        setLoading(true);

        const [projectsResult, certificatesResult, commentsResult] = await Promise.all([
            projectsService.getAllProjects(),
            certificatesService.getAllCertificates(),
            commentsService.getAllComments(),
        ]);

        if (projectsResult.success && projectsResult.data) {
            setProjects(projectsResult.data as Project[]);
        }

        if (certificatesResult.success && certificatesResult.data) {
            setCertificates(certificatesResult.data as Certificate[]);
        }

        if (commentsResult.success && commentsResult.data) {
            setComments(commentsResult.data as CommentData[]);
        }

        setLoading(false);
    };

    // Migrate JSON data to Firestore
    const handleMigration = async () => {
        const result = await Swal.fire({
            title: "Migrasi Data?",
            text: "Ini akan memindahkan data dari JSON ke Firestore. Lanjutkan?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya, Migrasi",
            cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
            setLoading(true);

            // Uncomment dan sesuaikan dengan import data JSON Anda
            // const migrationResult = await migrationService.migrateJsonToFirestore(
            //   projectsData,
            //   certificatesData
            // );

            // Sementara demo
            const migrationResult = { success: true };

            if (migrationResult.success) {
                await loadData();
                Swal.fire({
                    icon: "success",
                    title: "Migrasi Berhasil!",
                    text: "Data berhasil dipindahkan ke Firestore",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Migrasi Gagal!",
                    text: "Terjadi kesalahan saat migrasi",
                });
            }
            setLoading(false);
        }
    };

    // Profile photo functions
    const loadProfilePhoto = () => {
        if (typeof window !== 'undefined') {
            const savedPhoto = localStorage.getItem("profilePhoto");
            if (savedPhoto) {
                setProfilePhoto(savedPhoto);
            }
        }
    };

    const handleProfilePhotoChange = (url: string) => {
        setProfilePhoto(url);
        if (typeof window !== 'undefined') {
            localStorage.setItem("profilePhoto", url);
        }

        Swal.fire({
            icon: "success",
            title: "Foto Profil Berhasil Diubah!",
            text: "Foto profil akan diperbarui di seluruh aplikasi",
            timer: 2000,
            showConfirmButton: false,
        });
    };

    // Delete item
    const handleDelete = async (id: string, type: "project" | "certificate" | "comment") => {
        const result = await Swal.fire({
            title: "Hapus Item?",
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, Hapus",
            cancelButtonText: "Batal",
            confirmButtonColor: "#d33",
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                let deleteResult;
                if (type === "project") {
                    deleteResult = await projectsService.deleteProject(id);
                } else if (type === "certificate") {
                    deleteResult = await certificatesService.deleteCertificate(id);
                } else if (type === "comment") {
                    deleteResult = await commentsService.deleteComment(id);
                }

                if (deleteResult?.success) {
                    await loadData();
                    Swal.fire({
                        icon: "success",
                        title: "Berhasil!",
                        text: "Item berhasil dihapus",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } else {
                    throw new Error(deleteResult?.error || "Unknown error");
                }
            } catch (error) {
                console.error("Error deleting item:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: "Gagal menghapus item. " + (error instanceof Error ? error.message : ""),
                });
            } finally {
                setLoading(false);
            }
        }
    };

    // Toggle comment pin
    const handleTogglePin = async (id: string, isPinned: boolean) => {
        setLoading(true);
        try {
            const updateResult = await commentsService.updateComment(id, {
                isPinned: !isPinned,
            });

            if (updateResult.success) {
                await loadData();
                Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: !isPinned ? "Komentar berhasil di-pin" : "Komentar berhasil di-unpin",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                throw new Error(updateResult.error || "Unknown error");
            }
        } catch (error) {
            console.error("Error toggling pin:", error);
            Swal.fire({
                icon: "error",
                title: "Error!",
                text: "Gagal mengubah status komentar. " + (error instanceof Error ? error.message : ""),
            });
        } finally {
            setLoading(false);
        }
    };

    // Auth state listener
    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange((user: AdminUser | null) => {
            setUser(user);
            if (user) {
                setShowLoginForm(false);
                loadData();
                loadProfilePhoto();
            }
        });

        return () => unsubscribe();
    }, []);

    if (showLoginForm) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <User className="w-6 h-6" />
                            Admin Login
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={loginData.email}
                                onChange={(e) =>
                                    setLoginData({ ...loginData, email: e.target.value })
                                }
                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={loginData.password}
                                    onChange={(e) =>
                                        setLoginData({ ...loginData, password: e.target.value })
                                    }
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-4 sm:p-6">
            <div className="bg-gray-900 rounded-xl md:rounded-2xl w-full max-w-6xl h-[90vh] border border-gray-700 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-6 border-b border-gray-700 bg-gray-900/80 backdrop-blur">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <User className="w-6 h-6" />
                        Admin Panel
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <span className="text-gray-300 text-sm sm:text-base break-all sm:break-normal">{user?.email}</span>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <button
                                onClick={handleMigration}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
                            >
                                <Upload className="w-4 h-4" />
                                Migrasi Data
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors w-full sm:w-auto justify-center flex items-center gap-2"
                            >
                                <X className="w-6 h-6" />
                                <span className="sm:hidden">Close</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700 overflow-x-auto">
                    <div className="flex min-w-full md:min-w-0">
                        <button
                            onClick={() => setActiveTabWithPersist("projects")}
                            className={`flex-1 px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === "projects"
                                ? "text-blue-400 border-b-2 border-blue-400"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Projects ({projects.length})
                        </button>
                        <button
                            onClick={() => setActiveTabWithPersist("certificates")}
                            className={`flex-1 px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === "certificates"
                                ? "text-blue-400 border-b-2 border-blue-400"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Certificates ({certificates.length})
                        </button>
                        <button
                            onClick={() => setActiveTabWithPersist("comments")}
                            className={`flex-1 px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === "comments"
                                ? "text-blue-400 border-b-2 border-blue-400"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Comments ({comments.length})
                        </button>
                        <button
                            onClick={() => setActiveTabWithPersist("profile")}
                            className={`flex-1 px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === "profile"
                                ? "text-blue-400 border-b-2 border-blue-400"
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Profile
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-white">Loading...</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeTab === "projects" && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-semibold text-white">
                                            Projects
                                        </h3>
                                        <button
                                            onClick={() => onOpenProjectForm()}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Project
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {projects.map((project) => (
                                            <div
                                                key={project.id}
                                                className="bg-gray-800/80 backdrop-blur rounded-xl border border-gray-700 p-4 sm:p-5"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                    <div className="flex-1 space-y-3">
                                                        <h4 className="text-lg font-semibold text-white">
                                                            {project.Title}
                                                        </h4>
                                                        <p className="text-gray-300 text-sm leading-relaxed">
                                                            {project.Description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {project.TechStack?.map((tech, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-xs font-medium"
                                                                >
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                                                            {project.Github && (
                                                                <a
                                                                    href={project.Github}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="hover:text-blue-300 underline underline-offset-2"
                                                                >
                                                                    GitHub
                                                                </a>
                                                            )}
                                                            {project.Demo && (
                                                                <a
                                                                    href={project.Demo}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="hover:text-blue-300 underline underline-offset-2"
                                                                >
                                                                    Demo
                                                                </a>
                                                            )}
                                                            {project.Category && (
                                                                <span className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full">
                                                                    {project.Category}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[140px]">
                                                        <button
                                                            onClick={() => onOpenProjectForm(project)}
                                                            className="text-blue-400 hover:text-blue-300 border border-blue-500/40 hover:border-blue-400 rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors w-full"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                project.id && handleDelete(project.id, "project")
                                                            }
                                                            className="text-red-400 hover:text-red-300 border border-red-500/40 hover:border-red-400 rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors w-full disabled:opacity-50"
                                                            disabled={!project.id}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "certificates" && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-semibold text-white">
                                            Certificates
                                        </h3>
                                        <button
                                            onClick={() => onOpenCertificateForm()}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Certificate
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {certificates.map((certificate) => (
                                            <div
                                                key={certificate.id}
                                                className="bg-gray-800/80 backdrop-blur rounded-xl border border-gray-700 p-4 sm:p-5"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                    <div className="flex-1 space-y-3">
                                                        <h4 className="text-lg font-semibold text-white">
                                                            {certificate.title}
                                                        </h4>
                                                        <p className="text-gray-300 text-sm leading-relaxed">
                                                            {certificate.issuer} • {certificate.year}
                                                        </p>
                                                        <p className="text-gray-400 text-sm leading-relaxed">
                                                            {certificate.description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                                                            {certificate.category && (
                                                                <span className="bg-green-600/20 text-green-300 px-2 py-1 rounded-full">
                                                                    {certificate.category}
                                                                </span>
                                                            )}
                                                            {certificate.credentialUrl && (
                                                                <a
                                                                    href={certificate.credentialUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="hover:text-green-300 underline underline-offset-2"
                                                                >
                                                                    Credential
                                                                </a>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {certificate.skills?.map((skill, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[140px]">
                                                        <button
                                                            onClick={() => onOpenCertificateForm(certificate)}
                                                            className="text-blue-400 hover:text-blue-300 border border-blue-500/40 hover:border-blue-400 rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors w-full"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                certificate.id && handleDelete(certificate.id, "certificate")
                                                            }
                                                            className="text-red-400 hover:text-red-300 border border-red-500/40 hover:border-red-400 rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors w-full disabled:opacity-50"
                                                            disabled={!certificate.id}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "comments" && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-semibold text-white">
                                            Comments Management
                                        </h3>
                                    </div>

                                    {comments.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-400">No comments yet</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {comments.map((comment) => (
                                                <div
                                                    key={comment.id}
                                                    className={`rounded-xl border p-4 sm:p-5 ${comment.isPinned
                                                        ? "bg-indigo-500/10 border-indigo-500/30"
                                                        : "bg-gray-800/80 border-gray-700"
                                                        }`}
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-semibold text-white">
                                                                    {comment.userName}
                                                                </h4>
                                                                {comment.isAdmin && (
                                                                    <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                                                                        Admin
                                                                    </span>
                                                                )}
                                                                {comment.isPinned && (
                                                                    <span className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 flex items-center gap-1">
                                                                        <Pin className="w-3 h-3" />
                                                                        Pinned
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-gray-300 text-sm break-words leading-relaxed">
                                                                {comment.content}
                                                            </p>
                                                            {comment.createdAt && (
                                                                <p className="text-xs text-gray-500">
                                                                    {typeof comment.createdAt.toDate === 'function'
                                                                        ? new Intl.DateTimeFormat("en-US", {
                                                                            year: "numeric",
                                                                            month: "short",
                                                                            day: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        }).format(comment.createdAt.toDate())
                                                                        : "Unknown date"
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[140px]">
                                                            <button
                                                                onClick={() =>
                                                                    comment.id && handleTogglePin(comment.id, comment.isPinned)
                                                                }
                                                                className={`border rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors w-full ${comment.isPinned
                                                                    ? "text-indigo-400 hover:text-indigo-300 border-indigo-500/40 hover:border-indigo-400"
                                                                    : "text-gray-400 hover:text-white border-gray-600 hover:border-gray-400"
                                                                    }`}
                                                                disabled={!comment.id}
                                                            >
                                                                <Pin className="w-4 h-4" />
                                                                <span className="text-sm">
                                                                    {comment.isPinned ? "Unpin" : "Pin"}
                                                                </span>
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    comment.id && handleDelete(comment.id, "comment")
                                                                }
                                                                className="text-red-400 hover:text-red-300 border border-red-500/40 hover:border-red-400 rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors w-full disabled:opacity-50"
                                                                disabled={!comment.id}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                <span className="text-sm">Delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "profile" && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-white">
                                            Profile Settings
                                        </h2>
                                    </div>

                                    <div className="bg-gray-800 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-white mb-4">
                                            Profile Photo
                                        </h3>

                                        {/* Current Profile Photo Preview */}
                                        <div className="mb-6">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={profilePhoto}
                                                    alt="Current Profile"
                                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                                                />
                                                <div>
                                                    <p className="text-gray-300 text-sm">
                                                        Current profile photo
                                                    </p>
                                                    <p className="text-gray-500 text-xs">
                                                        This photo appears on the About page
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* File Upload Component */}
                                        <FileUpload
                                            onFileSelect={handleProfilePhotoChange}
                                            accept="image/*"
                                            maxSize={5}
                                            label="Upload New Profile Photo"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;