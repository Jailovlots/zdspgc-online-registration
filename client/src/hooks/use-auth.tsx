import { createContext, ReactNode, useContext } from "react";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type InsertUser, type User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    error: Error | null;
    loginMutation: any;
    logoutMutation: any;
    registerMutation: any;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const {
        data: user,
        error,
        isLoading,
    } = useQuery<User | undefined, Error>({
        queryKey: ["/api/user"],
        retry: false,
        staleTime: Infinity
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: Pick<InsertUser, "username" | "password">) => {
            console.log("[Auth] Sending login request to /api/login");
            const res = await apiRequest("POST", "/api/login", credentials);
            console.log("[Auth] Login response status:", res.status);
            return await res.json();
        },
        onSuccess: (user: User) => {
            console.log("[Auth] Login successful:", user.username);
            queryClient.setQueryData(["/api/user"], user);
            
            // Show SweetAlert success
            Swal.fire({
                title: "Login Successful!",
                text: `Welcome back, ${user.username}!`,
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
            
            // Also show toast
            toast({
                title: "Login successful",
                description: `Welcome back, ${user.username}!`,
            });
        },
        onError: (error: Error) => {
            console.error("[Auth] Login failed:", error.message);
            
            // Show SweetAlert error
            Swal.fire({
                title: "Login Failed",
                text: error.message,
                icon: "error",
                confirmButtonText: "Try Again",
                confirmButtonColor: "#0f172a",
            });
            
            toast({
                title: "Login failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (data: any) => {
            console.log("[Auth] Sending registration request to /api/students");
            const res = await apiRequest("POST", "/api/students", data);
            console.log("[Auth] Registration response status:", res.status);
            return await res.json();
        },
        onSuccess: (user: User) => {
            console.log("[Auth] Registration successful:", user.username);
            queryClient.setQueryData(["/api/user"], user);
            
            // Show SweetAlert success
            Swal.fire({
                title: "Registration Successful!",
                text: "Your account has been created successfully.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
            
            toast({
                title: "Registration successful",
                description: "Your account has been created.",
            });
        },
        onError: (error: Error) => {
            console.error("[Auth] Registration failed:", error.message);
            
            // Show SweetAlert error
            Swal.fire({
                title: "Registration Failed",
                text: error.message,
                icon: "error",
                confirmButtonText: "Try Again",
                confirmButtonColor: "#0f172a",
            });
            
            toast({
                title: "Registration failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await apiRequest("POST", "/api/logout");
        },
        onSuccess: () => {
            queryClient.setQueryData(["/api/user"], null);
            // ensure any cached user queries are invalidated (typed overload)
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            
            // Show SweetAlert success
            Swal.fire({
                title: "Logged Out",
                text: "You have been logged out successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });
            
            toast({
                title: "Logged out",
                description: "You have been logged out successfully.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Logout failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return (
        <AuthContext.Provider
            value={{
                user: user ?? null,
                isLoading,
                error,
                loginMutation,
                logoutMutation,
                registerMutation,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
