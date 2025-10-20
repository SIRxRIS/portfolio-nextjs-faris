export interface Project {
  id?: string;
  Title: string;
  Description: string;
  Img: string; // relative path under /public (e.g., /project/my-image.png)
  TechStack: string[];
  Features?: string[];
  Github?: string;
  Demo?: string; // live demo URL
  Category?: string;
  Featured?: boolean;
}

export interface Certificate {
  id?: string;
  title: string;
  issuer: string;
  year: string;
  category: string;
  description: string;
  img: string;
  image?: string;
  type?: string;
  skills: string[];
  credentialUrl?: string;
}

export interface CertificateData {
  img: string;
  title: string;
  issuer: string;
  year: string;
  category: string;
  description: string;
}
