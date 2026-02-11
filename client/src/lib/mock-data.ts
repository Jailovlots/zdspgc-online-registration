// This file contains mock data types and constants for development
// Note: Most data should be fetched from the API in production

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  courseId: string;
  yearLevel: number;
  status: "enrolled" | "pending" | "rejected" | "not-enrolled";
  avatar?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  units: number;
  schedule: string;
  instructor: string;
}

