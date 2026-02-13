import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AdmissionFormProps {
    formData: any;
    onChange: (field: string, value: any) => void;
    pledgeAccepted: boolean;
    onPledgeToggle: (checked: boolean) => void;
    readOnly?: boolean;
}

export function AdmissionForm({ formData, onChange, pledgeAccepted, onPledgeToggle, readOnly = false }: AdmissionFormProps) {
    return (
        <div className="max-w-[850px] mx-auto bg-white shadow-2xl p-8 md:p-12 border border-slate-200 min-h-[1100px] font-sans">
            {/* Header */}
            <div className="text-center mb-10 border-b-2 border-slate-900 pb-6">
                <div className="flex justify-center mb-4">
                    <img src="/assets/images/school-logo.jpg" alt="ZDSPGC Logo" className="h-24 w-24 object-contain" />
                </div>
                <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">Zamboanga Del Sur Provincial Government College</h1>
                <p className="text-sm font-medium text-slate-700 mt-1">Dimataling Campus, Zamboanga Del Sur</p>
                <h2 className="text-2xl font-black mt-6 bg-slate-900 text-white py-2 px-4 inline-block">Student Admission Record</h2>

                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-md uppercase">
                    IMPORTANT: PLEASE FILL OUT ALL REQUIRED INFORMATION. DO NOT LEAVE ANY ITEM BLANK.
                    INDICATE "N/A" IF THE ITEM IS NOT APPLICABLE TO YOU.
                </div>
            </div>

            <div className="space-y-8 text-black">
                {/* I. Personal Information */}
                <section>
                    <h3 className="text-lg font-bold border-l-4 border-slate-900 pl-3 mb-4 uppercase bg-slate-50 py-1">I. Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Last Name</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.lastName || ""} readOnly />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">First Name</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.firstName || ""} readOnly />
                        </div>
                        <div className="md:col-span-1 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">M.I.</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.middleInitial || ""} onChange={(e) => onChange("middleInitial", e.target.value)} readOnly={readOnly} />
                        </div>
                        <div className="md:col-span-1 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Suffix</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.suffix || ""} onChange={(e) => onChange("suffix", e.target.value)} readOnly={readOnly} />
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Date of Birth</Label>
                            <Input type="date" className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.dob || ""} onChange={(e) => onChange("dob", e.target.value)} readOnly={readOnly} />
                        </div>
                        <div className="md:col-span-1 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Sex</Label>
                            <Select value={formData.sex} onValueChange={(v) => onChange("sex", v)} disabled={readOnly}>
                                <SelectTrigger className="border-0 border-b border-slate-300 rounded-none px-0 h-8 flex items-center focus:ring-0 shadow-none bg-transparent">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-1 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Civil Status</Label>
                            <Select value={formData.civilStatus} onValueChange={(v) => onChange("civilStatus", v)} disabled={readOnly}>
                                <SelectTrigger className="border-0 border-b border-slate-300 rounded-none px-0 h-8 flex items-center focus:ring-0 shadow-none bg-transparent">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Single">Single</SelectItem>
                                    <SelectItem value="Married">Married</SelectItem>
                                    <SelectItem value="Widowed">Widowed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Place of Birth</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.placeOfBirth || ""} onChange={(e) => onChange("placeOfBirth", e.target.value)} />
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Citizenship</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.citizenship || ""} onChange={(e) => onChange("citizenship", e.target.value)} />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Religion</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.religion || ""} onChange={(e) => onChange("religion", e.target.value)} />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Postal Code</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.postalCode || ""} onChange={(e) => onChange("postalCode", e.target.value)} />
                        </div>

                        <div className="md:col-span-4 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Contact Number</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.contactNumber || ""} onChange={(e) => onChange("contactNumber", e.target.value)} readOnly={readOnly} />
                        </div>

                        <div className="md:col-span-6 space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Permanent Address</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.permanentAddress || ""} onChange={(e) => onChange("permanentAddress", e.target.value)} readOnly={readOnly} />
                        </div>
                    </div>
                </section>

                {/* II. Family Background */}
                <section>
                    <h3 className="text-lg font-bold border-l-4 border-slate-900 pl-3 mb-4 uppercase bg-slate-50 py-1">II. Family Background</h3>
                    <div className="space-y-6">
                        {/* Father */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-3 p-3 border border-slate-100 rounded-md">
                            <div className="md:col-span-4 font-bold text-xs uppercase text-slate-400">Father's Information</div>
                            <div className="md:col-span-2 space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Name</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.fatherName || ""} onChange={(e) => onChange("fatherName", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Occupation</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.fatherOccupation || ""} onChange={(e) => onChange("fatherOccupation", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Contact No.</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.fatherContact || ""} onChange={(e) => onChange("fatherContact", e.target.value)} />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Company/Employer</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.fatherCompany || ""} onChange={(e) => onChange("fatherCompany", e.target.value)} />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Home Address</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.fatherHomeAddress || ""} onChange={(e) => onChange("fatherHomeAddress", e.target.value)} />
                            </div>
                        </div>

                        {/* Mother */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-3 p-3 border border-slate-100 rounded-md">
                            <div className="md:col-span-4 font-bold text-xs uppercase text-slate-400">Mother's Information</div>
                            <div className="md:col-span-2 space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Name</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.motherName || ""} onChange={(e) => onChange("motherName", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Occupation</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.motherOccupation || ""} onChange={(e) => onChange("motherOccupation", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Contact No.</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.motherContact || ""} onChange={(e) => onChange("motherContact", e.target.value)} />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Company/Employer</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.motherCompany || ""} onChange={(e) => onChange("motherCompany", e.target.value)} />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Home Address</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.motherHomeAddress || ""} onChange={(e) => onChange("motherHomeAddress", e.target.value)} />
                            </div>
                        </div>

                        {/* Guardian */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-3 p-3 border border-slate-100 rounded-md">
                            <div className="md:col-span-3 font-bold text-xs uppercase text-slate-400">Guardian's Information</div>
                            <div className="font-bold text-xs uppercase text-slate-400">Relationship</div>
                            <div className="md:col-span-3 space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Name</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.guardianName || ""} onChange={(e) => onChange("guardianName", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" placeholder="e.g. Aunt" value={formData.guardianRelationship || ""} onChange={(e) => onChange("guardianRelationship", e.target.value)} />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Occupation</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.guardianOccupation || ""} onChange={(e) => onChange("guardianOccupation", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Contact No.</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.guardianContact || ""} onChange={(e) => onChange("guardianContact", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Company</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.guardianCompany || ""} onChange={(e) => onChange("guardianCompany", e.target.value)} />
                            </div>
                            <div className="md:col-span-4 space-y-1">
                                <Label className="text-[10px] uppercase text-slate-500">Home Address</Label>
                                <Input className="border-0 border-b border-slate-200 rounded-none h-7 px-0 focus-visible:ring-0 text-sm bg-transparent shadow-none" value={formData.guardianHomeAddress || ""} onChange={(e) => onChange("guardianHomeAddress", e.target.value)} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* III. Emergency Contact */}
                <section>
                    <h3 className="text-lg font-bold border-l-4 border-slate-900 pl-3 mb-4 uppercase bg-slate-50 py-1">III. Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border border-slate-100 rounded-md">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Contact Person</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.emergencyContactPerson || ""} onChange={(e) => onChange("emergencyContactPerson", e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Home Address</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.emergencyContactHome || ""} onChange={(e) => onChange("emergencyContactHome", e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Contact Number</Label>
                            <Input className="border-0 border-b border-slate-300 rounded-none px-0 focus-visible:ring-0 shadow-none h-8 bg-transparent" value={formData.emergencyContactNumber || ""} onChange={(e) => onChange("emergencyContactNumber", e.target.value)} />
                        </div>
                    </div>
                </section>

                {/* IV. Educational Background */}
                <section>
                    <h3 className="text-lg font-bold border-l-4 border-slate-900 pl-3 mb-4 uppercase bg-slate-50 py-1">IV. Educational Background</h3>
                    <div className="border rounded-md overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 border-b">
                                <tr>
                                    <th className="text-left p-3 font-bold text-[10px] uppercase text-slate-600">Level</th>
                                    <th className="text-left p-3 font-bold text-[10px] uppercase text-slate-600">Name of School</th>
                                    <th className="text-left p-3 font-bold text-[10px] uppercase text-slate-600">Address of School</th>
                                    <th className="text-center p-3 font-bold text-[10px] uppercase text-slate-600 w-24">Year Grad</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-black">
                                <tr>
                                    <td className="p-3 font-bold text-xs bg-slate-50/50">Elementary</td>
                                    <td className="p-2"><Input className="h-8 border-none focus-visible:ring-0 text-xs px-0 bg-transparent shadow-none" value={formData.elementarySchool || ""} onChange={(e) => onChange("elementarySchool", e.target.value)} /></td>
                                    <td className="p-2"><Input className="h-8 border-none focus-visible:ring-0 text-xs px-0 bg-transparent shadow-none" value={formData.elementaryAddress || ""} onChange={(e) => onChange("elementaryAddress", e.target.value)} /></td>
                                    <td className="p-2"><Input type="number" className="h-8 border-none focus-visible:ring-0 text-xs px-0 text-center bg-transparent shadow-none" value={formData.elementaryYearGraduated || ""} onChange={(e) => onChange("elementaryYearGraduated", parseInt(e.target.value) || 0)} /></td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-bold text-xs bg-slate-50/50">Junior High</td>
                                    <td className="p-2"><Input className="h-8 border-none focus-visible:ring-0 text-xs px-0 bg-transparent shadow-none" value={formData.juniorHighSchool || ""} onChange={(e) => onChange("juniorHighSchool", e.target.value)} /></td>
                                    <td className="p-2"><Input className="h-8 border-none focus-visible:ring-0 text-xs px-0 bg-transparent shadow-none" value={formData.juniorHighAddress || ""} onChange={(e) => onChange("juniorHighAddress", e.target.value)} /></td>
                                    <td className="p-2"><Input type="number" className="h-8 border-none focus-visible:ring-0 text-xs px-0 text-center bg-transparent shadow-none" value={formData.juniorHighYearGraduated || ""} onChange={(e) => onChange("juniorHighYearGraduated", parseInt(e.target.value) || 0)} /></td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-bold text-xs bg-slate-50/50">Senior High</td>
                                    <td className="p-2"><Input className="h-8 border-none focus-visible:ring-0 text-xs px-0 bg-transparent shadow-none" value={formData.seniorHighSchool || ""} onChange={(e) => onChange("seniorHighSchool", e.target.value)} /></td>
                                    <td className="p-2"><Input className="h-8 border-none focus-visible:ring-0 text-xs px-0 bg-transparent shadow-none" value={formData.seniorHighAddress || ""} onChange={(e) => onChange("seniorHighAddress", e.target.value)} /></td>
                                    <td className="p-2"><Input type="number" className="h-8 border-none focus-visible:ring-0 text-xs px-0 text-center bg-transparent shadow-none" value={formData.seniorHighYearGraduated || ""} onChange={(e) => onChange("seniorHighYearGraduated", parseInt(e.target.value) || 0)} /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* V. Student Pledge */}
                <section className="bg-slate-900 text-white p-8 rounded-lg mt-12">
                    <h3 className="text-xl font-black mb-6 border-b border-slate-700 pb-2 uppercase tracking-tighter">Student Pledge</h3>
                    <div className="flex items-start gap-4">
                        <Checkbox id="pledge" checked={pledgeAccepted} onCheckedChange={(v) => onPledgeToggle(!!v)} className="mt-1.5 border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-900" />
                        <div className="space-y-4">
                            <blockquote className="text-sm italic leading-relaxed text-slate-300 border-l-2 border-slate-600 pl-4">
                                "In consideration of my admission to the ZAMBOANGA DEL SUR PROVINCIAL GOVERNMENT COLLEGE (ZDSPGC) and of the privileges I will henceforth enjoy as a student of this institution, I hereby pledge to abide by the rules and regulations laid down by the competent authority of the college in which I am enrolled."
                            </blockquote>
                            <Label htmlFor="pledge" className="text-xs font-bold uppercase tracking-widest text-slate-400 cursor-pointer hover:text-white transition-colors">
                                I Solemnly Pledge to Abide by These Terms
                            </Label>
                        </div>
                    </div>
                </section>

                {/* Footer Info */}
                <div className="pt-12 flex justify-between items-end border-t border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">
                        Form No. -ADM-2025-001<br />
                        Revised: February 2026
                    </div>
                    <div className="text-right">
                        <div className="h-px w-48 bg-slate-400 mb-1"></div>
                        <div className="text-[10px] uppercase font-bold text-slate-500">Signature Over Printed Name of Applicant</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
