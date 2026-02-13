import React, { useState } from "react";
import Swal from "sweetalert2";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, BookOpen, ChevronRight, ChevronDown } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Course, Subject } from "@shared/schema";

export default function CourseManagement() {
    const { toast } = useToast();
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

    // Fetch data
    const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
        queryKey: ["/api/courses"],
    });

    const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery<Subject[]>({
        queryKey: ["/api/subjects"],
    });

    // Mutations
    const courseMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = editingCourse
                ? await apiRequest("PATCH", `/api/courses/${editingCourse.id}`, data)
                : await apiRequest("POST", "/api/courses", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
            setIsCourseModalOpen(false);
            setEditingCourse(null);
            Swal.fire({
                title: "Success",
                text: `Course ${editingCourse ? "updated" : "created"} successfully`,
                icon: "success",
                confirmButtonColor: "#0f172a",
            });
        }
    });

    const deleteCourseMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/courses/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
            Swal.fire({
                title: "Deleted",
                text: "Course deleted successfully",
                icon: "success",
                confirmButtonColor: "#0f172a",
            });
        }
    });

    const subjectMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = editingSubject
                ? await apiRequest("PATCH", `/api/subjects/${editingSubject.id}`, data)
                : await apiRequest("POST", "/api/subjects", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
            setIsSubjectModalOpen(false);
            setEditingSubject(null);
            Swal.fire({
                title: "Success",
                text: `Subject ${editingSubject ? "updated" : "created"} successfully`,
                icon: "success",
                confirmButtonColor: "#0f172a",
            });
        }
    });

    const deleteSubjectMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/subjects/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/subjects"] });
            Swal.fire({
                title: "Deleted",
                text: "Subject deleted successfully",
                icon: "success",
                confirmButtonColor: "#0f172a",
            });
        }
    });

    const toggleExpand = (id: number) => {
        const newExpanded = new Set(expandedCourses);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedCourses(newExpanded);
    };

    const handleCourseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            code: formData.get("code"),
            name: formData.get("name"),
            description: formData.get("description"),
        };
        courseMutation.mutate(data);
    };

    const handleSubjectSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            code: formData.get("code"),
            name: formData.get("name"),
            units: parseInt(formData.get("units") as string),
            schedule: formData.get("schedule"),
            instructor: formData.get("instructor"),
            yearLevel: parseInt(formData.get("yearLevel") as string),
            courseId: selectedCourseId,
        };
        subjectMutation.mutate(data);
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-serif">Curriculum Management</h1>
                        <p className="text-muted-foreground">Manage courses and their corresponding subjects.</p>
                    </div>
                    <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingCourse(null)} className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" /> Add Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
                                <DialogDescription>Enter the course details below.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCourseSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Course Code</label>
                                    <Input name="code" defaultValue={editingCourse?.code} placeholder="e.g. BSIS" required className="uppercase" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Course Name</label>
                                    <Input name="name" defaultValue={editingCourse?.name} placeholder="e.g. Bachelor of Science in Information System" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea name="description" defaultValue={editingCourse?.description} required />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsCourseModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" disabled={courseMutation.isPending}>
                                        {courseMutation.isPending ? "Saving..." : "Save Course"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50">
                                <TableHead className="w-10"></TableHead>
                                <TableHead className="w-24">Code</TableHead>
                                <TableHead>Course Name</TableHead>
                                <TableHead className="hidden md:table-cell">Description</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map((course) => (
                                <React.Fragment key={course.id}>
                                    <TableRow className="cursor-pointer hover:bg-slate-50/50" onClick={() => toggleExpand(course.id)}>
                                        <TableCell>
                                            {expandedCourses.has(course.id) ? (
                                                <ChevronDown className="h-4 w-4 text-slate-400" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 text-slate-400" />
                                            )}
                                        </TableCell>
                                        <TableCell className="font-bold text-primary">{course.code}</TableCell>
                                        <TableCell className="font-medium">{course.name}</TableCell>
                                        <TableCell className="text-slate-500 text-sm hidden md:table-cell truncate max-w-xs">{course.description}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button size="icon" variant="ghost" onClick={() => {
                                                    setEditingCourse(course);
                                                    setIsCourseModalOpen(true);
                                                }}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => {
                                                    Swal.fire({
                                                        title: "Are you sure?",
                                                        text: "This will permanently delete the course and all its subjects.",
                                                        icon: "warning",
                                                        showCancelButton: true,
                                                        confirmButtonColor: "#ef4444",
                                                        cancelButtonColor: "#64748b",
                                                        confirmButtonText: "Yes, delete it!"
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            deleteCourseMutation.mutate(course.id);
                                                        }
                                                    });
                                                }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {expandedCourses.has(course.id) && (
                                        <TableRow className="bg-slate-50/30">
                                            <TableCell colSpan={5} className="p-0">
                                                <div className="px-12 py-4 border-l-4 border-primary/20">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 inline-flex items-center">
                                                            <BookOpen className="mr-2 h-4 w-4" /> Subjects for {course.code}
                                                        </h3>
                                                        <Button size="sm" variant="outline" onClick={() => {
                                                            setSelectedCourseId(course.id);
                                                            setEditingSubject(null);
                                                            setIsSubjectModalOpen(true);
                                                        }}>
                                                            <Plus className="mr-1 h-3 w-3" /> Add Subject
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-6">
                                                        {[1, 2, 3, 4].map((year) => {
                                                            const yearSubjects = subjects.filter(s => s.courseId === course.id && s.yearLevel === year);
                                                            if (yearSubjects.length === 0) return null;

                                                            return (
                                                                <div key={year} className="space-y-2">
                                                                    <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase text-slate-600">
                                                                        <span className="w-2 h-2 rounded-full bg-primary/40"></span>
                                                                        {year === 1 ? "1st Year" : year === 2 ? "2nd Year" : year === 3 ? "3rd Year" : "4th Year"}
                                                                    </div>
                                                                    <div className="rounded-md border overflow-hidden bg-white shadow-sm">
                                                                        <Table>
                                                                            <TableHeader>
                                                                                <TableRow className="bg-slate-50/50 h-8">
                                                                                    <TableHead className="text-[10px] uppercase w-24">Code</TableHead>
                                                                                    <TableHead className="text-[10px] uppercase">Subject Name</TableHead>
                                                                                    <TableHead className="text-[10px] uppercase text-center w-20">Units</TableHead>
                                                                                    <TableHead className="text-[10px] uppercase w-40">Schedule</TableHead>
                                                                                    <TableHead className="text-[10px] uppercase text-right w-20">Actions</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {yearSubjects.map(subject => (
                                                                                    <TableRow key={subject.id} className="h-10 hover:bg-slate-50/30">
                                                                                        <TableCell className="text-xs font-mono font-bold text-slate-700">{subject.code}</TableCell>
                                                                                        <TableCell className="text-xs font-medium">{subject.name}</TableCell>
                                                                                        <TableCell className="text-xs text-center">{subject.units}</TableCell>
                                                                                        <TableCell className="text-xs text-slate-500">{subject.schedule}</TableCell>
                                                                                        <TableCell className="text-right">
                                                                                            <div className="flex justify-end gap-1">
                                                                                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                                                                                                    setSelectedCourseId(course.id);
                                                                                                    setEditingSubject(subject);
                                                                                                    setIsSubjectModalOpen(true);
                                                                                                }}>
                                                                                                    <Pencil className="h-3 w-3" />
                                                                                                </Button>
                                                                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => {
                                                                                                    Swal.fire({
                                                                                                        title: "Delete Subject?",
                                                                                                        text: "You cannot undo this action.",
                                                                                                        icon: "warning",
                                                                                                        showCancelButton: true,
                                                                                                        confirmButtonColor: "#ef4444",
                                                                                                        cancelButtonColor: "#64748b",
                                                                                                        confirmButtonText: "Yes, delete it!"
                                                                                                    }).then((result) => {
                                                                                                        if (result.isConfirmed) {
                                                                                                            deleteSubjectMutation.mutate(subject.id);
                                                                                                        }
                                                                                                    });
                                                                                                }}>
                                                                                                    <Trash2 className="h-3 w-3" />
                                                                                                </Button>
                                                                                            </div>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ))}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {subjects.filter(s => s.courseId === course.id).length === 0 && (
                                                            <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed text-slate-400 text-sm italic">
                                                                No subjects have been added to this curriculum yet.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={isSubjectModalOpen} onOpenChange={setIsSubjectModalOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingSubject ? "Edit Subject" : "Add New Subject"}</DialogTitle>
                            <DialogDescription>Add a subject to the selected course curriculum.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubjectSubmit} className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2 col-span-1">
                                <label className="text-sm font-medium">Subject Code</label>
                                <Input name="code" defaultValue={editingSubject?.code} placeholder="e.g. IT 101" required className="uppercase" />
                            </div>
                            <div className="space-y-2 col-span-1">
                                <label className="text-sm font-medium">Units</label>
                                <Input name="units" type="number" defaultValue={editingSubject?.units} min="1" max="6" required />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium">Subject Name</label>
                                <Input name="name" defaultValue={editingSubject?.name} required />
                            </div>
                            <div className="space-y-2 col-span-1">
                                <label className="text-sm font-medium">Year Level</label>
                                <select
                                    name="yearLevel"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    defaultValue={editingSubject?.yearLevel}
                                >
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                            <div className="space-y-2 col-span-1">
                                <label className="text-sm font-medium">Schedule</label>
                                <Input name="schedule" defaultValue={editingSubject?.schedule} placeholder="e.g. MWF 8-9AM" required />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium">Instructor</label>
                                <Input name="instructor" defaultValue={editingSubject?.instructor} placeholder="e.g. Prof. Smith" required />
                            </div>
                            <div className="col-span-2 flex justify-end gap-2 mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsSubjectModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={subjectMutation.isPending}>
                                    {subjectMutation.isPending ? "Saving..." : "Save Subject"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}

