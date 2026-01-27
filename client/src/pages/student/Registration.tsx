import { useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { COURSES, SUBJECTS } from "@/lib/mock-data";
import { Loader2, Upload, FileText, Check, ChevronRight, ChevronLeft } from "lucide-react";

export default function StudentRegistration() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrolledSubjects, setEnrolledSubjects] = useState<string[]>([]);

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Registration Submitted!",
        description: "Your enrollment application has been sent to the registrar for approval.",
      });
      // Reset or redirect logic here
    }, 2000);
  };

  const toggleSubject = (id: string) => {
    setEnrolledSubjects(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-serif">Online Registration</h1>
          <p className="text-muted-foreground">Complete the steps below to enroll for the upcoming semester.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div 
                className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-colors ${
                  step >= i ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > i ? <Check className="h-5 w-5" /> : i}
              </div>
              {i < 4 && (
                <div 
                  className={`w-16 h-1 mx-2 transition-colors ${
                    step > i ? "bg-primary" : "bg-slate-200"
                  }`} 
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle>Step 1: Student Information</CardTitle>
                <CardDescription>Update your personal details and contact information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input defaultValue="Juan" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input defaultValue="Dela Cruz" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input defaultValue="Purok 1, Dimataling, Zamboanga Del Sur" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Number</Label>
                    <Input defaultValue="09123456789" />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>Step 2: Academic Program</CardTitle>
                <CardDescription>Select your course and year level.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Select Course / Program</Label>
                  <Select onValueChange={setSelectedCourse} defaultValue={selectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSES.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year Level</Label>
                  <Select>
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
              <CardHeader>
                <CardTitle>Step 3: Subject Selection</CardTitle>
                <CardDescription>Select the subjects you want to enroll in.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <div className="grid grid-cols-12 bg-slate-100 p-3 font-medium text-sm text-slate-700">
                    <div className="col-span-1"></div>
                    <div className="col-span-2">Code</div>
                    <div className="col-span-5">Description</div>
                    <div className="col-span-1">Units</div>
                    <div className="col-span-3">Schedule</div>
                  </div>
                  {SUBJECTS.map((subject) => (
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
                     <span className="text-sm font-medium">Total Units: {enrolledSubjects.length * 3}</span>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>Step 4: Document Upload</CardTitle>
                <CardDescription>Upload necessary requirements (PDF or JPG).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
              disabled={step === 1 || isSubmitting}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            {step < 4 ? (
              <Button onClick={handleNext}>
                Next Step <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button className="bg-primary hover:bg-primary/90 min-w-[150px]" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
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
    </StudentLayout>
  );
}
