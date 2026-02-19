import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Home from "@/pages/Home";
import Login from "@/pages/Login"; // Keep for reference if needed, but we use specific login pages
import StudentLogin from "@/pages/student/Login";
import AdminLogin from "@/pages/admin/Login";
import Programs from "@/pages/Programs";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

// Student Pages
import StudentDashboard from "@/pages/student/Dashboard";
import StudentRegistration from "@/pages/student/Registration";
import StudentSettings from "./pages/student/Settings";
import StudentSchedule from "@/pages/student/Schedule";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import StudentList from "@/pages/admin/StudentList";
import CourseManagement from "@/pages/admin/CourseManagement";
import Notifications from "@/pages/admin/Notifications";
import AdminSettings from "@/pages/admin/Settings";
import AdminReports from "@/pages/admin/Reports";

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType<any>, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) return null;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <NotFound />; // Or better handling, but avoiding side-effect in render
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/programs" component={Programs} />

      {/* Legacy Login Redirect */}
      {/* Unified Login Route */}
      <Route path="/login" component={Login} />

      {/* Legacy/Specific Login Routes - redirect to main login */}
      <Route path="/student/login">
        {() => {
          const [, setLocation] = useLocation();
          useEffect(() => setLocation("/login"), [setLocation]);
          return null;
        }}
      </Route>
      <Route path="/admin/login">
        {() => {
          const [, setLocation] = useLocation();
          useEffect(() => setLocation("/login"), [setLocation]);
          return null;
        }}
      </Route>

      {/* Student Routes */}
      <Route path="/student/registration" component={StudentRegistration} />

      <Route path="/student/dashboard">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}
      </Route>
      <Route path="/student/schedule">
        {() => <ProtectedRoute component={StudentSchedule} allowedRoles={["student"]} />}
      </Route>
      <Route path="/student/grades">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}
      </Route>
      <Route path="/student/profile">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}
      </Route>
      <Route path="/student/settings">
        {() => <ProtectedRoute component={StudentSettings} allowedRoles={["student"]} />}
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/students">
        {() => <ProtectedRoute component={StudentList} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/enrollments">
        {() => <ProtectedRoute component={StudentList} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/courses">
        {() => <ProtectedRoute component={CourseManagement} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/notifications">
        {() => <ProtectedRoute component={Notifications} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/settings">
        {() => <ProtectedRoute component={AdminSettings} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/reports">
        {() => <ProtectedRoute component={AdminReports} allowedRoles={["admin"]} />}
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
