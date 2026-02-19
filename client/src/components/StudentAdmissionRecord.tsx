import { Student, Course } from "@shared/schema";

interface StudentAdmissionRecordProps {
    student: Student;
    courses: Course[];
}

export function StudentAdmissionRecord({ student, courses }: StudentAdmissionRecordProps) {
    const course = courses.find((c) => c.id === student.courseId);

    const SectionTitle = ({ title }: { title: string }) => (
        <div className="font-bold bg-slate-100 p-1 mb-2 border-l-4 border-black uppercase text-sm">
            {title}
        </div>
    );

    const Field = ({ label, value }: { label: string; value: string | number | undefined | null }) => (
        <div className="mb-1">
            <div className="text-[10px] text-slate-500 uppercase font-bold">{label}</div>
            <div className="border-b border-slate-300 min-h-[20px] text-sm pb-0.5">
                {value || "N/A"}
            </div>
        </div>
    );

    return (
        <div className="p-8 font-sans max-w-[8.5in] mx-auto bg-white text-black">
            {/* Header */}
            <div className="text-center mb-6 border-b-2 border-black pb-4 relative">
                <div className="absolute top-0 right-0 w-24 h-24 border border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {student.avatar ? (
                        <img src={student.avatar} alt="Student" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[10px] text-slate-400">2x2 PHOTO</span>
                    )}
                </div>

                <div className="flex justify-center mb-2">
                    <img src="/assets/images/school-logo.jpg" alt="Logo" className="h-16 w-16 object-contain" />
                </div>
                <h1 className="text-lg font-bold uppercase m-0">Zamboanga Del Sur Provincial Government College</h1>
                <h2 className="text-sm font-normal m-0">Dimataling Campus, Zamboanga Del Sur</h2>
                <div className="mt-2 inline-block bg-black text-white px-3 py-1 text-sm font-bold uppercase">
                    Student Admission Record
                </div>
            </div>

            {/* I. Personal Information */}
            <div className="mb-6">
                <SectionTitle title="I. Personal Information" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <Field label="Name" value={`${student.lastName}, ${student.firstName} ${student.middleInitial || ""} ${student.suffix || ""}`} />
                    <Field label="Student ID" value={student.studentId} />
                    <Field label="Course" value={course?.code || "N/A"} />
                    <Field label="Year / Section" value={`${student.yearLevel} - ${student.section || "N/A"}`} />
                    <Field label="Email" value={student.email} />
                    <Field label="Contact No." value={student.contactNumber} />
                    <Field label="Address" value={student.permanentAddress} />
                    <Field label="Date of Birth" value={student.dob} />
                    <Field label="Sex / Civil Status" value={`${student.sex} / ${student.civilStatus}`} />
                </div>
            </div>

            {/* II. Family Background */}
            <div className="mb-6">
                <SectionTitle title="II. Family Background" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <Field label="Father's Name" value={student.fatherName} />
                    <Field label="Mother's Name" value={student.motherName} />
                    <Field label="Guardian's Name" value={student.guardianName} />
                    <Field label="Emergency Contact" value={`${student.emergencyContactPerson} (${student.emergencyContactNumber})`} />
                </div>
            </div>

            {/* III. Educational Background */}
            <div className="mb-6">
                <SectionTitle title="III. Educational Background" />
                <div className="space-y-2">
                    <Field label="Elementary" value={`${student.elementarySchool} (${student.elementaryYearGraduated || '-'})`} />
                    <Field label="Junior High School" value={`${student.juniorHighSchool} (${student.juniorHighYearGraduated || '-'})`} />
                    <Field label="Senior High School" value={`${student.seniorHighSchool} (${student.seniorHighYearGraduated || '-'})`} />
                </div>
            </div>

            {/* Signature Area */}
            <div className="mt-12 flex justify-end">
                <div className="text-center w-64">
                    <div className="border-b border-black mb-1"></div>
                    <div className="text-[10px] font-bold uppercase">Signature Over Printed Name</div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-[10px] text-slate-400 italic text-center">
                Generated on {new Date().toLocaleDateString()} • ZDSPGC Enrollment System
            </div>
        </div>
    );
}
