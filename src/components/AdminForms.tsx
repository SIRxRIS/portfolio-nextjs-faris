// src/components/AdminForms.tsx
'use client';

import React, { useState } from "react";
import {
  projectsService,
  certificatesService,
} from "@/services/firebaseService";
import { Save, X, Plus } from "lucide-react";
import Swal from "sweetalert2";
import { Project, Certificate } from "@/types";
import FileUpload from "@/components/FileUpload";

interface ProjectFormProps {
  project?: Project | null;
  onSave: () => void;
  onCancel: () => void;
}

interface CertificateFormProps {
  certificate?: Certificate | null;
  onSave: () => void;
  onCancel: () => void;
}

// Project Form Component
export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Project>({
    Title: "",
    Description: "",
    TechStack: [],
    Img: "",
    Github: "",
    Demo: "",
    Features: [],
    Category: "",
    Featured: false,
    ...(project || {}),
  });
  const [loading, setLoading] = useState(false);
  const [newTech, setNewTech] = useState("");
  const [newFeature, setNewFeature] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      Swal.fire({
        title: project?.id ? "Updating..." : "Saving...",
        text: project?.id ? "Memperbarui proyek" : "Menyimpan proyek baru",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const cleanedData = {
        Title: formData.Title || "",
        Description: formData.Description || "",
        TechStack: Array.isArray(formData.TechStack)
          ? [...formData.TechStack]
          : [],
        Img: formData.Img || "",
        Github: formData.Github || "",
        Demo: formData.Demo || "",
        Category: formData.Category || "",
        Featured: Boolean(formData.Featured),
        Features: formData.Features || [],
      };

      let result;
      if (project?.id) {
        result = await projectsService.updateProject(project.id, cleanedData);
      } else {
        result = await projectsService.addProject(cleanedData);
      }

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: project?.id
            ? "Project berhasil diupdate"
            : "Project berhasil ditambahkan",
          timer: 2000,
          showConfirmButton: false,
        });
        onSave();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error instanceof Error ? error.message : "An error occurred",
      });
    }

    setLoading(false);
  };

  const addTechStack = () => {
    if (newTech.trim() && !formData.TechStack.includes(newTech.trim())) {
      setFormData({
        ...formData,
        TechStack: [...formData.TechStack, newTech.trim()],
      });
      setNewTech("");
    }
  };

  const removeTechStack = (index: number) => {
    setFormData({
      ...formData,
      TechStack: formData.TechStack.filter((_, i) => i !== index),
    });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        Features: [...(formData.Features || []), newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      Features: (formData.Features || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {project?.id ? "Edit Project" : "Add New Project"}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.Title}
                onChange={(e) =>
                  setFormData({ ...formData, Title: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.Description}
                onChange={(e) =>
                  setFormData({ ...formData, Description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tech Stack
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTechStack())
                  }
                  placeholder="Add technology..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addTechStack}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.TechStack.map((tech, index) => (
                  <span
                    key={index}
                    className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechStack(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image Path (mis. /project/web-kalkulator.png)
              </label>
              <input
                type="text"
                value={formData.Img}
                onChange={(e) =>
                  setFormData({ ...formData, Img: e.target.value })
                }
                placeholder="/project/namafile.png"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Features
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addFeature())
                  }
                  placeholder="Add feature..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.Features || []).map((feature, index) => (
                  <span
                    key={index}
                    className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.Github}
                  onChange={(e) =>
                    setFormData({ ...formData, Github: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Demo URL
                </label>
                <input
                  type="url"
                  value={formData.Demo}
                  onChange={(e) =>
                    setFormData({ ...formData, Demo: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.Category}
                onChange={(e) =>
                  setFormData({ ...formData, Category: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Desktop App">Desktop App</option>
                <option value="API">API</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.Featured}
                onChange={(e) =>
                  setFormData({ ...formData, Featured: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-sm text-gray-300">
                Featured Project
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Project"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Certificate Form Component
export const CertificateForm: React.FC<CertificateFormProps> = ({
  certificate,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Certificate>({
    title: "",
    issuer: "",
    year: String(new Date().getFullYear()),
    description: "",
    category: "",
    img: "",
    image: "",
    type: "pdf",
    credentialUrl: "",
    skills: [],
    ...(certificate ? {
      ...certificate,
      year: String(certificate.year)
    } : {}),
  });
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (certificate?.id) {
        result = await certificatesService.updateCertificate(
          certificate.id,
          formData
        );
      } else {
        result = await certificatesService.addCertificate(formData);
      }

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: certificate?.id
            ? "Certificate berhasil diupdate"
            : "Certificate berhasil ditambahkan",
          timer: 2000,
          showConfirmButton: false,
        });
        onSave();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error instanceof Error ? error.message : "An error occurred",
      });
    }

    setLoading(false);
  };

  const addSkill = () => {
    const skills = formData.skills || [];
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: (formData.skills || []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {certificate?.id ? "Edit Certificate" : "Add New Certificate"}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Issuer *
                </label>
                <input
                  type="text"
                  value={formData.issuer}
                  onChange={(e) =>
                    setFormData({ ...formData, issuer: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Year *
                </label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  pattern="\d{4}"
                  maxLength={4}
                  placeholder={String(new Date().getFullYear())}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Programming">Programming</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Design">Design</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSkill())
                  }
                  placeholder="Add skill..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.skills || []).map((skill, index) => (
                  <span
                    key={index}
                    className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <FileUpload
              label="Certificate Image"
              currentValue={formData.img || formData.image}
              onFileSelect={(url) =>
                setFormData({ ...formData, image: url, img: url })
              }
              accept="image/*,.pdf"
              allowedTypes={[
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/gif",
                "image/webp",
                "application/pdf",
              ]}
              showPreview={true}
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Credential URL
              </label>
              <input
                type="url"
                value={formData.credentialUrl}
                onChange={(e) =>
                  setFormData({ ...formData, credentialUrl: e.target.value })
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save Certificate"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};