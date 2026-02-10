import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertStudentSchema } from "@shared/schema";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || user.password !== password) { // In real app, compare hashed password
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, (user as any).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth Routes
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);

      // Destroy the session on logout and clear the cookie so client is fully logged out
      req.session?.destroy((destroyErr) => {
        if (destroyErr) return next(destroyErr);
        res.clearCookie("connect.sid");
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // If it's a student, fetch student details
    const user = req.user as any;
    if (user.role === "student") {
      const student = await storage.getStudentByUserId(user.id);
      return res.json({ ...user, student });
    }

    res.json(user);
  });

  // Data Routes
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/debug/users", async (_req, res) => {
      try {
        const users = await storage.getAllUsers();
        res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role })));
      } catch (err) {
        res.status(500).json({ message: "debug failed" });
      }
    });
  }

  app.get("/api/courses", async (_req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.get("/api/subjects", async (req, res) => {
    const courseId = req.query.courseId ? parseInt(req.query.courseId as string) : undefined;
    const yearLevel = req.query.yearLevel ? parseInt(req.query.yearLevel as string) : undefined;
    const subjects = await storage.getSubjects(courseId, yearLevel);
    res.json(subjects);
  });

  app.post("/api/students", async (req, res) => {
    try {
      // Combined registration: User + Student
      // 1. Create User
      const userData = insertUserSchema.parse({
        username: req.body.email, // using email as username
        password: req.body.password,
        role: "student"
      });

      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const user = await storage.createUser(userData);

      // 2. Create Student
      const studentData = insertStudentSchema.parse({
        ...req.body,
        userId: user.id
      });

      const student = await storage.createStudent(user.id, studentData);

      // Auto login after registration
      req.login(user, (err) => {
        if (err) throw err;
        res.status(201).json({ ...user, student });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(error.issues);
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const id = parseInt(req.params.id, 10);
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

  app.get("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const user = req.user as any;
    const student = await storage.getStudentByUserId(user.id);

    if (!student) return res.json([]); // Or 404

    const enrollments = await storage.getStudentEnrollments(student.id);
    res.json(enrollments);
  });

  return httpServer;
}
