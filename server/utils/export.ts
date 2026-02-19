import { Student, Course } from "@shared/schema";

export interface ExportOptions {
    students: Student[];
    courses: Course[];
    format: 'csv' | 'excel';
    filters?: {
        yearLevel?: number;
        section?: string;
        status?: string;
        courseId?: number;
    };
}

export function generateCSV(students: Student[], courses: Course[]): string {
    const headers = [
        'Student ID',
        'Last Name',
        'First Name',
        'Middle Initial',
        'Email',
        'Program',
        'Year Level',
        'Section',
        'Status',
        'Contact Number',
        'Sex',
        'Date of Birth',
        'Address',
        'Father Name',
        'Mother Name',
        'Emergency Contact'
    ];

    const rows = students.map(student => {
        const course = courses.find(c => c.id === student.courseId);
        return [
            escapeCSV(student.studentId),
            escapeCSV(student.lastName),
            escapeCSV(student.firstName),
            escapeCSV(student.middleInitial || ''),
            escapeCSV(student.email),
            escapeCSV(course?.code || 'N/A'),
            student.yearLevel.toString(),
            escapeCSV(student.section || 'Unassigned'),
            escapeCSV(student.status),
            escapeCSV(student.contactNumber || ''),
            escapeCSV(student.sex || ''),
            escapeCSV(student.dob || ''),
            escapeCSV(student.permanentAddress || ''),
            escapeCSV(student.fatherName || ''),
            escapeCSV(student.motherName || ''),
            escapeCSV(student.emergencyContactPerson || '')
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
}

export function escapeCSV(value: string): string {
    // Convert to string and handle null/undefined
    const stringValue = String(value || '');

    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
}
