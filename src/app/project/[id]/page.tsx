'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Project {
    id: string;
    Title: string;
    Description: string;
    Img?: string;
    Demo?: string;
    Github?: string;
    TechStack?: string[];
    Features?: string[];
}

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string | undefined;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Set mounted untuk client-side only
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchProject = async () => {
            if (!mounted) return;

            try {
                setLoading(true);
                setError(null);

                // Fetch from local JSON as primary source
                const response = await fetch('/data/project.json');
                if (!response.ok) throw new Error('Failed to fetch local projects');

                const projects: Project[] = await response.json();
                const foundProject = projects.find((p: Project) => p.id === id);

                if (foundProject) {
                    setProject(foundProject);
                    setError(null);
                } else {
                    // Try API as fallback
                    try {
                        const firestoreResponse = await fetch(`/api/projects/${id}`, {
                            cache: 'no-store'
                        });

                        if (firestoreResponse.ok) {
                            const firestoreResult = await firestoreResponse.json();
                            if (firestoreResult.success && firestoreResult.data) {
                                setProject(firestoreResult.data);
                                return;
                            }
                        }
                    } catch (apiError) {
                        console.warn('API fallback failed:', apiError);
                    }

                    setError('Project not found');
                    setProject(null);
                }
            } catch (error) {
                console.error('Error fetching project:', error);
                setError(error instanceof Error ? error.message : 'An error occurred');
                setProject(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProject();
        } else {
            setError('Invalid project ID');
            setLoading(false);
        }
    }, [id, mounted]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading project...</p>
                </div>
            </div>
        );
    }

    const handleBackClick = () => {
        try {
            router.push("/");
        } catch (err) {
            console.error("Navigation error:", err);
            window.location.href = "/";
        }
    };

    if (error || !project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 pt-20">
                <div className="text-center px-4">
                    <h1 className="text-4xl font-bold text-white mb-4">❌ {error || 'Project not found'}</h1>
                    <p className="text-gray-400 mb-8 text-lg">Sepertinya project tidak ditemukan atau mengalami error.</p>
                    <button
                        type="button"
                        onClick={handleBackClick}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-gradient-to-b from-slate-900 to-slate-800 pt-24">
            <div className="max-w-4xl mx-auto">
                {/* Back Link */}
                <button
                    type="button"
                    onClick={handleBackClick}
                    className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all duration-300 mb-8 inline-flex active:scale-95 cursor-pointer"
                >
                    ← Back to Home
                </button>

                {/* Project Image */}
                {project.Img && (
                    <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
                        <Image
                            src={project.Img}
                            alt={project.Title}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}

                {/* Project Title */}
                <h1 className="text-5xl font-bold text-white mb-4">{project.Title}</h1>

                {/* Project Description */}
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">{project.Description}</p>

                {/* Links */}
                <div className="flex gap-4 mb-8">
                    {project.Demo && (
                        <a
                            href={project.Demo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                        >
                            🌐 Live Demo
                        </a>
                    )}
                    {project.Github && (
                        <a
                            href={project.Github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                        >
                            💻 GitHub
                        </a>
                    )}
                </div>

                {/* Tech Stack */}
                {project.TechStack && project.TechStack.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">📚 Tech Stack</h2>
                        <div className="flex flex-wrap gap-3">
                            {project.TechStack.map((tech, idx) => (
                                <span
                                    key={idx}
                                    className="px-4 py-2 bg-gray-700 text-gray-200 rounded-full text-sm font-semibold"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Features */}
                {project.Features && project.Features.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">✨ Features</h2>
                        <ul className="space-y-3">
                            {project.Features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-gray-300">
                                    <span className="text-green-400 font-bold text-xl">✓</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}