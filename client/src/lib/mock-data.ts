export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  courseId: string;
  yearLevel: number;
  status: "enrolled" | "pending" | "rejected" | "not-enrolled";
  avatar: string;
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

export const COURSES: Course[] = [
  { id: "1", code: "BSIT", name: "Bachelor of Science in Information Technology", description: "Focuses on the study of computer utilization and software development." },
  { id: "2", code: "BSEd", name: "Bachelor of Secondary Education", description: "Prepares students for teaching in secondary schools." },
  { id: "3", code: "BSBa", name: "Bachelor of Science in Business Administration", description: "Focuses on the management of business operations and decision making." },
  { id: "4", code: "BSCrim", name: "Bachelor of Science in Criminology", description: "Study of crime, criminals, and the criminal justice system." },
];

export const SUBJECTS: Subject[] = [
  { id: "101", code: "IT 101", name: "Introduction to Computing", units: 3, schedule: "MWF 8:00-9:00 AM", instructor: "Prof. Santos" },
  { id: "102", code: "IT 102", name: "Computer Programming 1", units: 3, schedule: "TTh 9:00-10:30 AM", instructor: "Prof. Reyes" },
  { id: "103", code: "GE 1", name: "Understanding the Self", units: 3, schedule: "MWF 10:00-11:00 AM", instructor: "Prof. Dizon" },
  { id: "104", code: "GE 2", name: "Readings in Philippine History", units: 3, schedule: "TTh 1:00-2:30 PM", instructor: "Prof. Mercado" },
  { id: "105", code: "PE 1", name: "Physical Fitness and Gymnastics", units: 2, schedule: "Sat 8:00-10:00 AM", instructor: "Coach Cruz" },
  { id: "106", code: "NSTP 1", name: "Civic Welfare Training Service 1", units: 3, schedule: "Sat 1:00-4:00 PM", instructor: "Mr. Garcia" },
];

export const MOCK_STUDENTS: Student[] = [
  { 
    id: "1", 
    firstName: "Juan", 
    lastName: "Dela Cruz", 
    email: "juan@student.zdspgc.edu.ph", 
    studentId: "2023-0001", 
    courseId: "1", 
    yearLevel: 2, 
    status: "enrolled",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan"
  },
  { 
    id: "2", 
    firstName: "Maria", 
    lastName: "Clara", 
    email: "maria@student.zdspgc.edu.ph", 
    studentId: "2023-0002", 
    courseId: "2", 
    yearLevel: 1, 
    status: "pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
  },
  { 
    id: "3", 
    firstName: "Jose", 
    lastName: "Rizal", 
    email: "jose@student.zdspgc.edu.ph", 
    studentId: "2023-0003", 
    courseId: "1", 
    yearLevel: 3, 
    status: "not-enrolled",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jose"
  },
];
