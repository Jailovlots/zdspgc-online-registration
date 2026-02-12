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

  // Personal Information
  firstName: text("first_name").notNull(),
  middleInitial: text("middle_initial").default(""),
  suffix: text("suffix").default(""),
  lastName: text("last_name").notNull(),
  dob: text("dob"),
  sex: text("sex").default(""), // Male/Female
  civilStatus: text("civil_status").default(""), // Single/Married/Widowed
  placeOfBirth: text("place_of_birth").default(""),
  citizenship: text("citizenship").default(""),
  religion: text("religion").default(""),
  email: text("email").notNull().unique(),
  permanentAddress: text("permanent_address").default(""),
  postalCode: text("postal_code").default(""),

  // Academic Information
  studentId: text("student_id").notNull().unique(),
  courseId: integer("course_id"),
  yearLevel: integer("year_level").notNull(),

  // Father Information
  fatherName: text("father_name").default(""),
  fatherContact: text("father_contact").default(""),
  fatherOccupation: text("father_occupation").default(""),
  fatherCompany: text("father_company").default(""),
  fatherHomeAddress: text("father_home_address").default(""),

  // Mother Information
  motherName: text("mother_name").default(""),
  motherContact: text("mother_contact").default(""),
  motherOccupation: text("mother_occupation").default(""),
  motherCompany: text("mother_company").default(""),
  motherHomeAddress: text("mother_home_address").default(""),

  // Guardian Information
  guardianName: text("guardian_name").default(""),
  guardianContact: text("guardian_contact").default(""),
  guardianRelationship: text("guardian_relationship").default(""),
  guardianOccupation: text("guardian_occupation").default(""),
  guardianCompany: text("guardian_company").default(""),
  guardianHomeAddress: text("guardian_home_address").default(""),

  // Emergency Contact
  emergencyContactPerson: text("emergency_contact_person").default(""),
  emergencyContactHome: text("emergency_contact_home").default(""),
  emergencyContactNumber: text("emergency_contact_number").default(""),

  // Educational Background
  elementarySchool: text("elementary_school").default(""),
  elementaryAddress: text("elementary_address").default(""),
  elementaryYearGraduated: integer("elementary_year_graduated").default(0),
  juniorHighSchool: text("junior_high_school").default(""),
  juniorHighAddress: text("junior_high_address").default(""),
  juniorHighYearGraduated: integer("junior_high_year_graduated").default(0),
  seniorHighSchool: text("senior_high_school").default(""),
  seniorHighAddress: text("senior_high_address").default(""),
  seniorHighYearGraduated: integer("senior_high_year_graduated").default(0),

  // Legacy field (kept for backward compatibility)
  previousSchool: text("previous_school").default(""),
  yearGraduated: integer("year_graduated").default(0),

  // Status and Documents
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
}).extend({
  // Personal Information
  middleInitial: z.string().optional().default(""),
  suffix: z.string().optional().default(""),
  dob: z.string().optional(),
  sex: z.string().optional().default(""),
  civilStatus: z.string().optional().default(""),
  placeOfBirth: z.string().optional().default(""),
  citizenship: z.string().optional().default(""),
  religion: z.string().optional().default(""),
  permanentAddress: z.string().optional().default(""),
  postalCode: z.string().optional().default(""),

  // Father Information
  fatherName: z.string().optional().default(""),
  fatherContact: z.string().optional().default(""),
  fatherOccupation: z.string().optional().default(""),
  fatherCompany: z.string().optional().default(""),
  fatherHomeAddress: z.string().optional().default(""),

  // Mother Information
  motherName: z.string().optional().default(""),
  motherContact: z.string().optional().default(""),
  motherOccupation: z.string().optional().default(""),
  motherCompany: z.string().optional().default(""),
  motherHomeAddress: z.string().optional().default(""),

  // Guardian Information
  guardianName: z.string().optional().default(""),
  guardianContact: z.string().optional().default(""),
  guardianRelationship: z.string().optional().default(""),
  guardianOccupation: z.string().optional().default(""),
  guardianCompany: z.string().optional().default(""),
  guardianHomeAddress: z.string().optional().default(""),

  // Emergency Contact
  emergencyContactPerson: z.string().optional().default(""),
  emergencyContactHome: z.string().optional().default(""),
  emergencyContactNumber: z.string().optional().default(""),

  // Educational Background
  elementarySchool: z.string().optional().default(""),
  elementaryAddress: z.string().optional().default(""),
  elementaryYearGraduated: z.number().optional().default(0),
  juniorHighSchool: z.string().optional().default(""),
  juniorHighAddress: z.string().optional().default(""),
  juniorHighYearGraduated: z.number().optional().default(0),
  seniorHighSchool: z.string().optional().default(""),
  seniorHighAddress: z.string().optional().default(""),
  seniorHighYearGraduated: z.number().optional().default(0),

  // Legacy field
  previousSchool: z.string().optional().default(""),
  yearGraduated: z.number().optional().default(0),
  courseId: z.number().optional(),
});
export const insertEnrollmentSchema = createInsertSchema(enrollments);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

