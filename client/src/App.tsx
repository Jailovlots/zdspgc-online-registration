import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Programs from "@/pages/Programs";
import NotFound from "@/pages/not-found";

// Student Pages
import StudentDashboard from "@/pages/student/Dashboard";
import StudentRegistration from "@/pages/student/Registration";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import StudentList from "@/pages/admin/StudentList";

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType<any>, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role if they try to access unauthorized page
    if (user.role === "admin") setLocation("/admin/dashboard");
    else setLocation("/student/dashboard");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/programs" component={Programs} />

      {/* Student Routes */}
      {/* Registration might be public or protected depending on flow, usually public for new students */}
      <Route path="/student/registration" component={StudentRegistration} />

      <Route path="/student/dashboard">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}
      </Route>
      <Route path="/student/schedule">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}
      </Route>
      <Route path="/student/grades">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}
      </Route>
      <Route path="/student/profile">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}
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
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
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
