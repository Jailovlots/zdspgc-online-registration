import { useRef, useState } from "react";
import { Student, Course, Subject } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Printer, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { printComponent } from "@/lib/print-utils";

interface COEProps {
    student: Student;
    course?: Course;
    isAdmin?: boolean;
}

export function COE({ student, course, isAdmin = false }: COEProps) {
    const [registrarName, setRegistrarName] = useState("MRS. LEONILA A. TENORIO");
    const printRef = useRef<HTMLDivElement>(null);

    const { data: enrollments = [] } = useQuery<any[]>({
        queryKey: [`/api/students/${student.id}/enrollments`],
    });

    const { data: subjects = [] } = useQuery<Subject[]>({
        queryKey: ["/api/subjects"],
    });

    // Filter subjects that the student is enrolled in
    const enrolledSubjects = subjects.filter(s =>
        enrollments.some(e => e.subjectId === s.id)
    );

    const totalUnits = enrolledSubjects.reduce((sum, s) => sum + s.units, 0);

    const formatValue = (val: string | number | undefined | null) => {
        if (val === undefined || val === null || val === "" || val === 0) return "N/A";
        return String(val).toUpperCase();
    };

    const handlePrint = () => {
        printComponent(printRef, `CERTIFICATE OF ENROLLMENT - ${student.lastName}`);
    };

    return (
        <div className="space-y-4 text-black">
            <div className="flex justify-end gap-2 no-print mb-4">
                <Button onClick={handlePrint} variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" /> PRINT COE
                </Button>
            </div>

            <div ref={printRef} className="bg-white p-8 border shadow-sm max-w-[8.5in] mx-auto text-slate-900 uppercase">
                <div className="text-center mb-8 border-b-2 border-slate-900 pb-4">
                    <div className="flex justify-center mb-4">
                        <img src="/assets/images/school-logo.jpg" alt="ZDSPGC Logo" className="h-20 w-20 object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold uppercase text-red-700">ZAMBOANGA DEL SUR PROVINCIAL GOVERNMENT COLLEGE</h1>
                    <p className="text-sm italic">DIMATALING, ZAMBOANGA DEL SUR</p>
                    <h2 className="text-xl font-bold mt-6 underline uppercase">CERTIFICATE OF ENROLLMENT</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="space-y-1">
                        <p><span className="font-bold w-32 inline-block">STUDENT NAME:</span> <span className="font-semibold">{formatValue(student.lastName)}, {formatValue(student.firstName)} {formatValue(student.middleInitial)}</span></p>
                        <p><span className="font-bold w-32 inline-block">STUDENT ID:</span> {formatValue(student.studentId)}</p>
                    </div>
                    <div className="space-y-1">
                        <p><span className="font-bold w-32 inline-block">COURSE:</span> {formatValue(course?.name)} ({formatValue(course?.code)})</p>
                        <p><span className="font-bold w-32 inline-block">YEAR LEVEL:</span> {formatValue(student.yearLevel)}</p>
                        <p><span className="font-bold w-32 inline-block">SEMESTER:</span> 1ST SEMESTER, A.Y. 2025-2026</p>
                    </div>
                </div>

                <h3 className="font-bold mb-2 uppercase text-sm border-b">OFFICIAL SUBJECT LOADING</h3>
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-900 hover:bg-transparent">
                            <TableHead className="text-slate-900 font-bold">SUBJECT CODE</TableHead>
                            <TableHead className="text-slate-900 font-bold">DESCRIPTION</TableHead>
                            <TableHead className="text-slate-900 font-bold text-center">UNITS</TableHead>
                            <TableHead className="text-slate-900 font-bold">SCHEDULE</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {enrolledSubjects.map((subject) => (
                            <TableRow key={subject.id} className="border-slate-300 hover:bg-transparent">
                                <TableCell className="font-mono">{formatValue(subject.code)}</TableCell>
                                <TableCell>{formatValue(subject.name)}</TableCell>
                                <TableCell className="text-center">{formatValue(subject.units)}</TableCell>
                                <TableCell className="text-xs">{formatValue(subject.schedule)}</TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="border-t-2 border-slate-900 font-bold hover:bg-transparent">
                            <TableCell colSpan={2} className="text-right uppercase">TOTAL UNITS</TableCell>
                            <TableCell className="text-center">{formatValue(totalUnits)}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <div className="mt-16 flex justify-between">
                    <div className="text-center">
                        <div className="w-48 border-b border-slate-900 mb-1"></div>
                        <p className="text-xs font-bold uppercase">STUDENT SIGNATURE</p>
                    </div>
                    <div className="text-center">
                        {isAdmin ? (
                            <div className="space-y-1">
                                <Input
                                    value={registrarName}
                                    onChange={(e) => setRegistrarName(e.target.value.toUpperCase())}
                                    className="h-8 text-center font-bold uppercase underline border-slate-900 bg-transparent focus:ring-0"
                                />
                                <p className="text-[10px] text-slate-500 italic lowercase">Editable for official print</p>
                            </div>
                        ) : (
                            <p className="font-bold uppercase underline">{registrarName}</p>
                        )}
                        <p className="text-xs font-bold uppercase">COLLEGE REGISTRAR</p>
                    </div>
                </div>

                <div className="mt-12 text-[10px] text-slate-500 italic">
                    <p>THIS IS A SYSTEM-GENERATED DOCUMENT. ANY ALTERATION WITHOUT THE REGISTRAR'S VALIDATION RENDERS THIS DOCUMENT VOID.</p>
                    <p>DATE GENERATED: {new Date().toLocaleDateString().toUpperCase()}</p>
                </div>
            </div>
        </div>
    );
}
