import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, FileText, ArrowRight, UserCircle, School, Clock, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface NewStudentDashboardProps {
  // student: Student; // Removed props as we use auth hook
}

export function NewStudentDashboard({ }: NewStudentDashboardProps) {
  const { user } = useAuth();
  const student = (user as any)?.student;

  if (!student) return null;

  const isPending = student.status === "pending";
  const progress = isPending ? 66 : 0; // 0% for new, 66% for pending (demo logic)

  const steps = [
    { title: "Account Creation", status: "completed", description: "Your account has been created." },
    { title: "Application Form", status: isPending ? "completed" : "current", description: "Fill out your personal and academic details." },
    { title: "Document Upload", status: isPending ? "completed" : "upcoming", description: "Upload necessary requirements." },
    { title: "Registrar Review", status: isPending ? "current" : "upcoming", description: "Wait for approval from the registrar." },
  ];

  return (
    <StudentLayout student={student}>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 font-serif">
            Welcome to ZDSPGC, {student.firstName}!
          </h1>
          <p className="text-xl text-muted-foreground">
            {isPending
              ? "Your application is currently under review."
              : "Let's get you enrolled for the upcoming semester."}
          </p>
        </div>

        {/* Status Banner */}
        {isPending ? (
          <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400">
            <Clock className="h-5 w-5" />
            <AlertTitle className="font-semibold text-lg ml-2">Application Pending</AlertTitle>
            <AlertDescription className="ml-2 text-yellow-700/80 dark:text-yellow-400/80">
              We have received your application. Please wait 2-3 business days for the registrar to review your documents.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400">
            <School className="h-5 w-5" />
            <AlertTitle className="font-semibold text-lg ml-2">Open Enrollment</AlertTitle>
            <AlertDescription className="ml-2 text-blue-700/80 dark:text-blue-400/80">
              Enrollment for the 1st Semester, A.Y. 2025-2026 is currently open. Start your journey today!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Action Card */}
          <Card className="md:col-span-2 border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Enrollment Progress
              </CardTitle>
              <CardDescription>Track your application status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Overall Progress</span>
                  <span className="text-primary font-bold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>

              <div className="relative space-y-0">
                {/* Vertical line connection - purely visual hack for list feeling */}
                <div className="absolute left-6 top-2 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800" aria-hidden="true" />

                {steps.map((step, i) => (
                  <div key={i} className="relative flex gap-4 pb-8 last:pb-0 group">
                    <div className={`
                      relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4
                      ${step.status === 'completed' ? 'bg-green-100 border-green-50 dark:bg-green-900/20 dark:border-green-900/50 text-green-600' :
                        step.status === 'current' ? 'bg-primary/10 border-white dark:border-slate-950 ring-2 ring-primary text-primary' :
                          'bg-slate-100 border-white dark:bg-slate-800 dark:border-slate-950 text-slate-400'}
                      transition-colors
                    `}>
                      {step.status === 'completed' ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <span className="text-base font-bold">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex flex-col pt-1">
                      <span className={`font-semibold text-lg ${step.status === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {step.title}
                      </span>
                      <span className="text-sm text-muted-foreground">{step.description}</span>

                      {step.status === 'current' && !isPending && (
                        <div className="mt-3">
                          <Link href="/student/registration">
                            <Button className="group">
                              Continue Application
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar / Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <UserCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Registrar's Office</p>
                    <p className="text-muted-foreground">registrar@zdspgc.edu.ph</p>
                    <p className="text-muted-foreground">(062) 991-2345</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Frequently Asked</p>
                    <Link href="/faq" className="text-primary hover:underline">
                      View enrollment requirements
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isPending && (
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-none">
                <CardHeader>
                  <CardTitle className="text-white">Ready to start?</CardTitle>
                  <CardDescription className="text-primary-foreground/90">
                    Submit your application today to secure your slot.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/student/registration">
                    <Button variant="secondary" className="w-full font-semibold shadow-lg">
                      Begin Enrollment
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
