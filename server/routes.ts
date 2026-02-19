import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { insertUserSchema, insertStudentSchema, type User } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { hashPassword, comparePasswords } from "./auth";
import { NotificationService } from "./services/notification-service";

// Setup multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage_multer });

// Session-based authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = req.user as User;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  console.log("[Routes] Registering routes...");

  // Test route to verify API is working
  app.get("/api/test", (req, res) => {
    console.log("[Routes] GET /api/test - API is working");
    res.json({ message: "API is working", timestamp: new Date().toISOString() });
  });

  // Auth Routes
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: User | false, info: any) => {
      if (err) {
        console.error("[Auth] Login error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (!user) {
        console.log("[Auth] Login failed:", info?.message);
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }

      req.login(user, async (loginErr) => {
        if (loginErr) {
          console.error("[Auth] Session login error:", loginErr);
          return res.status(500).json({ message: "Login failed" });
        }

        // Log successful login
        await storage.logLoginAttempt({
          userId: user.id,
          success: true,
          ipAddress: req.ip,
        });

        console.log("[Auth] Login successful:", user.username);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    console.log("[Auth] Logout request");
    req.logout((err) => {
      if (err) {
        console.error("[Auth] Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("[Auth] Session destruction error:", destroyErr);
          return res.status(500).json({ message: "Session destruction failed" });
        }
        res.clearCookie("connect.sid");
        console.log("[Auth] Logout successful");
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { username, password, role } = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role: role || "student",
      });

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          console.error("[Registration] Auto-login failed:", err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.issues);
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get("/api/user", requireAuth, async (req, res) => {
    const user = req.user as User;
    if (user.role === "student") {
      const student = await storage.getStudentByUserId(user.id);
      const { password, ...userWithoutPassword } = user;
      return res.json({ ...userWithoutPassword, student });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Update user profile
  app.put("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { contactNumber, permanentAddress, username } = req.body;

      // Handle admin username update
      if (user.role === "admin" && username) {
        // Check if username is already taken by another user
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({ message: "Username already taken" });
        }

        await storage.updateUser(user.id, { username });
        const updatedUser = await storage.getUser(user.id);
        return res.json(updatedUser);
      }

      // Handle student profile update
      if (user.role === "student") {
        const student = await storage.getStudentByUserId(user.id);
        if (student) {
          const updated = await storage.updateStudent(student.id, {
            contactNumber,
            permanentAddress,
          });
          return res.json(updated);
        }
      }

      res.json({ message: "Profile updated" });
    } catch (error) {
      console.error("[Profile] Update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Change password
  app.put("/api/user/password", requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { currentPassword, newPassword } = req.body;

      // Verify current password
      const isValid = await comparePasswords(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash and update new password
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("[Password] Update error:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });



  // Data Routes
  // Dev-only: debug endpoints for testing
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/debug/users", async (_req, res) => {
      try {
        const users = await storage.getAllUsers();
        res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role })));
      } catch (err) {
        res.status(500).json({ message: "debug failed" });
      }
    });

    app.get("/api/debug/users/with-password", async (_req, res) => {
      try {
        const users = await storage.getAllUsers();
        res.json(users.map(u => ({ id: u.id, username: u.username, password: (u as any).password, role: u.role })));
      } catch (err) {
        res.status(500).json({ message: "debug failed" });
      }
    });
  }

  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  app.get("/api/courses", async (_req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.post("/api/courses", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    try {
      const course = await storage.createCourse(req.body);
      res.status(201).json(course);
    } catch (err) {
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.patch("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    try {
      const course = await storage.updateCourse(parseInt(req.params.id), req.body);
      res.json(course);
    } catch (err) {
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    try {
      await storage.deleteCourse(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  app.get("/api/subjects", async (req, res) => {
    const courseId = req.query.courseId ? parseInt(req.query.courseId as string) : undefined;
    const yearLevel = req.query.yearLevel ? parseInt(req.query.yearLevel as string) : undefined;
    const subjects = await storage.getSubjects(courseId, yearLevel);
    res.json(subjects);
  });

  app.post("/api/subjects", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    try {
      const subject = await storage.createSubject(req.body);
      res.status(201).json(subject);
    } catch (err) {
      res.status(500).json({ message: "Failed to create subject" });
    }
  });

  app.patch("/api/subjects/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    try {
      const subject = await storage.updateSubject(parseInt(req.params.id), req.body);
      res.json(subject);
    } catch (err) {
      res.status(500).json({ message: "Failed to update subject" });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    try {
      await storage.deleteSubject(parseInt(req.params.id));
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete subject" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      console.log("[Registration] New registration attempt:", req.body.email);
      // Combined registration: User + Student
      // 1. Create User
      const userData = insertUserSchema.parse({
        username: req.body.email.toLowerCase().trim(), // using email as username
        password: req.body.password,
        role: "student"
      });

      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        console.log("[Registration] Email already registered:", userData.username);
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      console.log("[Registration] User created:", user.id);

      // 2. Create Student
      let studentId = req.body.studentId;
      if (!studentId) {
        // Generate a student ID: YYYY-XXXX (e.g., 2024-1234)
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        studentId = `${year}-${random}`;
      }

      const studentData = insertStudentSchema.parse({
        ...req.body,
        studentId,
        userId: user.id,
        status: "pending"
      });

      const student = await storage.createStudent(user.id, studentData);
      console.log("[Registration] Student profile created:", student.id);

      // 3. Auto-login ONLY if not created by an admin
      if (req.isAuthenticated() && (req.user as any).role === 'admin') {
        console.log("[Registration] Created by admin, skipping auto-login");
        return res.status(201).json({ ...user, student });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("[Registration] Auto-login failed:", err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        console.log("[Registration] Auto-login successful for:", user.username);
        res.status(201).json({ ...user, student });
      });
    } catch (error) {
      console.error("[Registration] Error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json(error.issues);
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const id = parseInt(req.params.id as string, 10);
    try {
      // Only allow the owner student or admin to update
      const user = req.user as any;
      if (user.role !== "admin") {
        const student = await storage.getStudent(id);
        if (!student || student.userId !== user.id) return res.sendStatus(403);
      }

      const updated = await storage.updateStudent(id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);

    const id = parseInt(req.params.id as string, 10);
    try {
      await storage.deleteStudent(id);
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  app.post("/api/students/:id/upload", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const id = parseInt(req.params.id as string, 10);
    const field = req.body.field; // form138, goodMoral, psa, diploma, avatar

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!["form138", "goodMoral", "psa", "diploma", "avatar"].includes(field)) {
      return res.status(400).json({ message: "Invalid field" });
    }

    try {
      // Only allow the owner student or admin to upload
      const user = req.user as any;
      if (user.role !== "admin") {
        const student = await storage.getStudent(id);
        if (!student || student.userId !== user.id) return res.sendStatus(403);
      }

      await storage.updateStudent(id, { [field]: `/uploads/${req.file.filename}` });
      res.json({ url: `/uploads/${req.file.filename}` });
    } catch (err) {
      console.error("[Upload] Error:", err);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Serve uploads directory
  app.use("/uploads", (req, res, next) => {
    express.static(uploadDir)(req, res, next);
  });

  // Admin avatar upload endpoint
  app.post("/api/admin/:id/upload", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const id = parseInt(req.params.id as string, 10);
    const field = req.body.field; // avatar

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (field !== "avatar") {
      return res.status(400).json({ message: "Invalid field" });
    }

    try {
      // Only allow the owner admin to upload
      const user = req.user as any;
      if (user.role !== "admin" || user.id !== id) {
        return res.sendStatus(403);
      }

      // Store avatar URL in users table (admins don't have a separate profile table)
      await storage.updateUserAvatar(id, `/uploads/${req.file.filename}`);

      res.json({ url: `/uploads/${req.file.filename}` });
    } catch (err) {
      console.error("[Upload] Error:", err);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get("/api/students", async (req, res) => {
    // Only admin should see all students
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.sendStatus(403);
    }
    const students = await storage.getAllStudents();
    res.json(students);
  });

  app.get("/api/students/export", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { format = 'csv', yearLevel, section, status, courseId } = req.query;

      // Fetch all students
      let students = await storage.getAllStudents();

      // Apply filters
      if (yearLevel && yearLevel !== 'all') {
        students = students.filter(s => s.yearLevel === parseInt(yearLevel as string));
      }
      if (section && section !== 'all') {
        students = students.filter(s => s.section === section);
      }
      if (status && status !== 'all') {
        students = students.filter(s => s.status === status);
      }
      if (courseId && courseId !== 'all') {
        students = students.filter(s => s.courseId === parseInt(courseId as string));
      }

      const courses = await storage.getCourses();

      if (format === 'csv') {
        const { generateCSV } = await import('./utils/export');
        const csv = generateCSV(students, courses);

        const timestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=students-export-${timestamp}.csv`);
        res.send(csv);
      } else {
        res.status(400).json({ message: 'Unsupported format. Use csv.' });
      }
    } catch (error) {
      console.error('[Export] Error:', error);
      res.status(500).json({ message: 'Failed to export data' });
    }
  });

  // Notification endpoints
  app.get("/api/admin/notifications/history", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error) {
      console.error('[Notifications] Error fetching history:', error);
      res.status(500).json({ message: 'Failed to fetch notification history' });
    }
  });

  // Student Schedule Endpoint
  app.get("/api/student/:id/schedule", requireAuth, async (req, res) => {
    try {
      const studentId = parseInt(req.params.id as string);

      // Ensure user is authorized (admin or the student themselves)
      const user = req.user as any;
      if (user.role !== "admin" && user.student?.id !== studentId) {
        return res.status(403).json({ message: "Unauthorized access to schedule" });
      }

      const enrollments = await storage.getStudentEnrollments(studentId);
      const subjectIds = enrollments.map(e => e.subjectId);

      // Optimization: If no enrollments, return empty array immediately
      if (subjectIds.length === 0) {
        return res.json([]);
      }

      // Fetch all subjects and filter (or we could add a getSubjectsByIds to storage)
      // For now, fetching all subjects is acceptable given the likely small dataset size
      const allSubjects = await storage.getSubjects();
      const scheduledSubjects = allSubjects.filter(s => subjectIds.includes(s.id));

      res.json(scheduledSubjects);
    } catch (error) {
      console.error('[Schedule] Error fetching student schedule:', error);
      res.status(500).json({ message: 'Failed to fetch schedule' });
    }
  });

  app.post("/api/admin/notifications/email", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { subject, message, studentIds } = req.body;
      const user = req.user as any;

      // Get students
      const students = await storage.getAllStudents();
      const targetStudents = Array.isArray(studentIds)
        ? students.filter(s => studentIds.includes(s.id))
        : students;

      if (targetStudents.length === 0) {
        return res.status(400).json({ message: 'No students selected' });
      }

      // Send emails
      const { sendEmail } = await import('./utils/notifications');
      let successCount = 0;
      let failCount = 0;

      for (const student of targetStudents) {
        const success = await sendEmail({
          to: student.email,
          subject,
          html: message,
        });

        if (success) successCount++;
        else failCount++;
      }

      // Log notification
      await storage.logNotification({
        type: 'email',
        subject,
        message,
        status: failCount === 0 ? 'sent' : 'failed',
        sentBy: user.id,
      });

      res.json({
        message: `Sent ${successCount} emails, ${failCount} failed`,
        successCount,
        failCount,
      });
    } catch (error) {
      console.error('[Email] Error:', error);
      res.status(500).json({ message: 'Failed to send emails' });
    }
  });

  app.post("/api/admin/notifications/sms", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { message, studentIds } = req.body;
      const user = req.user as any;

      // Get students
      const students = await storage.getAllStudents();
      const targetStudents = Array.isArray(studentIds)
        ? students.filter(s => studentIds.includes(s.id))
        : students;

      if (targetStudents.length === 0) {
        return res.status(400).json({ message: 'No students selected' });
      }

      // Send SMS
      const { sendSMS } = await import('./utils/notifications');
      let successCount = 0;
      let failCount = 0;

      for (const student of targetStudents) {
        if (!student.contactNumber) {
          failCount++;
          continue;
        }

        const success = await sendSMS({
          to: student.contactNumber,
          message,
        });

        if (success) successCount++;
        else failCount++;
      }

      // Log notification
      await storage.logNotification({
        type: 'sms',
        subject: null,
        message,
        status: failCount === 0 ? 'sent' : 'failed',
        sentBy: user.id,
      });

      res.json({
        message: `Sent ${successCount} SMS, ${failCount} failed`,
        successCount,
        failCount,
      });
    } catch (error) {
      console.error('[SMS] Error:', error);
      res.status(500).json({ message: 'Failed to send SMS' });
    }
  });

  app.post("/api/enroll", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { subjectIds } = req.body;
    const user = req.user as any;

    const student = await storage.getStudentByUserId(user.id);
    if (!student) return res.status(400).json({ message: "Student profile not found" });

    await storage.enrollStudent(student.id, subjectIds);
    res.json({ message: "Enrolled successfully" });
  });

  app.post("/api/students/:id/enroll", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);

    const { subjectIds } = req.body;
    const studentId = parseInt(req.params.id as string, 10);

    try {
      await storage.enrollStudent(studentId, subjectIds);
      res.json({ message: "Subjects assigned successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to assign subjects" });
    }
  });

  app.get("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const user = req.user as any;
    const student = await storage.getStudentByUserId(user.id);

    if (!student) return res.json([]); // Or 404

    const enrollments = await storage.getStudentEnrollments(student.id);
    res.json(enrollments);
  });

  app.get("/api/students/:id/enrollments", requireAuth, async (req, res) => {
    // Only admin can see other students' enrollments
    const user = req.user as User;
    const studentId = parseInt(req.params.id as string, 10);

    if (user.role !== "admin") {
      const student = await storage.getStudentByUserId(user.id);
      if (!student || student.id !== studentId) {
        return res.sendStatus(403);
      }
    }

    const enrollments = await storage.getStudentEnrollments(studentId);
    res.json(enrollments);
  });

  // Notification Routes
  app.post("/api/admin/notifications/email", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { studentIds, subject, message } = req.body;
    const admin = req.user as User;

    try {
      let recipientEmails: string[] = [];
      if (studentIds === "all") {
        const students = await storage.getAllStudents();
        recipientEmails = students.map(s => s.email);
      } else if (Array.isArray(studentIds)) {
        const students = await Promise.all(studentIds.map(id => storage.getStudent(id)));
        recipientEmails = students.filter(s => !!s).map(s => s!.email);
      } else {
        const student = await storage.getStudent(studentIds);
        if (student) recipientEmails = [student.email];
      }

      if (recipientEmails.length === 0) {
        return res.status(400).json({ message: "No recipients found" });
      }

      await NotificationService.sendEmail({
        to: recipientEmails,
        subject,
        message,
        adminId: admin.id
      });

      res.json({ message: "Emails sent successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/notifications/sms", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { studentIds, message } = req.body;
    const admin = req.user as User;

    try {
      let recipientPhones: string[] = [];
      if (studentIds === "all") {
        const students = await storage.getAllStudents();
        recipientPhones = students.map(s => s.contactNumber).filter(p => !!p) as string[];
      } else if (Array.isArray(studentIds)) {
        const students = await Promise.all(studentIds.map(id => storage.getStudent(id)));
        recipientPhones = students.filter(s => !!s && s.contactNumber).map(s => s!.contactNumber!) as string[];
      } else {
        const student = await storage.getStudent(studentIds);
        if (student && student.contactNumber) recipientPhones = [student.contactNumber];
      }

      if (recipientPhones.length === 0) {
        return res.status(400).json({ message: "No recipients found" });
      }

      await NotificationService.sendSMS({
        to: recipientPhones,
        message,
        adminId: admin.id
      });

      res.json({ message: "SMS sent successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/notifications/history", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const history = await storage.getNotifications();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notification history" });
    }
  });

  // Report Endpoints
  app.get("/api/reports/enrollment-stats", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const stats = await storage.getEnrollmentStats();
      res.json(stats);
    } catch (error) {
      console.error("[Reports] Error fetching enrollment stats:", error);
      res.status(500).json({ message: "Failed to fetch enrollment statistics" });
    }
  });

  app.get("/api/reports/enrollment-trends", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const trends = await storage.getEnrollmentTrends(start, end);
      res.json(trends);
    } catch (error) {
      console.error("[Reports] Error fetching enrollment trends:", error);
      res.status(500).json({ message: "Failed to fetch enrollment trends" });
    }
  });

  app.get("/api/reports/demographics", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const demographics = await storage.getStudentDemographics();
      res.json(demographics);
    } catch (error) {
      console.error("[Reports] Error fetching demographics:", error);
      res.status(500).json({ message: "Failed to fetch student demographics" });
    }
  });

  app.get("/api/reports/course-analytics", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const analytics = await storage.getCourseAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("[Reports] Error fetching course analytics:", error);
      res.status(500).json({ message: "Failed to fetch course analytics" });
    }
  });

  // 404 handler for API routes - must be after all other routes
  app.use("/api/", (req, res) => {
    console.log(`[Routes] 404 - API route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: "API endpoint not found" });
  });

  console.log("[Routes] All routes registered");
  return httpServer;
}
