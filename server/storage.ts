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
  updateUser(userId: number, updates: Partial<User>): Promise<User>;
  updateUserAvatar(userId: number, avatarUrl: string): Promise<void>;

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

  // Report methods
  getEnrollmentStats(): Promise<any>;
  getEnrollmentTrends(startDate?: Date, endDate?: Date): Promise<any[]>;
  getStudentDemographics(): Promise<any>;
  getCourseAnalytics(): Promise<any>;

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

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  }

  async updateUserAvatar(userId: number, avatarUrl: string): Promise<void> {
    await db
      .update(users)
      .set({ avatar: avatarUrl } as any)
      .where(eq(users.id, userId));
  }

  async updateUser(userId: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();

    if (!user) throw new Error("User not found");
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
      const adminPassword = await import("./auth").then(m => m.hashPassword("admin123"));

      if (!existingAdmin) {
        console.log("[Storage] Creating admin user...");
        await db.insert(users).values({
          username: "admin",
          password: adminPassword,
          role: "admin"
        });
        console.log("[Storage] Admin user created (username: admin, password: admin123)");
      } else {
        // Update admin password to ensure it's hashed correctly (fix for legacy plain text)
        await db.update(users)
          .set({ password: adminPassword })
          .where(eq(users.username, "admin"));
        console.log("[Storage] Admin user verified/updated");
      }

      // Create test student user if it doesn't exist
      const [existingStudent] = await db.select().from(users).where(eq(users.username, "student@test.com"));
      const studentPassword = await import("./auth").then(m => m.hashPassword("student123"));

      if (!existingStudent) {
        console.log("[Storage] Creating test student user...");
        const [testUser] = await db.insert(users).values({
          username: "student@test.com",
          password: studentPassword,
          role: "student"
        }).returning();

        // Create corresponding student profile
        await db.insert(students).values({
          userId: testUser.id,
          studentId: "2024-TEST-001",
          firstName: "Juan",
          lastName: "Dela Cruz",
          email: "student@test.com",
          yearLevel: 1,
          status: "pending",
          middleInitial: "P",
          suffix: "",
          dob: "2000-01-01",
          sex: "Male",
          civilStatus: "Single",
          placeOfBirth: "Manila",
          citizenship: "Filipino",
          religion: "Catholic",
          permanentAddress: "123 Test Street, Manila",
          postalCode: "1000",
          contactNumber: "09123456789",
          courseId: null,
          section: "",
          strand: "",
          fatherName: "",
          fatherContact: "",
          fatherOccupation: "",
          fatherCompany: "",
          fatherHomeAddress: "",
          motherName: "",
          motherContact: "",
          motherOccupation: "",
          motherCompany: "",
          motherHomeAddress: "",
          guardianName: "",
          guardianContact: "",
          guardianRelationship: "",
          guardianOccupation: "",
          guardianCompany: "",
          guardianHomeAddress: "",
          emergencyContactPerson: "",
          emergencyContactHome: "",
          emergencyContactNumber: "",
          elementarySchool: "",
          elementaryAddress: "",
          elementaryYearGraduated: 0,
          juniorHighSchool: "",
          juniorHighAddress: "",
          juniorHighYearGraduated: 0,
          seniorHighSchool: "",
          seniorHighAddress: "",
          seniorHighYearGraduated: 0,
          previousSchool: "",
          yearGraduated: 0,
        });
        console.log("[Storage] Test student created (email: student@test.com, password: student123)");
      } else {
        // Update student password to ensure it's hashed correctly (fix for legacy plain text)
        await db.update(users)
          .set({ password: studentPassword })
          .where(eq(users.username, "student@test.com"));
        console.log("[Storage] Test student user verified/updated");
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

  // Report Methods
  async getEnrollmentStats(): Promise<any> {
    const allStudents = await db.select().from(students);

    const stats = {
      total: allStudents.length,
      byStatus: {} as Record<string, number>,
      byYearLevel: {} as Record<number, number>,
      byProgram: [] as { programId: number | null, count: number }[]
    };

    // Count by status
    allStudents.forEach((s: Student) => {
      stats.byStatus[s.status] = (stats.byStatus[s.status] || 0) + 1;
    });

    // Count by year level
    allStudents.forEach((s: Student) => {
      stats.byYearLevel[s.yearLevel] = (stats.byYearLevel[s.yearLevel] || 0) + 1;
    });

    // Count by program
    const programCounts = new Map<number | null, number>();
    allStudents.forEach((s: Student) => {
      programCounts.set(s.courseId, (programCounts.get(s.courseId) || 0) + 1);
    });
    stats.byProgram = Array.from(programCounts.entries()).map(([programId, count]) => ({ programId, count }));

    return stats;
  }

  async getEnrollmentTrends(startDate?: Date, endDate?: Date): Promise<any[]> {
    // For now, return mock trend data
    // In a real implementation, you'd query students with creation timestamps
    const allStudents = await db.select().from(students);

    // Group by month (simplified - in production you'd use actual timestamps)
    const monthlyData = [
      { date: '2024-01', count: Math.floor(allStudents.length * 0.1) },
      { date: '2024-02', count: Math.floor(allStudents.length * 0.15) },
      { date: '2024-03', count: Math.floor(allStudents.length * 0.2) },
      { date: '2024-04', count: Math.floor(allStudents.length * 0.25) },
      { date: '2024-05', count: Math.floor(allStudents.length * 0.3) },
      { date: '2024-06', count: allStudents.length },
    ];

    return monthlyData;
  }

  async getStudentDemographics(): Promise<any> {
    const allStudents = await db.select().from(students);

    const demographics = {
      byGender: {} as Record<string, number>,
      bySection: [] as { section: string, count: number }[],
      byCivilStatus: {} as Record<string, number>
    };

    // Count by gender
    allStudents.forEach((s: Student) => {
      if (s.sex) {
        demographics.byGender[s.sex] = (demographics.byGender[s.sex] || 0) + 1;
      }
    });

    // Count by section
    const sectionCounts = new Map<string, number>();
    allStudents.forEach((s: Student) => {
      if (s.section) {
        sectionCounts.set(s.section, (sectionCounts.get(s.section) || 0) + 1);
      }
    });
    demographics.bySection = Array.from(sectionCounts.entries()).map(([section, count]) => ({ section, count }));

    // Count by civil status
    allStudents.forEach((s: Student) => {
      if (s.civilStatus) {
        demographics.byCivilStatus[s.civilStatus] = (demographics.byCivilStatus[s.civilStatus] || 0) + 1;
      }
    });

    return demographics;
  }

  async getCourseAnalytics(): Promise<any> {
    const allCourses = await db.select().from(courses);
    const allSubjects = await db.select().from(subjects);
    const allEnrollments = await db.select().from(enrollments);
    const allStudents = await db.select().from(students);

    // Count students per course
    const courseEnrollments = allCourses.map((course: Course) => {
      const count = allStudents.filter((s: Student) => s.courseId === course.id).length;
      return {
        id: course.id,
        name: course.name,
        code: course.code,
        enrollmentCount: count
      };
    });

    // Count enrollments per subject
    const subjectEnrollments = allSubjects.map((subject: Subject) => {
      const count = allEnrollments.filter((e: Enrollment) => e.subjectId === subject.id).length;
      return {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        enrollmentCount: count
      };
    });

    return {
      courses: courseEnrollments,
      subjects: subjectEnrollments.sort((a: { enrollmentCount: number }, b: { enrollmentCount: number }) => b.enrollmentCount - a.enrollmentCount).slice(0, 10) // Top 10
    };
  }
}

export const storage = new DatabaseStorage();
