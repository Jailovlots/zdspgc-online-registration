import { useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Check, ChevronRight, ChevronLeft, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Course, Subject } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function StudentRegistration() {
  const { toast } = useToast();
  const { user } = useAuth();
  const student = (user as any)?.student;
  const [step, setStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(student?.yearLevel?.toString() ?? null);
  // Extended student info fields
  const [middleInitial, setMiddleInitial] = useState<string | undefined>(student?.middleInitial ?? "");
  const [suffix, setSuffix] = useState<string | undefined>(student?.suffix ?? "");
  const [dob, setDob] = useState<string | undefined>(student?.dob ?? "");
  const [fatherName, setFatherName] = useState<string | undefined>(student?.fatherName ?? "");
  const [fatherContact, setFatherContact] = useState<string | undefined>(student?.fatherContact ?? "");
  const [motherName, setMotherName] = useState<string | undefined>(student?.motherName ?? "");
  const [motherContact, setMotherContact] = useState<string | undefined>(student?.motherContact ?? "");
  const [guardianName, setGuardianName] = useState<string | undefined>(student?.guardianName ?? "");
  const [guardianContact, setGuardianContact] = useState<string | undefined>(student?.guardianContact ?? "");
  const [previousSchool, setPreviousSchool] = useState<string | undefined>(student?.previousSchool ?? "");
  const [yearGraduated, setYearGraduated] = useState<number | undefined>(student?.yearGraduated ?? undefined);
  const [enrolledSubjects, setEnrolledSubjects] = useState<number[]>([]); // Using IDs as numbers
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects", selectedCourse, selectedYear],
    enabled: !!selectedCourse && !!selectedYear,
    queryFn: async () => {
      const courseId = parseInt(selectedCourse || "0", 10);
      const year = selectedYear ? parseInt(selectedYear, 10) : undefined;
      const url = `/api/subjects?courseId=${courseId}&yearLevel=${year ?? ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return await res.json();
    }
  });

  const enrollMutation = useMutation({
    mutationFn: async (subjectIds: number[]) => {
      await apiRequest("POST", "/api/enroll", { subjectIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] }); // Refresh user to get updated status
      toast({
        title: "Registration Submitted!",
        description: "Your enrollment application has been sent to the registrar for approval.",
      });
      setLocation("/student/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateStudentMutation = useMutation({
    mutationFn: async (payload: any) => {
      const id = student?.id;
      if (!id) throw new Error("Student id not found");
      const res = await fetch(`/api/students/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to update: ${res.status}`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Profile updated", description: "Your information has been saved." });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    }
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSaveAndNext = async () => {
    // Save student info on step 1
    const payload: any = {
      firstName: student?.firstName,
      lastName: student?.lastName,
      middleInitial,
      suffix,
      dob,
      fatherName,
      fatherContact,
      motherName,
      motherContact,
      guardianName,
      guardianContact,
      previousSchool,
      yearGraduated,
    };

    try {
      await updateStudentMutation.mutateAsync(payload);
      setStep(2);
    } catch (err) {
      // error handled in mutation
    }
  };

  const handleSubmit = () => {
    if (enrolledSubjects.length === 0) {
      toast({
        title: "No Subjects Selected",
        description: "Please select at least one subject to enroll.",
        variant: "destructive"
      });
      return;
    }
    enrollMutation.mutate(enrolledSubjects);
  };

  const toggleSubject = (id: number) => {
    setEnrolledSubjects(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Calculate total units
  const totalUnits = subjects?.filter(s => enrolledSubjects.includes(s.id))
    .reduce((sum, s) => sum + s.units, 0) || 0;

  if (!student) return null;

  return (
    <StudentLayout student={student}>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">New Student Registration</h1>
          <p className="text-muted-foreground">Complete your online enrollment for A.Y. 2025-2026</p>
        </div>

        {/* Alert Banner */}
        <Alert className="bg-blue-50 border-blue-200">
          <Clock className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-900 ml-2 font-semibold">Registration Period Open</AlertTitle>
          <AlertDescription className="text-blue-800 ml-2">
            Complete all steps below to finalize your enrollment. Deadline: June 30, 2025
          </AlertDescription>
        </Alert>

        {/* Progress Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { number: 1, title: "Student Info", status: step >= 1 },
            { number: 2, title: "Academic Program", status: step >= 2 },
            { number: 3, title: "Subjects", status: step >= 3 },
            { number: 4, title: "Documents", status: step >= 4 }
          ].map((item) => (
            <Card key={item.number} className={`${item.status ? 'bg-primary/5 border-primary' : 'bg-slate-50'}`}>
              <CardContent className="p-4 text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-white ${item.status ? 'bg-primary' : 'bg-slate-300'}`}>
                  {step > item.number ? <Check className="h-5 w-5" /> : item.number}
                </div>
                <p className={`text-sm font-medium ${item.status ? 'text-primary' : 'text-slate-500'}`}>{item.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form Content - Dashboard Style */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="md:col-span-2">
            <Card>
              {step === 1 && (
                <>
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle>Step 1: Student Information</CardTitle>
                    <CardDescription>Update your personal details and contact information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input defaultValue={student.firstName || ""} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input defaultValue={student.lastName || ""} disabled />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Middle Initial</Label>
                        <Input value={middleInitial} onChange={(e) => setMiddleInitial((e.target as HTMLInputElement).value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Suffix</Label>
                        <Input value={suffix} onChange={(e) => setSuffix((e.target as HTMLInputElement).value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Input type="date" value={dob} onChange={(e) => setDob((e.target as HTMLInputElement).value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Previous School</Label>
                        <Input value={previousSchool} onChange={(e) => setPreviousSchool((e.target as HTMLInputElement).value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Year Graduated</Label>
                        <Input type="number" value={yearGraduated ?? ""} onChange={(e) => setYearGraduated(parseInt((e.target as HTMLInputElement).value || "0", 10) || undefined)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Current Guardian</Label>
                        <Input value={guardianName} onChange={(e) => setGuardianName((e.target as HTMLInputElement).value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Guardian Contact</Label>
                        <Input value={guardianContact} onChange={(e) => setGuardianContact((e.target as HTMLInputElement).value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Father's Name</Label>
                        <Input value={fatherName} onChange={(e) => setFatherName((e.target as HTMLInputElement).value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Father Contact</Label>
                        <Input value={fatherContact} onChange={(e) => setFatherContact((e.target as HTMLInputElement).value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Mother's Name</Label>
                        <Input value={motherName} onChange={(e) => setMotherName((e.target as HTMLInputElement).value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Mother Contact</Label>
                        <Input value={motherContact} onChange={(e) => setMotherContact((e.target as HTMLInputElement).value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <Input defaultValue="Purok 1, Dimataling, Zamboanga Del Sur" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Member Email</Label>
                      <Input defaultValue={student.email} disabled />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Student ID</Label>
                        <Input defaultValue={student.studentId} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label></Label>
                        <div />
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {step === 2 && (
                <>
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle>Step 2: Academic Program</CardTitle>
                    <CardDescription>Select your course and year level.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <Label>Select Course</Label>
                      <Select onValueChange={setSelectedCourse} defaultValue={selectedCourse}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course..." />
                        </SelectTrigger>
                        <SelectContent>
                          {courses?.map(course => (
                            <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Year Level</Label>
                      <Select defaultValue={student.yearLevel?.toString()} onValueChange={(v) => setSelectedYear(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year level..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <Input value="1st Semester, A.Y. 2025-2026" disabled />
                    </div>
                  </CardContent>
                </>
              )}

              {step === 3 && (
                <>
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle>Step 3: Subject Selection</CardTitle>
                    <CardDescription>Select the subjects you want to enroll in.</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="border rounded-md">
                      <div className="grid grid-cols-12 bg-slate-100 p-3 font-medium text-sm text-slate-700">
                        <div className="col-span-1"></div>
                        <div className="col-span-2">Code</div>
                        <div className="col-span-5">Description</div>
                        <div className="col-span-1">Units</div>
                        <div className="col-span-3">Schedule</div>
                      </div>
                      {subjects?.map((subject) => (
                        <div key={subject.id} className="grid grid-cols-12 p-3 border-t items-center text-sm hover:bg-slate-50">
                          <div className="col-span-1">
                            <Checkbox
                              checked={enrolledSubjects.includes(subject.id)}
                              onCheckedChange={() => toggleSubject(subject.id)}
                            />
                          </div>
                          <div className="col-span-2 font-mono text-xs">{subject.code}</div>
                          <div className="col-span-5">{subject.name}</div>
                          <div className="col-span-1">{subject.units}</div>
                          <div className="col-span-3 text-muted-foreground text-xs">{subject.schedule}</div>
                        </div>
                      ))}
                      <div className="p-4 bg-slate-50 border-t flex justify-end items-center gap-4">
                        <span className="text-sm font-medium">Total Units: {totalUnits}</span>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {step === 4 && (
                <>
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <CardTitle>Step 4: Document Upload</CardTitle>
                    <CardDescription>Upload necessary requirements (PDF or JPG).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                          <FileText className="h-6 w-6" />
                        </div>
                        <h4 className="font-semibold">Form 138 / Report Card</h4>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">For Freshmen Only</p>
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-3 w-3" /> Select File
                        </Button>
                      </div>

                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 text-purple-600">
                          <FileText className="h-6 w-6" />
                        </div>
                        <h4 className="font-semibold">Good Moral Certificate</h4>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">Required for all students</p>
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-3 w-3" /> Select File
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-md border border-yellow-200">
                      <Checkbox id="certify" className="mt-1" />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor="certify"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-yellow-900"
                        >
                          I certify that the information provided is true and correct.
                        </label>
                        <p className="text-sm text-yellow-800/80">
                          Any false information may be grounds for rejection of this enrollment application.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              <CardFooter className="flex justify-between border-t p-6 bg-slate-50/50">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1 || enrollMutation.isPending}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>

                {step < 4 ? (
                  <Button onClick={step === 1 ? handleSaveAndNext : handleNext}>
                    Next Step <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="bg-primary hover:bg-primary/90 min-w-[150px]" onClick={handleSubmit} disabled={enrollMutation.isPending}>
                    {enrollMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>Submit Application</>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar - Registration Summary */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
              <CardHeader>
                <CardTitle className="text-white">Registration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Current Step</p>
                  <p className="text-2xl font-bold">Step {step} of 4</p>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(step / 4) * 100}%` }}
                  />
                </div>
                <div className="text-sm text-slate-400">
                  {step === 1 && "Providing your personal information"}
                  {step === 2 && "Selecting your academic "}
                  {step === 3 && "Choosing your subjects"}
                  {step === 4 && "Uploading required documents"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Required Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${step >= 1 ? 'text-green-600' : 'text-slate-300'}`} />
                  <span className={step >= 1 ? 'text-slate-900 font-medium' : 'text-slate-500'}>Student Information</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${step >= 2 ? 'text-green-600' : 'text-slate-300'}`} />
                  <span className={step >= 2 ? 'text-slate-900 font-medium' : 'text-slate-500'}>Program Selection</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${step >= 3 ? 'text-green-600' : 'text-slate-300'}`} />
                  <span className={step >= 3 ? 'text-slate-900 font-medium' : 'text-slate-500'}>Subject Enrollment</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${step >= 4 ? 'text-green-600' : 'text-slate-300'}`} />
                  <span className={step >= 4 ? 'text-slate-900 font-medium' : 'text-slate-500'}>Document Upload</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base text-blue-900">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-blue-800">
                <p>Contact the Registrar Office for any concerns or questions about your registration.</p>
                <p className="mt-2 font-medium">📞 (062) 212-0000</p>
                <p className="font-medium">📧 registrar@zdspgc.edu.ph</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
