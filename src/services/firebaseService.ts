/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/firebaseService.js
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { db } from "../firebase.js";

// Collections
const PROJECTS_COLLECTION = "projects";
const CERTIFICATES_COLLECTION = "certificates";

// Auth instance
const auth = getAuth();

// Type definitions
interface ProjectData {
  Title: string;
  Description: string;
  Img?: string;
  Link?: string;
  Github?: string;
  TechStack?: string[];
  Features?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface CertificateData {
  title: string;
  issuer: string;
  year: number | string;
  category: string;
  description?: string;
  img?: string;
  type?: string;
  createdAt?: Date;
  updatedAt?: Date;
  credentialUrl?: string;
  image?: string;
  skills?: string[];
  [key: string]: any; // Allow additional properties from form
}

interface AuthResponse {
  success: boolean;
  user?: User | any;
  error?: string;
}

// ==================== AUTHENTICATION ====================

export const authService = {
  // Login admin
  async loginAdmin(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Email atau password salah.",
      };
    }
  },

  // Logout admin
  async logoutAdmin() {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  // Check auth state
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },
};

// ==================== PROJECTS CRUD ====================

export const projectsService = {
  // Get all projects
  async getAllProjects(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const q = query(
        collection(db, PROJECTS_COLLECTION),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const projects: Array<ProjectData & { id: string }> = [];

      querySnapshot.forEach((projectDoc) => {
        const projectData = projectDoc.data() as ProjectData;
        projects.push({
          id: projectDoc.id,
          ...projectData,
        });
      });

      return { success: true, data: projects };
    } catch (error: unknown) {
      console.error("Error getting projects:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  // Add new project
  async addProject(projectData: ProjectData) {
    try {
      const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
        ...projectData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error("Error adding project:", error);
      return { success: false, error: error.message };
    }
  },

  // Get project by ID
  async getProjectById(projectId: string) {
    try {
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      const projectSnapshot = await getDoc(projectRef);

      if (!projectSnapshot.exists()) {
        return { success: false, error: "Project not found" };
      }

      const projectData = projectSnapshot.data() as ProjectData;

      return {
        success: true,
        data: {
          id: projectSnapshot.id,
          ...projectData,
          TechStack: projectData.TechStack || [],
          Features: projectData.Features || [],
        },
      };
    } catch (error: any) {
      console.error("Error getting project by ID:", error);
      return { success: false, error: error.message };
    }
  },

  // Update project
  async updateProject(projectId: string, projectData: ProjectData) {
    try {
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      await updateDoc(projectRef, {
        ...projectData,
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error updating project:", error);
      return { success: false, error: error.message };
    }
  },

  // Delete project
  async deleteProject(projectId: string) {
    try {
      await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting project:", error);
      return { success: false, error: error.message };
    }
  },
};

// ==================== CERTIFICATES CRUD ====================

export const certificatesService = {
  // Get all certificates
  async getAllCertificates(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      const q = query(
        collection(db, CERTIFICATES_COLLECTION),
        orderBy("year", "desc")
      );
      const querySnapshot = await getDocs(q);
      const certificates: Array<CertificateData & { id: string }> = [];

      querySnapshot.forEach((certificateDoc) => {
        const certificateData = certificateDoc.data() as CertificateData;
        certificates.push({
          id: certificateDoc.id,
          ...certificateData,
        });
      });

      return { success: true, data: certificates };
    } catch (error: unknown) {
      console.error("Error getting certificates:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },

  // Add new certificate
  async addCertificate(certificateData: CertificateData) {
    try {
      const docRef = await addDoc(collection(db, CERTIFICATES_COLLECTION), {
        ...certificateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error("Error adding certificate:", error);
      return { success: false, error: error.message };
    }
  },

  // Update certificate
  async updateCertificate(
    certificateId: string,
    certificateData: CertificateData
  ) {
    try {
      const certificateRef = doc(db, CERTIFICATES_COLLECTION, certificateId);
      await updateDoc(certificateRef, {
        ...certificateData,
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error updating certificate:", error);
      return { success: false, error: error.message };
    }
  },

  // Delete certificate
  async deleteCertificate(certificateId: string) {
    try {
      await deleteDoc(doc(db, CERTIFICATES_COLLECTION, certificateId));
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting certificate:", error);
      return { success: false, error: error.message };
    }
  },

  // Get certificates by category
  async getCertificatesByCategory(category: string) {
    try {
      const q = query(
        collection(db, CERTIFICATES_COLLECTION),
        where("category", "==", category),
        orderBy("year", "desc")
      );
      const querySnapshot = await getDocs(q);
      const certificates: Array<CertificateData & { id: string }> = [];

      querySnapshot.forEach((certificateDoc) => {
        const certificateData = certificateDoc.data() as CertificateData;
        certificates.push({
          id: certificateDoc.id,
          ...certificateData,
        });
      });

      return { success: true, data: certificates };
    } catch (error: unknown) {
      console.error("Error getting certificates by category:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  },
};

// ==================== DATA MIGRATION ====================

export const migrationService = {
  // Migrate existing JSON data to Firestore
  async migrateJsonToFirestore(
    projectsData: ProjectData[],
    certificatesData: CertificateData[]
  ) {
    try {
      console.log("Starting data migration...");

      // Migrate projects
      for (const project of projectsData) {
        const result = await projectsService.addProject({
          Title: project.Title,
          Description: project.Description,
          Img: project.Img,
          Link: project.Link,
          Github: project.Github,
          TechStack: project.TechStack || [],
          Features: project.Features || [],
        });

        if (!result.success) {
          console.error("Failed to migrate project:", project.Title);
        }
      }

      // Migrate certificates
      for (const certificate of certificatesData) {
        const result = await certificatesService.addCertificate({
          title: certificate.title,
          issuer: certificate.issuer,
          year: certificate.year,
          category: certificate.category,
          description: certificate.description,
          img: certificate.img,
          type: certificate.type,
        });

        if (!result.success) {
          console.error("Failed to migrate certificate:", certificate.title);
        }
      }

      console.log("Data migration completed!");
      return { success: true };
    } catch (error: any) {
      console.error("Migration error:", error);
      return { success: false, error: error.message };
    }
  },
};
