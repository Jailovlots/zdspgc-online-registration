import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertStudentSchema, type User } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  hashPassword,
  comparePasswords,
  generateToken,
  authMiddleware,
  roleMiddleware
} from "./auth";
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
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const ipAddress = req.ip;

    try {
      const user = await storage.getUserByUsername(username);

      if (!user || !(await comparePasswords(password, user.password))) {
        if (user) {
          await storage.logLoginAttempt({
            userId: user.id,
            success: false,
            ipAddress,
          });
        }
        return res.status(401).json({ message: "Invalid credentials" });
      }

      await storage.logLoginAttempt({
        userId: user.id,
        success: true,
        ipAddress,
      });

      const token = generateToken(user);
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
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

      const token = generateToken(user);
      res.status(201).json({ user, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json(error.issues);
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get("/api/user", authMiddleware, async (req, res) => {
    const user = req.user as User;
    if (user.role === "student") {
      const student = await storage.getStudentByUserId(user.id);
      return res.json({ ...user, student });
    }
    res.json(user);
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
        username: req.body.email, // using email as username
        password: req.body.password,
        role: "student"
      });

      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        console.log("[Registration] Email already registered:", userData.username);
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser(userData);
      console.log("[Registration] User created:", user.id);

      // 2. Create Student
      const studentData = insertStudentSchema.parse({
        ...req.body,
        userId: user.id
      });

      const student = await storage.createStudent(user.id, studentData);
      console.log("[Registration] Student profile created:", student.id);

      // Auto login after registration (JWT based)
      console.log("[Registration] Successful registration for:", user.username);
      res.status(201).json({ ...user, student });
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
    const field = req.body.field; // form138, goodMoral, psa, diploma

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!["form138", "goodMoral", "psa", "diploma"].includes(field)) {
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

  app.get("/api/students", async (req, res) => {
    // Only admin should see all students
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") {
      return res.sendStatus(403);
    }
    const students = await storage.getAllStudents();
    res.json(students);
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

  app.get("/api/students/:id/enrollments", authMiddleware, async (req, res) => {
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
  app.post("/api/admin/notifications/email", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
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

  app.post("/api/admin/notifications/sms", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
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

  app.get("/api/admin/notifications/history", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
      const history = await storage.getNotifications();
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notification history" });
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
