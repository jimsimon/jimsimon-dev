export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  language: string;
  url: string;
  stars?: number;
  featured: boolean;
  createdAt: Date;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface PersonalInfo {
  name: string;
  title: string;
  location: string;
  bio: string;
  email: string;
  github: string;
  linkedin: string;
  bluesky?: string;
  profilePicture?: string;
}