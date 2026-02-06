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
      res.sendStatus(200);
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
  app.get("/api/courses", async (_req, res) => {
    const courses = await storage.getCourses();
    res.json(courses);
  });

  app.get("/api/subjects", async (req, res) => {
    const courseId = req.query.courseId ? parseInt(req.query.courseId as string) : undefined;
    // For now getSubjects ignores courseId but we pass it for future proofing
    const subjects = await storage.getSubjects(courseId || 0);
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
