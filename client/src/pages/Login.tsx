
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "admin") setLocation("/admin/dashboard");
      else setLocation("/student/dashboard");
    }
  }, [user, setLocation]);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    userType: "student", // 'student' | 'admin'
    username: "",
    password: "",
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Parse query params properly
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const defaultTab = params.get("tab") === "register" ? "register" : "login";

  // Validation functions
  const isRegisterFormValid =
    registerForm.firstName.trim() !== "" &&
    registerForm.lastName.trim() !== "" &&
    registerForm.email.trim() !== "" &&
    registerForm.password.trim() !== "";

  const handleLoginSubmit = () => {
    if (!loginForm.username.trim() || !loginForm.password.trim()) return;
    loginMutation.mutate({ username: loginForm.username, password: loginForm.password });
  };

  const handleRegisterSubmit = () => {
    if (!isRegisterFormValid) return;

    // Auto-generate student ID (mock) and default year level
    const studentData = {
      ...registerForm,
      studentId: `2024-${Math.floor(1000 + Math.random() * 9000)}`,
      yearLevel: 1,
    };

    registerMutation.mutate(studentData);
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <Link href="/">
              <img src="/assets/images/school-logo.jpg" alt="Logo" className="h-20 w-20 mx-auto cursor-pointer hover:scale-105 transition-transform" />
            </Link>
            <h1 className="text-3xl font-bold font-serif text-primary">ZDSPGC Portal</h1>
            <p className="text-muted-foreground">Sign in to your account or enroll online.</p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Registration</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Sign In</CardTitle>
                  <CardDescription>
                    Select your user type to continue.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* User Type Selection */}
                  <div className="flex p-1 bg-slate-100 rounded-lg mb-4">
                    <button
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginForm.userType === 'student' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                      onClick={() => setLoginForm({ ...loginForm, userType: 'student' })}
                    >
                      Student
                    </button>
                    <button
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${loginForm.userType === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                      onClick={() => setLoginForm({ ...loginForm, userType: 'admin' })}
                    >
                      Admin / Faculty
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">
                      {loginForm.userType === 'student' ? 'Email Address' : 'Username'}
                    </Label>
                    <Input
                      id="username"
                      placeholder={loginForm.userType === 'student' ? 'juan@example.com' : 'admin'}
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleLoginSubmit} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loginForm.userType === 'student' ? 'Access Student Portal' : 'Access Admin Dashboard'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>New Student Enrollment</CardTitle>
                  <CardDescription>
                    Create an account to start your admission process.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        placeholder="Juan"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        placeholder="Dela Cruz"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan@example.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Create Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-bold" onClick={handleRegisterSubmit} disabled={isLoading || !isRegisterFormValid}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account & Start Enrollment
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Side - Image/Info */}
      <div className="hidden lg:flex flex-col relative bg-slate-900 text-white p-12 justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src="/assets/images/school-prof.jpg"
            alt="Campus"
            className="w-full h-full object-cover grayscale"
          />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold font-serif mb-2">Welcome to ZDSPGC</h2>
          <p className="text-slate-300">Dimataling Campus</p>
        </div>
        <div className="relative z-10 space-y-6">
          <blockquote className="text-xl font-light italic border-l-4 border-secondary pl-6">
            "Education is the most powerful weapon which you can use to change the world."
          </blockquote>
          <div className="text-sm text-slate-400">
            Nelson Mandela
          </div>
        </div>
      </div>
    </div>
  );
}
