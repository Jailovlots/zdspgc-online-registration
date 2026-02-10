import {
  users, type User, type InsertUser,
  students, type Student, type InsertStudent,
  courses, type Course,
  subjects, type Subject,
  enrollments, type Enrollment
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createStudent(userId: number, student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<Student>): Promise<Student>;
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByUserId(userId: number): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  getAllUsers(): Promise<User[]>;

  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;

  getSubjects(courseId?: number, yearLevel?: number): Promise<Subject[]>;

  enrollStudent(studentId: number, subjectIds: number[]): Promise<void>;
  getStudentEnrollments(studentId: number): Promise<Enrollment[]>;

  seed(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createStudent(userId: number, insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db
      .insert(students)
      .values({ ...insertStudent, userId })
      .returning();
    return student;
  }

  async updateStudent(id: number, studentUpdate: Partial<Student>): Promise<Student> {
    const [student] = await db
      .update(students)
      .set(studentUpdate)
      .where(eq(students.id, id))
      .returning();

    if (!student) throw new Error("Student not found");
    return student;
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentByUserId(userId: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student;
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getSubjects(courseId?: number, yearLevel?: number): Promise<Subject[]> {
    let q = db.select().from(subjects);

    if (courseId && courseId > 0) {
      q = q.where(eq(subjects.courseId, courseId));
    }

    if (yearLevel && yearLevel > 0) {
      q = q.where(eq(subjects.yearLevel, yearLevel));
    }

    return await q;
  }

  async enrollStudent(studentId: number, subjectIds: number[]): Promise<void> {
    for (const subjectId of subjectIds) {
      await db.insert(enrollments).values({
        studentId,
        subjectId,
        status: "enrolled"
      });
    }

    // Auto-update student status to enrolled if not already
    const [student] = await db.select().from(students).where(eq(students.id, studentId));
    if (student && student.status === "pending") {
      await db.update(students)
        .set({ status: "enrolled" })
        .where(eq(students.id, studentId));
    }
  }

  async getStudentEnrollments(studentId: number): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
  }

  async seed(): Promise<void> {
    const existingCourses = await db.select().from(courses).limit(1);

    // Always ensure an admin user exists even if courses are already present.
    const [existingAdmin] = await db.select().from(users).where(eq(users.username, "admin"));
    if (!existingAdmin) {
      await db.insert(users).values({
        username: "admin",
        password: "admin123", // In real app, hash this!
        role: "admin"
      });
    }

    if (existingCourses.length > 0) return; // Already seeded courses/subjects

    // Seed Courses
    const coursesData = [
      { code: "BSIS", name: "Bachelor of Science in Information System", description: "Focuses on the study of computer utilization and software development." },
      { code: "BPED", name: "Bachelor of Physical Education", description: "Prepares students for teaching in schools." },
    ];

    await db.insert(courses).values(coursesData);

    // fetch course ids so we can assign subjects to the right course
    const courseRows = await db.select().from(courses);
    const courseMap: Record<string, number> = {};
    for (const c of courseRows) {
      courseMap[c.code] = c.id as number;
    }

    // Seed Subjects (assign courseId for BSIS and BPED where appropriate)
    const subjectsData = [
      // BSIS - 1st Year
      { code: "IS 101", name: "Introduction to Computing", units: 3, schedule: "MWF 8:00-9:00 AM", instructor: "Prof. Santos", courseId: courseMap["BSIS"], yearLevel: 1 },
      { code: "IS 102", name: "Computer Programming 1", units: 3, schedule: "TTh 9:00-10:30 AM", instructor: "Prof. Reyes", courseId: courseMap["BSIS"], yearLevel: 1 },
      { code: "GE 1", name: "Understanding the Self", units: 3, schedule: "MWF 10:00-11:00 AM", instructor: "Prof. Dizon", courseId: courseMap["BSIS"], yearLevel: 1 },

      // BSIS - 2nd Year
      { code: "IS 201", name: "Data Structures", units: 3, schedule: "MWF 9:00-10:00 AM", instructor: "Prof. Tan", courseId: courseMap["BSIS"], yearLevel: 2 },
      { code: "IS 202", name: "Database Systems", units: 3, schedule: "TTh 10:30-12:00 PM", instructor: "Prof. Cruz", courseId: courseMap["BSIS"], yearLevel: 2 },

      // BSIS - 3rd Year
      { code: "IS 301", name: "Operating Systems", units: 3, schedule: "MWF 1:00-2:00 PM", instructor: "Prof. Lopez", courseId: courseMap["BSIS"], yearLevel: 3 },
      { code: "IS 302", name: "Software Engineering", units: 3, schedule: "TTh 2:30-4:00 PM", instructor: "Prof. Navarro", courseId: courseMap["BSIS"], yearLevel: 3 },

      // BSIS - 4th Year
      { code: "IS 401", name: "Information Systems Project", units: 6, schedule: "Varies", instructor: "Prof. Santos", courseId: courseMap["BSIS"], yearLevel: 4 },

      // BPED - 1st Year
      { code: "PE 101", name: "Physical Fitness and Gymnastics", units: 2, schedule: "Tue 8:00-10:00 AM", instructor: "Coach Cruz", courseId: courseMap["BPED"], yearLevel: 1 },
      { code: "HE 101", name: "Educational Foundations", units: 3, schedule: "Thu 9:00-11:00 AM", instructor: "Prof. Reyes", courseId: courseMap["BPED"], yearLevel: 1 },

      // BPED - 2nd Year
      { code: "PE 201", name: "Rhythmic Activities", units: 2, schedule: "Wed 8:00-10:00 AM", instructor: "Coach Dela Cruz", courseId: courseMap["BPED"], yearLevel: 2 },

      // BPED - 3rd Year
      { code: "PE 301", name: "Team Sports Development", units: 3, schedule: "Mon 2:00-4:00 PM", instructor: "Coach Garcia", courseId: courseMap["BPED"], yearLevel: 3 },

      // BPED - 4th Year
      { code: "PE 401", name: "Curriculum and Planning in PE", units: 3, schedule: "Fri 10:00-12:00 PM", instructor: "Prof. Mendoza", courseId: courseMap["BPED"], yearLevel: 4 },
    ];

    await db.insert(subjects).values(subjectsData);

    // admin seeding handled above
  }
}

export const storage = new DatabaseStorage();
