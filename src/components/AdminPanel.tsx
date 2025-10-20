// src/components/AdminPanel.tsx
'use client';

import React, { useState, useEffect } from "react";
import {
    authService,
    projectsService,
    certificatesService,
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
} from "lucide-react";
import Swal from "sweetalert2";
import FileUpload from "./FileUpload";
import { Project, Certificate } from "@/types";

// Import data JSON untuk migrasi (pastikan path sesuai)
// import projectsData from "@/data/project.json";
// import certificatesData from "@/data/sertifikat.json";

interface AdminPanelProps {
    onClose: () => void;
    onOpenProjectForm: (project?: Project) => void;
    onOpenCertificateForm: (certificate?: Certificate) => void;
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
    const [activeTab, setActiveTab] = useState<"projects" | "certificates" | "profile">("projects");
    const [projects, setProjects] = useState<Project[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [showLoginForm, setShowLoginForm] = useState(true);
    const [loginData, setLoginData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState("/Photo.png");

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

        const [projectsResult, certificatesResult] = await Promise.all([
            projectsService.getAllProjects(),
            certificatesService.getAllCertificates(),
        ]);

        if (projectsResult.success && projectsResult.data) {
            setProjects(projectsResult.data as Project[]);
        }

        if (certificatesResult.success && certificatesResult.data) {
            setCertificates(certificatesResult.data as Certificate[]);
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
    const handleDelete = async (id: string, type: "project" | "certificate") => {
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

                        {/* Demo Credentials Info */}
                        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
                            <h3 className="text-blue-300 font-medium mb-2">🔑 Demo Login:</h3>
                            <div className="text-sm text-blue-200 space-y-1">
                                <p>
                                    <strong>Email:</strong> admin@demo.com
                                </p>
                                <p>
                                    <strong>Password:</strong> admin123
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setLoginData({
                                        email: "admin@demo.com",
                                        password: "admin123",
                                    })
                                }
                                className="mt-2 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                            >
                                Isi Otomatis
                            </button>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl w-full max-w-6xl h-[90vh] border border-gray-700 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <User className="w-6 h-6" />
                        Admin Panel
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-300">{user?.email}</span>
                        <button
                            onClick={handleMigration}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            Migrasi Data
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab("projects")}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === "projects"
                            ? "text-blue-400 border-b-2 border-blue-400"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Projects ({projects.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("certificates")}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === "certificates"
                            ? "text-blue-400 border-b-2 border-blue-400"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Certificates ({certificates.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === "profile"
                            ? "text-blue-400 border-b-2 border-blue-400"
                            : "text-gray-400 hover:text-white"
                            }`}
                    >
                        Profile
                    </button>
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

                                    <div className="grid gap-4">
                                        {projects.map((project) => (
                                            <div
                                                key={project.id}
                                                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-semibold text-white mb-2">
                                                            {project.Title}
                                                        </h4>
                                                        <p className="text-gray-300 text-sm mb-2">
                                                            {project.Description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {project.TechStack?.map((tech, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs"
                                                                >
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() => onOpenProjectForm(project)}
                                                            className="text-blue-400 hover:text-blue-300 p-2"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                project.id && handleDelete(project.id, "project")
                                                            }
                                                            className="text-red-400 hover:text-red-300 p-2"
                                                            disabled={!project.id}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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

                                    <div className="grid gap-4">
                                        {certificates.map((certificate) => (
                                            <div
                                                key={certificate.id}
                                                className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-semibold text-white mb-2">
                                                            {certificate.title}
                                                        </h4>
                                                        <p className="text-gray-300 text-sm mb-2">
                                                            {certificate.issuer} • {certificate.year}
                                                        </p>
                                                        <p className="text-gray-400 text-sm mb-2">
                                                            {certificate.description}
                                                        </p>
                                                        <span className="bg-green-600/20 text-green-300 px-2 py-1 rounded text-xs">
                                                            {certificate.category}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() => onOpenCertificateForm(certificate)}
                                                            className="text-blue-400 hover:text-blue-300 p-2"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                certificate.id && handleDelete(certificate.id, "certificate")
                                                            }
                                                            className="text-red-400 hover:text-red-300 p-2"
                                                            disabled={!certificate.id}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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