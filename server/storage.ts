import {
  users, type User, type InsertUser,
  students, type Student, type InsertStudent,
  courses, type Course, type InsertCourse,
  subjects, type Subject, type InsertSubject,
  enrollments, type Enrollment,
  notifications, type Notification, type InsertNotification,
  loginAttempts, type LoginAttempt, type InsertLoginAttempt
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface DashboardStats {
  totalStudents: number;
  pendingEnrollments: number;
  activeCourses: number;
  rejectedApplications: number;
  enrollmentByCourse: { name: string; total: number }[];
  recentApplications: { id: number; firstName: string; lastName: string; courseCode: string; status: string; createdAt: string }[];
}

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
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<Course>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;

  getSubjects(courseId?: number, yearLevel?: number): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, subject: Partial<Subject>): Promise<Subject>;
  deleteSubject(id: number): Promise<void>;

  enrollStudent(studentId: number, subjectIds: number[]): Promise<void>;
  getStudentEnrollments(studentId: number): Promise<Enrollment[]>;

  deleteStudent(id: number): Promise<void>;
  getDashboardStats(): Promise<DashboardStats>;

  logNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId?: number): Promise<Notification[]>;

  logLoginAttempt(attempt: InsertLoginAttempt): Promise<LoginAttempt>;
  getRecentLoginAttempts(userId: number, limit?: number): Promise<LoginAttempt[]>;

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

    const conditions = [];
    if (courseId && courseId > 0) {
      conditions.push(eq(subjects.courseId, courseId));
    }
    if (yearLevel && yearLevel > 0) {
      conditions.push(eq(subjects.yearLevel, yearLevel));
    }

    if (conditions.length > 0) {
      return await q.where(and(...conditions));
    }

    return await q;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }

  async updateCourse(id: number, courseUpdate: Partial<Course>): Promise<Course> {
    const [course] = await db
      .update(courses)
      .set(courseUpdate)
      .where(eq(courses.id, id))
      .returning();
    if (!course) throw new Error("Course not found");
    return course;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(insertSubject).returning();
    return subject;
  }

  async updateSubject(id: number, subjectUpdate: Partial<Subject>): Promise<Subject> {
    const [subject] = await db
      .update(subjects)
      .set(subjectUpdate)
      .where(eq(subjects.id, id))
      .returning();
    if (!subject) throw new Error("Subject not found");
    return subject;
  }

  async deleteSubject(id: number): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
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

  async deleteStudent(id: number): Promise<void> {
    const student = await this.getStudent(id);
    if (!student) throw new Error("Student not found");

    // Delete associated subjects enrollment first (if any)
    await db.delete(enrollments).where(eq(enrollments.studentId, id));

    // Delete student record
    await db.delete(students).where(eq(students.id, id));

    // Deleting user account is optional, but requested "Delete account"
    await db.delete(users).where(eq(users.id, student.userId));
  }

  async getStudentEnrollments(studentId: number): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const allStudents = await db.select().from(students);
    const allCourses = await db.select().from(courses);

    const pendingEnrollments = allStudents.filter((s: Student) => s.status === "pending").length;
    const rejectedApplications = allStudents.filter((s: Student) => s.status === "rejected").length;
    const activeCoursesCount = allCourses.length;

    // Enrollment by Course
    const courseMap: Record<number, string> = {};
    allCourses.forEach((c: Course) => {
      courseMap[c.id as number] = c.code;
    });

    const enrollmentByCourseMap: Record<string, number> = {};
    allCourses.forEach((c: Course) => {
      enrollmentByCourseMap[c.code] = 0;
    });

    allStudents.forEach((s: Student) => {
      if (s.courseId) {
        const courseCode = courseMap[s.courseId];
        if (courseCode && enrollmentByCourseMap[courseCode] !== undefined) {
          enrollmentByCourseMap[courseCode]++;
        }
      }
    });

    const enrollmentByCourse = Object.entries(enrollmentByCourseMap).map(([name, total]) => ({
      name,
      total
    }));

    // Recent Applications (using the last 5 created based on ID since we don't have createdAt yet, but ID is serial)
    // Actually, students table doesn't have createdAt. Let's just grab the last 5.
    const recentStudents = [...allStudents]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);

    const recentApplications = recentStudents.map((s: Student) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      courseCode: s.courseId ? (courseMap[s.courseId] || "N/A") : "N/A",
      status: s.status,
      createdAt: "Recently" // Placeholder as we don't have timestamp in schema
    }));

    return {
      totalStudents: allStudents.length,
      pendingEnrollments,
      activeCourses: activeCoursesCount,
      rejectedApplications,
      enrollmentByCourse,
      recentApplications
    };
  }

  async logNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async getNotifications(userId?: number): Promise<Notification[]> {
    if (userId) {
      return await db.select().from(notifications).where(eq(notifications.sentBy, userId)).orderBy(notifications.sentAt);
    }
    return await db.select().from(notifications).orderBy(notifications.sentAt);
  }

  async logLoginAttempt(insertAttempt: InsertLoginAttempt): Promise<LoginAttempt> {
    const [attempt] = await db.insert(loginAttempts).values(insertAttempt).returning();
    return attempt;
  }

  async getRecentLoginAttempts(userId: number, limit = 5): Promise<LoginAttempt[]> {
    return await db
      .select()
      .from(loginAttempts)
      .where(eq(loginAttempts.userId, userId))
      .limit(limit)
      .orderBy(loginAttempts.attemptTime);
  }

  async seed(): Promise<void> {
    try {
      console.log("[Storage] Starting database seed...");

      const existingCourses = await db.select().from(courses).limit(1);

      // Always ensure an admin user exists even if courses are already present.
      const [existingAdmin] = await db.select().from(users).where(eq(users.username, "admin"));
      if (!existingAdmin) {
        console.log("[Storage] Creating admin user...");
        await db.insert(users).values({
          username: "admin",
          password: "admin123", // In real app, hash this!
          role: "admin"
        });
        console.log("[Storage] Admin user created (username: admin, password: admin123)");
      } else {
        console.log("[Storage] Admin user already exists");
      }

      if (existingCourses.length > 0) {
        console.log("[Storage] Courses already seeded, skipping...");
        return; // Already seeded courses/subjects
      }

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
        { code: "GE 2", name: "Readings in Philippine History", units: 3, schedule: "TTh 1:00-2:30 PM", instructor: "Prof. Gomez", courseId: courseMap["BSIS"], yearLevel: 1 },

        // BSIS - 2nd Year
        { code: "IS 201", name: "Data Structures", units: 3, schedule: "MWF 9:00-10:00 AM", instructor: "Prof. Tan", courseId: courseMap["BSIS"], yearLevel: 2 },
        { code: "IS 202", name: "Database Systems", units: 3, schedule: "TTh 10:30-12:00 PM", instructor: "Prof. Cruz", courseId: courseMap["BSIS"], yearLevel: 2 },
        { code: "IS 203", name: "Discrete Mathematics", units: 3, schedule: "MWF 11:00-12:00 PM", instructor: "Prof. Lee", courseId: courseMap["BSIS"], yearLevel: 2 },
        { code: "GE 3", name: "The Contemporary World", units: 3, schedule: "TTh 2:30-4:00 PM", instructor: "Prof. White", courseId: courseMap["BSIS"], yearLevel: 2 },

        // BSIS - 3rd Year
        { code: "IS 301", name: "Operating Systems", units: 3, schedule: "MWF 1:00-2:00 PM", instructor: "Prof. Lopez", courseId: courseMap["BSIS"], yearLevel: 3 },
        { code: "IS 302", name: "Software Engineering", units: 3, schedule: "TTh 2:30-4:00 PM", instructor: "Prof. Navarro", courseId: courseMap["BSIS"], yearLevel: 3 },
        { code: "IS 303", name: "Networks and Communications", units: 3, schedule: "MWF 3:00-4:00 PM", instructor: "Prof. Kim", courseId: courseMap["BSIS"], yearLevel: 3 },
        { code: "IS 304", name: "Information Assurance and Security", units: 3, schedule: "TTh 4:00-5:30 PM", instructor: "Prof. Park", courseId: courseMap["BSIS"], yearLevel: 3 },

        // BSIS - 4th Year
        { code: "IS 401", name: "Information Systems Project", units: 6, schedule: "Varies", instructor: "Prof. Santos", courseId: courseMap["BSIS"], yearLevel: 4 },
        { code: "IS 402", name: "Social and Professional Issues", units: 3, schedule: "Fri 1:00-4:00 PM", instructor: "Prof. Reyes", courseId: courseMap["BSIS"], yearLevel: 4 },
        { code: "IS 403", name: "Internship / OJT", units: 6, schedule: "Off-campus", instructor: "Coordinator", courseId: courseMap["BSIS"], yearLevel: 4 },

        // BPED - 1st Year
        { code: "PE 101", name: "Physical Fitness and Gymnastics", units: 2, schedule: "Tue 8:00-10:00 AM", instructor: "Coach Cruz", courseId: courseMap["BPED"], yearLevel: 1 },
        { code: "HE 101", name: "Educational Foundations", units: 3, schedule: "Thu 9:00-11:00 AM", instructor: "Prof. Reyes", courseId: courseMap["BPED"], yearLevel: 1 },
        { code: "GE 1-PE", name: "Understanding the Self", units: 3, schedule: "Mon 8:00-9:00 AM", instructor: "Prof. Dizon", courseId: courseMap["BPED"], yearLevel: 1 },

        // BPED - 2nd Year
        { code: "PE 201", name: "Rhythmic Activities", units: 2, schedule: "Wed 8:00-10:00 AM", instructor: "Coach Dela Cruz", courseId: courseMap["BPED"], yearLevel: 2 },
        { code: "PE 202", name: "Individual and Dual Sports", units: 2, schedule: "Fri 8:00-10:00 AM", instructor: "Coach Garcia", courseId: courseMap["BPED"], yearLevel: 2 },

        // BPED - 3rd Year
        { code: "PE 301", name: "Team Sports Development", units: 3, schedule: "Mon 2:00-4:00 PM", instructor: "Coach Garcia", courseId: courseMap["BPED"], yearLevel: 3 },
        { code: "PE 302", name: "Anatomy and Physiology of Movement", units: 3, schedule: "Wed 1:00-3:00 PM", instructor: "Dr. Smith", courseId: courseMap["BPED"], yearLevel: 3 },

        // BPED - 4th Year
        { code: "PE 401", name: "Curriculum and Planning in PE", units: 3, schedule: "Fri 10:00-12:00 PM", instructor: "Prof. Mendoza", courseId: courseMap["BPED"], yearLevel: 4 },
        { code: "PE 402", name: "Student Teaching / Practicum", units: 6, schedule: "Varies", instructor: "Supervisor", courseId: courseMap["BPED"], yearLevel: 4 },
      ];

      await db.insert(subjects).values(subjectsData);

      console.log("[Storage] Database seed completed successfully");
    } catch (error) {
      console.error("[Storage] Database seed failed:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
