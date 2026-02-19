
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Calendar, Clock, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StudentSchedule() {
    const { user } = useAuth();
    const student = (user as any)?.student;

    const { data: schedule, isLoading } = useQuery<any[]>({
        queryKey: [`/api/student/${student?.id}/schedule`],
        enabled: !!student,
    });

    if (!student) return null;

    return (
        <StudentLayout student={student}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif">Class Schedule</h1>
                    <p className="text-muted-foreground">View your enrolled subjects and their schedules for this semester.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            1st Semester, A.Y. 2025-2026
                        </CardTitle>
                        <CardDescription>
                            Your official class schedule.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : !schedule || schedule.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No enrolled subjects found for this semester.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Subject Description</TableHead>
                                        <TableHead>Units</TableHead>
                                        <TableHead>Schedule</TableHead>
                                        <TableHead>Instructor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedule.map((subject) => (
                                        <TableRow key={subject.id}>
                                            <TableCell className="font-medium text-primary">{subject.code}</TableCell>
                                            <TableCell>{subject.name}</TableCell>
                                            <TableCell>{subject.units}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    <span className="font-medium">{subject.schedule}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    <span>{subject.instructor}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </StudentLayout>
    );
}
