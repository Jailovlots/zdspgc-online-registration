import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // student, admin
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  units: integer("units").notNull(),
  schedule: text("schedule").notNull(),
  instructor: text("instructor").notNull(),
  courseId: integer("course_id"),
  yearLevel: integer("year_level").notNull().default(1),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Link to users table
  firstName: text("first_name").notNull(),
  middleInitial: text("middle_initial"),
  suffix: text("suffix"),
  lastName: text("last_name").notNull(),
  dob: text("dob"),
  email: text("email").notNull().unique(),
  studentId: text("student_id").notNull().unique(),
  courseId: integer("course_id"),
  yearLevel: integer("year_level").notNull(),
  fatherName: text("father_name"),
  fatherContact: text("father_contact"),
  motherName: text("mother_name"),
  motherContact: text("mother_contact"),
  guardianName: text("guardian_name"),
  guardianContact: text("guardian_contact"),
  previousSchool: text("previous_school"),
  yearGraduated: integer("year_graduated"),
  status: text("status").notNull().default("pending"), // enrolled, pending, rejected, not-enrolled
  avatar: text("avatar"),
  form138: text("form138"),
  goodMoral: text("good_moral"),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  status: text("status").notNull().default("enrolled"),
});

export const insertUserSchema = createInsertSchema(users);
export const insertCourseSchema = createInsertSchema(courses);
export const insertSubjectSchema = createInsertSchema(subjects);
export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  userId: true,
  status: true,
  form138: true,
  goodMoral: true
});
export const insertEnrollmentSchema = createInsertSchema(enrollments);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

