import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, FileCheck, BookOpen, TrendingUp, Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export default function Reports() {
    const { toast } = useToast();
    const [dateRange, setDateRange] = useState("30");

    // Fetch report data
    const { data: enrollmentStats } = useQuery<any>({
        queryKey: ["/api/reports/enrollment-stats"],
    });

    const { data: enrollmentTrends } = useQuery<any[]>({
        queryKey: ["/api/reports/enrollment-trends"],
    });

    const { data: demographics } = useQuery<any>({
        queryKey: ["/api/reports/demographics"],
    });

    const { data: courseAnalytics } = useQuery<any>({
        queryKey: ["/api/reports/course-analytics"],
    });

    // Calculate enrollment rate (mock calculation)
    const enrollmentRate = enrollmentStats
        ? ((enrollmentStats.byStatus?.enrolled || 0) / enrollmentStats.total * 100).toFixed(1)
        : "0";

    // Prepare chart data
    const statusData = enrollmentStats?.byStatus
        ? Object.entries(enrollmentStats.byStatus).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        }))
        : [];

    const yearLevelData = enrollmentStats?.byYearLevel
        ? Object.entries(enrollmentStats.byYearLevel).map(([year, count]) => ({
            year: `Year ${year}`,
            students: count
        }))
        : [];

    const genderData = demographics?.byGender
        ? Object.entries(demographics.byGender).map(([name, value]) => ({
            name,
            value
        }))
        : [];

    const handleExportCSV = async () => {
        try {
            const csvData = [
                ["Report Type", "Value"],
                ["Total Students", enrollmentStats?.total || 0],
                ["Enrollment Rate", `${enrollmentRate}%`],
                ...statusData.map(item => [item.name, item.value]),
            ];

            const csvContent = csvData.map(row => row.join(",")).join("\\n");
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `enrollment-report-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "Export Successful",
                description: "Report exported as CSV",
            });
        } catch (error) {
            toast({
                title: "Export Failed",
                description: "Could not export report",
                variant: "destructive",
            });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 font-serif">Administrative Reports</h1>
                        <p className="text-muted-foreground">Comprehensive analytics and insights</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportCSV}>
                            <FileText className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{enrollmentStats?.total || 0}</div>
                            <p className="text-xs text-muted-foreground">All enrolled students</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{enrollmentStats?.byStatus?.pending || 0}</div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{courseAnalytics?.courses?.length || 0}</div>
                            <p className="text-xs text-muted-foreground">Available programs</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Enrollment Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{enrollmentRate}%</div>
                            <p className="text-xs text-muted-foreground">Of total applicants</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 1 */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Enrollment Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Enrollment Trends</CardTitle>
                            <CardDescription>Student enrollment over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={enrollmentTrends || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} name="Students" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Distribution</CardTitle>
                            <CardDescription>Students by enrollment status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 2 */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Year Level Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Year Level Distribution</CardTitle>
                            <CardDescription>Students by year level</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={yearLevelData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="students" fill="#8884d8" name="Students" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Gender Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gender Distribution</CardTitle>
                            <CardDescription>Student demographics by gender</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#82ca9d"
                                        dataKey="value"
                                    >
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Course Analytics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Course Enrollment Analytics</CardTitle>
                        <CardDescription>Student distribution across programs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={courseAnalytics?.courses || []}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="code" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="enrollmentCount" fill="#00C49F" name="Enrolled Students" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
