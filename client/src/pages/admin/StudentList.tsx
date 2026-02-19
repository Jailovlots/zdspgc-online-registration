import { useState, useRef } from "react";
import { useLocation } from "wouter";
import Swal from "sweetalert2";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, EyeOff, Check, X, MoreHorizontal, FileText, Plus, BookOpen, Users, FileDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { COE } from "@/components/COE";
import { AdmissionForm } from "@/components/AdmissionForm";
import { printComponent } from "@/lib/print-utils";
import { StudentAdmissionRecord } from "@/components/StudentAdmissionRecord";

export default function StudentList() {
  const { toast } = useToast();
  const recordRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentData, setNewStudentData] = useState<any>({
    firstName: "", lastName: "", middleInitial: "", email: "", password: "",
    yearLevel: 1, status: "enrolled", sex: "Male", civilStatus: "Single"
  });

  const [location] = useLocation();
  const isEnrollmentView = location === "/admin/enrollments";

  const [isAssigningSubjects, setIsAssigningSubjects] = useState<any>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [subjectYearFilter, setSubjectYearFilter] = useState<number | 'all'>('all');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [subjectCourseFilter, setSubjectCourseFilter] = useState<number | 'all'>('all');

  const { data: allSubjects = [] } = useQuery<any[]>({
    queryKey: ["/api/subjects"],
  });

  const handleAssignSubjects = async () => {
    if (!isAssigningSubjects) return;
    try {
      const response = await fetch(`/api/students/${isAssigningSubjects.id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectIds: selectedSubjects }),
      });

      if (response.ok) {
        Swal.fire("Success!", "Subjects assigned successfully.", "success");
        setIsAssigningSubjects(null);
        setSelectedSubjects([]);
        refetchStudents();
      } else {
        throw new Error("Failed to assign subjects");
      }
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    }
  };

  // Fetch students from API
  const { data: students = [], refetch: refetchStudents } = useQuery<any[]>({
    queryKey: ["/api/students"],
  });

  // Fetch courses for display
  const { data: courses = [] } = useQuery<any[]>({
    queryKey: ["/api/courses"],
  });

  const sections = Array.from(new Set(students.map(s => s.section).filter(Boolean))) as string[];

  const filteredStudents = students.filter((student: any) => {
    // Basic search filtering
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.includes(searchTerm);

    const matchesYear = yearFilter === "all" || student.yearLevel.toString() === yearFilter;
    const matchesSection = sectionFilter === "all" || student.section === sectionFilter;
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesProgram = programFilter === "all" || student.courseId?.toString() === programFilter;

    // If we're in the enrollment view, only show pending students
    if (isEnrollmentView) {
      return matchesSearch && student.status === "pending";
    }

    // In student list view, EXCLUDE pending students (only show accepted/enrolled)
    const excludePending = student.status !== "pending";
    return matchesSearch && matchesYear && matchesSection && matchesStatus && matchesProgram && excludePending;
  });

  // Filter subjects for dialog
  const filteredSubjectsForDialog = allSubjects.filter(s => {
    if (!isAssigningSubjects) return false;

    // Filter by selected course (or student's course if not changed)
    if (subjectCourseFilter !== 'all' && s.courseId !== subjectCourseFilter) return false;

    if (subjectYearFilter !== 'all' && s.yearLevel !== subjectYearFilter) return false;
    return true;
  });

  // Calculate total units
  const totalUnits = selectedSubjects.reduce((sum, subjectId) => {
    const subject = allSubjects.find(s => s.id === subjectId);
    return sum + (subject?.units || 0);
  }, 0);

  const handleUpdate = async (id: number, data: any) => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Student updated successfully." });
        setEditingStudent(null);
        refetchStudents();
      } else {
        throw new Error("Failed to update student");
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not update student.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: "Delete Student?",
      text: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/students/${id}`, { method: "DELETE" });
        if (response.ok) {
          Swal.fire("Deleted!", "Student has been removed.", "success");
          refetchStudents();
        } else {
          throw new Error("Failed to delete");
        }
      } catch (error) {
        Swal.fire("Error!", "Could not delete student.", "error");
      }
    }
  };

  const handleAction = async (id: number, action: string, name: string) => {
    const statusMap: Record<string, string> = {
      "Approved": "enrolled",
      "Rejected": "rejected"
    };

    const confirm = await Swal.fire({
      title: `${action} Enrollment?`,
      text: `Are you sure you want to ${action.toLowerCase()} ${name}'s application?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: action === "Approved" ? "#16a34a" : "#dc2626",
    });

    if (confirm.isConfirmed) {
      await handleUpdate(id, { status: statusMap[action] });
      Swal.fire({
        title: `Student ${action}`,
        text: `Successfully ${action.toLowerCase()} ${name}'s enrollment.`,
        icon: action === "Approved" ? "success" : "error",
        confirmButtonColor: "#0f172a",
      });
    }
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleCreateStudent = async () => {
    try {
      if (!newStudentData.email || !newStudentData.password || !newStudentData.firstName || !newStudentData.lastName) {
        toast({ title: "Validation Error", description: "Please fill in email, password, and name.", variant: "destructive" });
        return;
      }

      // 1. Create the student record first
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudentData),
      });

      if (response.ok) {
        const createdStudent = await response.json();

        // 2. If a file was selected, upload it now using the new student's ID
        if (selectedFile && createdStudent.student?.id) {
          const formData = new FormData();
          formData.append("file", selectedFile);
          formData.append("field", "avatar");

          await fetch(`/api/students/${createdStudent.student.id}/upload`, {
            method: "POST",
            body: formData,
          });
        }

        Swal.fire({
          title: "Student Created!",
          text: "Student record created successfully. Proceeding to subject enrollment.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });

        setIsAddingStudent(false);
        setNewStudentData({
          firstName: "", lastName: "", middleInitial: "", email: "", password: "",
          yearLevel: 1, status: "enrolled", sex: "Male", civilStatus: "Single"
        });
        setSelectedFile(null); // Clear the file
        await refetchStudents();

        // Auto-open Manage Subjects dialog
        // We need to use the student data we just created (or at least the parts we know)
        // ideally we use the full student object from the response, but createdStudent.student is what we have
        const studentToEnroll = createdStudent.student;
        setIsAssigningSubjects(studentToEnroll);

        // Default to student's course and year
        setSubjectCourseFilter(studentToEnroll.courseId);
        setSubjectYearFilter(studentToEnroll.yearLevel || 1);

        // Since it's a new student, they have no subjects yet, so we clear selection
        setSelectedSubjects([]);

      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create student");
      }
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handlePrint = () => {
    printComponent(recordRef, `Student Record - ${editingStudent?.lastName}, ${editingStudent?.firstName}`);
  };

  const handleExport = async (format: 'csv' = 'csv') => {
    try {
      const params = new URLSearchParams({
        format,
        yearLevel: yearFilter,
        section: sectionFilter,
        status: statusFilter,
      });

      const response = await fetch(`/api/students/export?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Successful',
        description: `Downloaded ${filteredStudents.length} student records.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Could not export student data.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkSectionAssign = async (section: string) => {
    try {
      await Promise.all(
        selectedStudents.map(id =>
          fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ section }),
            credentials: 'include',
          })
        )
      );
      Swal.fire('Success!', `Assigned ${selectedStudents.length} students to ${section}`, 'success');
      setSelectedStudents([]);
      refetchStudents();
    } catch (error) {
      Swal.fire('Error', 'Failed to assign sections', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-serif">
              {isEnrollmentView ? "Pending Enrollments" : "Student Records"}
            </h1>
            <p className="text-muted-foreground">
              {isEnrollmentView
                ? "Review and approve new student applications."
                : "Manage student enrollments and records."}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEnrollmentView && (
              <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="mr-2 h-4 w-4" /> Add New Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Encode New Student Details</DialogTitle>
                    <p className="text-sm text-muted-foreground">This will create a new user account and student profile.</p>
                  </DialogHeader>
                  <div className="bg-slate-50 p-6 rounded-lg space-y-6">
                    <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded border">
                      <div className="space-y-1.5">
                        <Label>Email Address (Username)</Label>
                        <Input value={newStudentData.email} onChange={e => setNewStudentData((p: any) => ({ ...p, email: e.target.value }))} placeholder="student@example.com" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Temporary Password</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            value={newStudentData.password}
                            onChange={e => setNewStudentData((p: any) => ({ ...p, password: e.target.value }))}
                            placeholder="••••••••"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <AdmissionForm
                      formData={newStudentData}
                      onChange={(field, value) => setNewStudentData((prev: any) => ({ ...prev, [field]: value }))}
                      pledgeAccepted={true}
                      onPledgeToggle={() => { }}
                      onFileSelect={setSelectedFile}
                    />
                    <div className="flex justify-end gap-3 mt-6">
                      <Button variant="outline" onClick={() => setIsAddingStudent(false)}>Cancel</Button>
                      <Button onClick={handleCreateStudent} className="bg-green-600 hover:bg-green-700">Create Record</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  {isEnrollmentView ? "Export Pending" : "Export Report"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => {
                  if (isEnrollmentView) {
                    // For pending view, force status=pending and export
                    const params = new URLSearchParams({
                      format: 'csv',
                      status: 'pending'
                    });
                    window.location.href = `/api/students/export?${params.toString()}`;
                  } else {
                    handleExport('csv');
                  }
                }}>
                  <FileText className="mr-2 h-4 w-4" /> Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 py-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {!isEnrollmentView && (
            <>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Year Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sectionFilter} onValueChange={setSectionFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {courses.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                {!isEnrollmentView && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onCheckedChange={(checked) => {
                        setSelectedStudents(checked ? filteredStudents.map((s: any) => s.id) : []);
                      }}
                    />
                  </TableHead>
                )}
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Program / Course</TableHead>
                <TableHead>Year & Section</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student: any) => {
                  const course = courses.find((c: any) => c.id === student.courseId);
                  return (
                    <TableRow key={student.id}>
                      {!isEnrollmentView && (
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => {
                              setSelectedStudents(prev =>
                                checked ? [...prev, student.id] : prev.filter(id => id !== student.id)
                              );
                            }}
                          />
                        </TableCell>
                      )}
                      <TableCell className="font-mono">{student.studentId}</TableCell>
                      <TableCell className="font-medium">{student.lastName}, {student.firstName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{course?.code}</span>
                          <span className="text-xs text-muted-foreground">{course?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.yearLevel} - {student.section || "Unassigned"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student.status === "enrolled" || student.status === "active" ? "default" :
                              student.status === "pending" ? "outline" :
                                student.status === "graduated" ? "secondary" :
                                  "destructive"
                          }
                          className={
                            student.status === "enrolled" || student.status === "active" ? "bg-green-600 hover:bg-green-700" :
                              student.status === "pending" ? "text-yellow-600 border-yellow-600 bg-yellow-50" :
                                student.status === "graduated" ? "bg-blue-600 hover:bg-blue-700 text-white" :
                                  ""
                          }
                        >
                          {student.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(student.studentId)}>
                              Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />

                            {/* Edit Action */}
                            <Dialog open={editingStudent?.id === student.id} onOpenChange={(open) => setEditingStudent(open ? student : null)}>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Eye className="mr-2 h-4 w-4" /> View / Edit Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Update Student Record</DialogTitle>
                                </DialogHeader>
                                <div className="bg-slate-50 p-6 rounded-lg">
                                  <AdmissionForm
                                    formData={editingStudent || student}
                                    onChange={(field, value) => setEditingStudent((prev: any) => ({ ...prev, [field]: value }))}
                                    pledgeAccepted={true}
                                    onPledgeToggle={() => { }}
                                  />
                                  {/* Printable Record (Hidden in View, Visible in Print) */}
                                  <div className="hidden">
                                    <div ref={recordRef}>
                                      <StudentAdmissionRecord student={editingStudent || student} courses={courses} />
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="outline" onClick={handlePrint}>Print Record</Button>
                                    <Button variant="outline" onClick={() => setEditingStudent(null)}>Cancel</Button>
                                    <Button onClick={() => handleUpdate(student.id, editingStudent)}>Save Changes</Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => {
                              setIsAssigningSubjects(student);
                              // Default filters to student's current course/year
                              setSubjectCourseFilter(student.courseId || 'all');
                              setSubjectYearFilter(student.yearLevel);

                              fetch(`/api/students/${student.id}/enrollments`)
                                .then(res => res.json())
                                .then(data => setSelectedSubjects(data.map((e: any) => e.subjectId)));
                            }}>
                              <BookOpen className="mr-2 h-4 w-4" /> Manage Subjects
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              Swal.fire({
                                title: 'Assign Section',
                                input: 'text',
                                inputLabel: `Assign section for ${student.firstName} ${student.lastName}`,
                                inputPlaceholder: 'e.g., Section A, Section B',
                                inputValue: student.section || '',
                                showCancelButton: true,
                                confirmButtonText: 'Assign',
                                confirmButtonColor: '#0f172a',
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  handleUpdate(student.id, { section: result.value });
                                }
                              });
                            }}>
                              <Users className="mr-2 h-4 w-4" /> Assign Section
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground uppercase">Update Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleUpdate(student.id, { status: "active" })}>
                              Set as Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdate(student.id, { status: "inactive" })}>
                              Set as Inactive
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdate(student.id, { status: "graduated" })}>
                              Archive as Graduated
                            </DropdownMenuItem>

                            {student.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-green-600" onClick={() => handleAction(student.id, "Approved", student.firstName)}>
                                  <Check className="mr-2 h-4 w-4" /> Approve Enrollment
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleAction(student.id, "Rejected", student.firstName)}>
                                  <X className="mr-2 h-4 w-4" /> Reject Enrollment
                                </DropdownMenuItem>
                              </>
                            )}

                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)}>
                              <X className="mr-2 h-4 w-4" /> Delete Account
                            </DropdownMenuItem>

                            {student.status === "enrolled" && (
                              <>
                                <DropdownMenuSeparator />
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <FileText className="mr-2 h-4 w-4" /> View COE
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Certificate of Enrollment</DialogTitle>
                                    </DialogHeader>
                                    <COE student={student} course={course} isAdmin={true} />
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={isEnrollmentView ? 6 : 7} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Subject Assignment Dialog */}
        <Dialog open={!!isAssigningSubjects} onOpenChange={(open) => !open && setIsAssigningSubjects(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Manage Subjects - {isAssigningSubjects?.firstName} {isAssigningSubjects?.lastName}</DialogTitle>
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <Badge variant="outline">
                  {courses.find((c: any) => c.id === isAssigningSubjects?.courseId)?.name}
                </Badge>
                <Badge variant="secondary">
                  Year {isAssigningSubjects?.yearLevel}
                </Badge>
                <Badge className="bg-blue-600">
                  {selectedSubjects.length} subjects selected
                </Badge>
              </div>
            </DialogHeader>

            {/* Filters */}
            <div className="flex flex-col gap-4 px-6">
              <div className="flex items-center gap-4">
                <div className="w-[200px]">
                  <Label className="text-xs mb-1 block text-muted-foreground">Filter by Course</Label>
                  <Select
                    value={subjectCourseFilter?.toString() || 'all'}
                    onValueChange={(val) => setSubjectCourseFilter(val === 'all' ? 'all' : parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={subjectYearFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setSubjectYearFilter('all')}
                >
                  All Years
                </Button>
                {[1, 2, 3, 4].map(year => (
                  <Button
                    key={year}
                    size="sm"
                    variant={subjectYearFilter === year ? 'default' : 'outline'}
                    onClick={() => setSubjectYearFilter(year)}
                  >
                    Year {year}
                  </Button>
                ))}

              </div>

              <div className="flex-1 overflow-y-auto px-6">
                <div className="grid gap-2">
                  {filteredSubjectsForDialog.map((subject: any) => (
                    <div key={subject.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-slate-50 transition-colors">
                      <Checkbox
                        id={`subject-${subject.id}`}
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={(checked) => {
                          setSelectedSubjects(prev =>
                            checked
                              ? [...prev, subject.id]
                              : prev.filter(id => id !== subject.id)
                          );
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{subject.code}</span>
                          <Badge variant="outline" className="text-xs">Year {subject.yearLevel}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">{subject.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {subject.units} Units • {subject.schedule} • {subject.instructor}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredSubjectsForDialog.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No subjects found for the selected filters.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center px-6 py-4 border-t bg-slate-50">
                <div className="text-sm text-muted-foreground">
                  Total Units: <span className="font-bold">{totalUnits}</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setIsAssigningSubjects(null)}>Cancel</Button>
                  <Button onClick={handleAssignSubjects} className="bg-primary hover:bg-primary/90">Save Assignment</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Actions Bar */}
        {
          selectedStudents.length > 0 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-4 z-50 animate-in slide-in-from-bottom">
              <span className="font-medium">{selectedStudents.length} selected</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  Swal.fire({
                    title: 'Bulk Assign Section',
                    input: 'text',
                    inputLabel: `Assign section for ${selectedStudents.length} students`,
                    inputPlaceholder: 'e.g., Section A',
                    showCancelButton: true,
                    confirmButtonText: 'Assign',
                    confirmButtonColor: '#0f172a',
                  }).then((result) => {
                    if (result.isConfirmed && result.value) {
                      handleBulkSectionAssign(result.value);
                    }
                  });
                }}
              >
                <Users className="mr-2 h-4 w-4" /> Assign Section
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="hover:bg-slate-800"
                onClick={() => setSelectedStudents([])}
              >
                Clear
              </Button>
            </div>
          )
        }
      </div >
    </AdminLayout >
  );
}
