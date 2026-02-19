import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, MessageSquare, Send, History, Filter, Search } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Student, type Notification } from "@shared/schema";
import { format } from "date-fns";

export default function Notifications() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("email");
    const [selectedStudents, setSelectedStudents] = useState<number[] | "all">("all");

    // Filters
    const [filterYear, setFilterYear] = useState<string>("all");
    const [filterSection, setFilterSection] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const { data: students = [] } = useQuery<Student[]>({
        queryKey: ["/api/students"],
    });

    const { data: history = [] } = useQuery<Notification[]>({
        queryKey: ["/api/admin/notifications/history"],
    });

    const sendEmailMutation = useMutation({
        mutationFn: async (data: { subject: string; message: string; studentIds: number[] | "all" }) => {
            const res = await apiRequest("POST", "/api/admin/notifications/email", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Email sent successfully", variant: "default" });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications/history"] });
        },
        onError: (error: any) => {
            toast({ title: "Failed to send email", description: error.message, variant: "destructive" });
        },
    });

    const sendSMSMutation = useMutation({
        mutationFn: async (data: { message: string; studentIds: number[] | "all" }) => {
            const res = await apiRequest("POST", "/api/admin/notifications/sms", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "SMS sent successfully", variant: "default" });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications/history"] });
        },
        onError: (error: any) => {
            toast({ title: "Failed to send SMS", description: error.message, variant: "destructive" });
        },
    });

    const filteredStudents = students.filter((s) => {
        if (filterYear !== "all" && s.yearLevel.toString() !== filterYear) return false;
        if (filterSection !== "all" && s.section !== filterSection) return false;
        if (filterStatus !== "all" && s.status !== filterStatus) return false;
        return true;
    });

    const handleSendEmail = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const subject = formData.get("subject") as string;
        const message = formData.get("message") as string;

        sendEmailMutation.mutate({
            subject,
            message,
            studentIds: selectedStudents === "all" ? filteredStudents.map(s => s.id) : selectedStudents
        });
    };

    const handleSendSMS = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const message = formData.get("message") as string;

        sendSMSMutation.mutate({
            message,
            studentIds: selectedStudents === "all" ? filteredStudents.map(s => s.id) : selectedStudents
        });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
                        <p className="text-muted-foreground">Communicate with students via Email or SMS</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Send Message</CardTitle>
                                <CardDescription>Choose delivery method and compose your message</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-2 mb-6">
                                        <TabsTrigger value="email" className="gap-2">
                                            <Mail className="h-4 w-4" /> Email
                                        </TabsTrigger>
                                        <TabsTrigger value="sms" className="gap-2">
                                            <MessageSquare className="h-4 w-4" /> SMS
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="email">
                                        <form onSubmit={handleSendEmail} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="subject">Subject</Label>
                                                <Input id="subject" name="subject" placeholder="Application Update" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="message">Message (HTML Supported)</Label>
                                                <Textarea
                                                    id="message"
                                                    name="message"
                                                    rows={8}
                                                    placeholder="Dear student, your application has been processed..."
                                                    required
                                                />
                                            </div>
                                            <Button type="submit" className="w-full gap-2" disabled={sendEmailMutation.isPending}>
                                                <Send className="h-4 w-4" />
                                                {sendEmailMutation.isPending ? "Sending..." : "Send Email Notification"}
                                            </Button>
                                        </form>
                                    </TabsContent>

                                    <TabsContent value="sms">
                                        <form onSubmit={handleSendSMS} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="sms-message">Message</Label>
                                                <Textarea
                                                    id="sms-message"
                                                    name="message"
                                                    rows={4}
                                                    maxLength={160}
                                                    placeholder="Application Update: Your enrollment for Semester 1 is now active."
                                                    required
                                                />
                                                <p className="text-xs text-muted-foreground text-right">Characters: 0/160</p>
                                            </div>
                                            <Button type="submit" className="w-full gap-2" disabled={sendSMSMutation.isPending}>
                                                <Send className="h-4 w-4" />
                                                {sendSMSMutation.isPending ? "Sending..." : "Send SMS Notification"}
                                            </Button>
                                        </form>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" /> History
                                </CardTitle>
                                <CardDescription>Log of recently sent notifications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Recipient(s)</TableHead>
                                            <TableHead>Subject/Message</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Sent At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {history.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                    No notification history found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            history.map((notif) => (
                                                <TableRow key={notif.id}>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {notif.type === "email" ? <Mail className="h-3 w-3 mr-1" /> : <MessageSquare className="h-3 w-3 mr-1" />}
                                                            {notif.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>Multiple Students</TableCell>
                                                    <TableCell className="max-w-[200px] truncate">
                                                        {notif.subject || notif.message}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={notif.status === "sent" ? "default" : "destructive"}>
                                                            {notif.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {notif.sentAt ? format(new Date(notif.sentAt), "MMM d, h:mm a") : "N/A"}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Filter className="h-4 w-4" /> Recipients Filter
                                </CardTitle>
                                <CardDescription>Target specific groups of students</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Year Level</Label>
                                    <Select value={filterYear} onValueChange={setFilterYear}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Years" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Years</SelectItem>
                                            <SelectItem value="1">1st Year</SelectItem>
                                            <SelectItem value="2">2nd Year</SelectItem>
                                            <SelectItem value="3">3rd Year</SelectItem>
                                            <SelectItem value="4">4th Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Section</Label>
                                    <Select value={filterSection} onValueChange={setFilterSection}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Sections" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Sections</SelectItem>
                                            {Array.from(new Set(students.map(s => s.section))).filter(Boolean).map(sec => (
                                                <SelectItem key={sec!} value={sec!}>{sec}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Application Status</Label>
                                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="enrolled">Enrolled</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Target Audience</span>
                                        <Badge variant="secondary">{filteredStudents.length} Students</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        This message will be sent to all filtered students that match the criteria above.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2 justify-between">
                                    <div className="flex items-center gap-2">
                                        <Search className="h-4 w-4" /> Quick Select
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => setSelectedStudents("all")}
                                        >
                                            Select All
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs"
                                            onClick={() => setSelectedStudents([])}
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {filteredStudents.length === 0 ? (
                                        <p className="text-sm text-center py-4 text-muted-foreground">No students match filters</p>
                                    ) : (
                                        filteredStudents.map(student => {
                                            const isSelected = selectedStudents === "all" || selectedStudents.includes(student.id);
                                            return (
                                                <div
                                                    key={student.id}
                                                    onClick={() => {
                                                        if (selectedStudents === "all") {
                                                            // If all selected, switching to specific selection (deselecting this one)
                                                            setSelectedStudents(filteredStudents.filter(s => s.id !== student.id).map(s => s.id));
                                                        } else {
                                                            if (selectedStudents.includes(student.id)) {
                                                                setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                                                            } else {
                                                                setSelectedStudents([...selectedStudents, student.id]);
                                                            }
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2 p-2 rounded text-sm group cursor-pointer transition-colors ${isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-slate-50 border border-transparent"
                                                        }`}
                                                >
                                                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] uppercase ${isSelected ? "bg-primary text-primary-foreground" : "bg-slate-200"
                                                        }`}>
                                                        {student.firstName[0]}{student.lastName[0]}
                                                    </div>
                                                    <span className="flex-1 truncate">{student.firstName} {student.lastName}</span>
                                                    <Badge variant="outline" className="text-[10px] py-0 px-1">{student.status}</Badge>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
