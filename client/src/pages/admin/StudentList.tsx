import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_STUDENTS, COURSES } from "@/lib/mock-data";
import { Search, Eye, Check, X, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function StudentList() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = MOCK_STUDENTS.filter(student => 
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.includes(searchTerm)
  );

  const handleAction = (action: string, name: string) => {
    toast({
      title: `Student ${action}`,
      description: `Successfully ${action.toLowerCase()} ${name}'s enrollment.`,
      variant: action === "Rejected" ? "destructive" : "default",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
             <h1 className="text-3xl font-bold text-slate-900 font-serif">Student Records</h1>
             <p className="text-muted-foreground">Manage student enrollments and records.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">Export Report</Button>
        </div>

        <div className="flex items-center py-4 bg-white p-4 rounded-lg border shadow-sm">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or ID..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const course = COURSES.find(c => c.id === student.courseId);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-mono">{student.studentId}</TableCell>
                      <TableCell className="font-medium">{student.lastName}, {student.firstName}</TableCell>
                      <TableCell>{course?.code}</TableCell>
                      <TableCell>{student.yearLevel}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            student.status === "enrolled" ? "default" : 
                            student.status === "pending" ? "outline" : 
                            "destructive"
                          }
                          className={
                            student.status === "enrolled" ? "bg-green-600 hover:bg-green-700" :
                            student.status === "pending" ? "text-yellow-600 border-yellow-600 bg-yellow-50" :
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            {student.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-green-600" onClick={() => handleAction("Approved", student.firstName)}>
                                  <Check className="mr-2 h-4 w-4" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleAction("Rejected", student.firstName)}>
                                  <X className="mr-2 h-4 w-4" /> Reject
                                </DropdownMenuItem>
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
                  <TableCell colSpan={6} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
