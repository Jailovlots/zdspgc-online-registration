
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, GraduationCap } from "lucide-react";
import { Link } from "wouter";


const loginSchema = z.object({
    username: z.string().min(1, "Username/Email is required"),
    password: z.string().min(1, "Password is required"),
});

export default function StudentLogin() {
    const { loginMutation, user } = useAuth();
    const [, setLocation] = useLocation();

    // Redirect if already logged in
    if (user) {
        if (user.role === "student") {
            setLocation("/student/dashboard");
            return null;
        } else {
            // If admin tries to access student login, redirect to admin dashboard or logout
            setLocation("/admin/dashboard");
            return null;
        }
    }

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2">
            {/* Branding Section */}
            <div className="hidden md:flex flex-col justify-center items-center bg-slate-900 text-white p-12">
                <div className="max-w-md text-center space-y-6">
                    <img
                        src="/assets/images/school-logo.jpg"
                        alt="ZDSPGC Logo"
                        className="h-32 w-32 mx-auto rounded-full bg-white p-2"
                    />
                    <h1 className="text-4xl font-bold font-serif">Zamboanga Del Sur Provincial Government College</h1>
                    <p className="text-xl text-slate-300">Student Portal Access</p>
                    <div className="pt-8 text-sm text-slate-400">
                        <p>Access your grades, schedule, and enrollment status from anywhere.</p>
                    </div>
                </div>
            </div>

            {/* Login Form Section */}
            <div className="flex items-center justify-center p-6 bg-slate-50">
                <Card className="w-full max-w-md shadow-xl border-slate-200">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <span className="font-bold text-lg text-primary">Student Portal</span>
                        </div>
                        <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
                        <CardDescription>
                            Enter his/her credentials to access his/her student account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email or Student ID</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="student@test.com" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full bg-slate-900 hover:bg-slate-800"
                                    disabled={loginMutation.isPending}
                                >
                                    {loginMutation.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground border-t pt-6 bg-slate-50/50 rounded-b-lg">
                        <p>
                            New student?{" "}
                            <Link href="/student/registration" className="font-bold text-primary hover:underline">
                                Register here
                            </Link>
                        </p>


                        <div className="flex justify-between w-full text-xs">
                            <Link href="/" className="flex items-center hover:text-primary">
                                <ArrowLeft className="mr-1 h-3 w-3" /> Back to Home
                            </Link>
                            <Link href="/admin/login" className="hover:text-primary">
                                Admin Access
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
