import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";

export default function Settings() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);

    // Profile state
    const [contactNumber, setContactNumber] = useState(user?.student?.contactNumber || "");
    const [permanentAddress, setPermanentAddress] = useState(user?.student?.permanentAddress || "");
    const [avatar, setAvatar] = useState(user?.student?.avatar || "");

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Profile update mutation
    const profileMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update profile");
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            Swal.fire({
                title: "Success!",
                text: "Profile updated successfully",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Password update mutation
    const passwordMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/user/password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message);
            }
            return await res.json();
        },
        onSuccess: () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            Swal.fire({
                title: "Success!",
                text: "Password changed successfully",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleProfileUpdate = () => {
        profileMutation.mutate({ contactNumber, permanentAddress });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.student?.id) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("field", "avatar");

        setUploading(true);
        try {
            const res = await fetch(`/api/students/${user.student.id}/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            setAvatar(data.url);
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });

            toast({
                title: "Success",
                description: "Avatar updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload avatar",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handlePasswordChange = () => {
        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }
        if (newPassword.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters",
                variant: "destructive",
            });
            return;
        }
        passwordMutation.mutate({ currentPassword, newPassword });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                            {avatar ? (
                                <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400">
                                    <span className="text-4xl font-bold uppercase">
                                        {user?.username?.[0] || "?"}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="avatar-upload" className="cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" asChild disabled={uploading}>
                                        <span>{uploading ? "Uploading..." : "Change Photo"}</span>
                                    </Button>
                                </div>
                                <Input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Recommended: Square JPG or PNG, max 2MB
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={user?.username || ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Contact Number</Label>
                            <Input
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                placeholder="Enter contact number"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Permanent Address</Label>
                        <Input
                            value={permanentAddress}
                            onChange={(e) => setPermanentAddress(e.target.value.toUpperCase())}
                            placeholder="Enter permanent address"
                        />
                    </div>
                    <Button
                        onClick={handleProfileUpdate}
                        disabled={profileMutation.isPending}
                    >
                        {profileMutation.isPending ? "Updating..." : "Update Profile"}
                    </Button>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Current Password</Label>
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Confirm New Password</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                    </div>
                    <Button
                        onClick={handlePasswordChange}
                        disabled={passwordMutation.isPending}
                    >
                        {passwordMutation.isPending ? "Changing..." : "Change Password"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
