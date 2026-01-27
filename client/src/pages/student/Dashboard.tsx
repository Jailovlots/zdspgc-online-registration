import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MOCK_STUDENTS, COURSES } from "@/lib/mock-data";
import { AlertCircle, CheckCircle2, Clock, FileText, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function StudentDashboard() {
  // Mock logged in user
  const student = MOCK_STUDENTS[0]; 
  const course = COURSES.find(c => c.id === student.courseId);

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {student.firstName}!</p>
        </div>

        {/* Status Banner */}
        <Alert className="bg-primary/5 border-primary/20 text-primary">
          <CheckCircle2 className="h-5 w-5" />
          <AlertTitle className="font-semibold text-lg ml-2">You are officially enrolled!</AlertTitle>
          <AlertDescription className="ml-2 text-primary/80">
             Your enrollment for the 1st Semester, A.Y. 2025-2026 has been approved. You can now view your schedule.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Student ID</dt>
                  <dd className="text-lg font-semibold">{student.studentId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Course</dt>
                  <dd className="text-lg font-semibold">{course?.code}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Year Level</dt>
                  <dd className="text-lg font-semibold">{student.yearLevel === 1 ? '1st Year' : `${student.yearLevel}nd Year`}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Semester</dt>
                  <dd className="text-lg font-semibold">1st Semester</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Program Name</dt>
                  <dd className="text-lg font-semibold">{course?.name}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-900 text-white border-none">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-slate-400">Common tasks you might need.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/student/schedule">
                <Button variant="secondary" className="w-full justify-between group">
                  View Schedule
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/student/grades">
                <Button variant="outline" className="w-full justify-between bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white group">
                  View Grades
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/student/registration">
                <Button variant="outline" className="w-full justify-between bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white group">
                  Enrollment History
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Enrollment Progress Tracker (for demo purposes even if enrolled) */}
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Steps</CardTitle>
            <CardDescription>Track the status of your enrollment process.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress: 100%</span>
                  <span className="text-primary font-bold">Completed</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { title: "Profile Update", status: "completed" },
                  { title: "Course Selection", status: "completed" },
                  { title: "Document Upload", status: "completed" },
                  { title: "Registrar Approval", status: "completed" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-slate-50/50">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
