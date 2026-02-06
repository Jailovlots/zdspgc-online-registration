import {
  users, type User, type InsertUser,
  students, type Student, type InsertStudent,
  courses, type Course,
  subjects, type Subject,
  enrollments, type Enrollment
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createStudent(userId: number, student: InsertStudent): Promise<Student>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByUserId(userId: number): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;

  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;

  getSubjects(courseId: number): Promise<Subject[]>;

  enrollStudent(studentId: number, subjectIds: number[]): Promise<void>;
  getStudentEnrollments(studentId: number): Promise<Enrollment[]>;

  seed(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private courses: Map<number, Course>;
  private subjects: Map<number, Subject>;
  private enrollments: Map<number, Enrollment>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.courses = new Map();
    this.subjects = new Map();
    this.enrollments = new Map();
    this.currentId = { users: 1, students: 1, courses: 1, subjects: 1, enrollments: 1 };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id, role: insertUser.role || "student" };
    this.users.set(id, user);
    return user;
  }

  async createStudent(userId: number, insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentId.students++;
    const student: Student = {
      ...insertStudent,
      id,
      userId,
      status: "pending",
      courseId: insertStudent.courseId ?? null,
      avatar: insertStudent.avatar ?? null,
    };
    this.students.set(id, student);
    return student;
  }

  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByUserId(userId: number): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(s => s.userId === userId);
  }

  async getAllStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getSubjects(courseId: number): Promise<Subject[]> {
    // In a real app we might link subjects to courses via a join table or column
    // For now we'll return all subjects or filter if we had a mapping
    // Assuming subjects are general for now based on mock data
    return Array.from(this.subjects.values());
  }

  async enrollStudent(studentId: number, subjectIds: number[]): Promise<void> {
    for (const subjectId of subjectIds) {
      const id = this.currentId.enrollments++;
      const enrollment: Enrollment = {
        id,
        studentId,
        subjectId,
        status: "enrolled"
      };
      this.enrollments.set(id, enrollment);
    }

    // Auto-update student status to enrolled if not already
    const student = this.students.get(studentId);
    if (student && student.status === "pending") {
      this.students.set(studentId, { ...student, status: "enrolled" });
    }
  }

  async getStudentEnrollments(studentId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(e => e.studentId === studentId);
  }

  async seed(): Promise<void> {
    if (this.courses.size > 0) return; // Already seeded

    // Seed Courses
    const coursesData = [
      { code: "BSIS", name: "Bachelor of Science in Information System", description: "Focuses on the study of computer utilization and software development." },
      { code: "BPED", name: "Bachelor of Physical Education", description: "Prepares students for teaching in schools." },
    ];

    for (const c of coursesData) {
      const id = this.currentId.courses++;
      this.courses.set(id, { ...c, id });
    }

    // Seed Subjects
    const subjectsData = [
      { code: "IS 101", name: "Introduction to Computing", units: 3, schedule: "MWF 8:00-9:00 AM", instructor: "Prof. Santos" },
      { code: "IS 102", name: "Computer Programming 1", units: 3, schedule: "TTh 9:00-10:30 AM", instructor: "Prof. Reyes" },
      { code: "GE 1", name: "Understanding the Self", units: 3, schedule: "MWF 10:00-11:00 AM", instructor: "Prof. Dizon" },
      { code: "GE 2", name: "Readings in Philippine History", units: 3, schedule: "TTh 1:00-2:30 PM", instructor: "Prof. Mercado" },
      { code: "PE 1", name: "Physical Fitness and Gymnastics", units: 2, schedule: "Sat 8:00-10:00 AM", instructor: "Coach Cruz" },
      { code: "NSTP 1", name: "ROTC 1", units: 3, schedule: "Sat 1:00-4:00 PM", instructor: "Mr. Garcia" },
    ];

    for (const s of subjectsData) {
      const id = this.currentId.subjects++;
      this.subjects.set(id, { ...s, id });
    }

    // Seed Admin
    const adminId = this.currentId.users++;
    this.users.set(adminId, {
      id: adminId,
      username: "admin",
      password: "admin123", // In real app, hash this!
      role: "admin"
    });
  }
}

export const storage = new MemStorage();
