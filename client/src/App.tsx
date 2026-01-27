import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

// Student Pages
import StudentDashboard from "@/pages/student/Dashboard";
import StudentRegistration from "@/pages/student/Registration";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import StudentList from "@/pages/admin/StudentList";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/about" component={Home} /> {/* Placeholder */}

      {/* Student Routes */}
      <Route path="/student/dashboard" component={StudentDashboard} />
      <Route path="/student/registration" component={StudentRegistration} />
      <Route path="/student/schedule" component={StudentDashboard} /> {/* Placeholder */}
      <Route path="/student/grades" component={StudentDashboard} /> {/* Placeholder */}
      <Route path="/student/profile" component={StudentDashboard} /> {/* Placeholder */}

      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/students" component={StudentList} />
      <Route path="/admin/enrollments" component={StudentList} /> {/* Placeholder */}
      <Route path="/admin/courses" component={AdminDashboard} /> {/* Placeholder */}

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
