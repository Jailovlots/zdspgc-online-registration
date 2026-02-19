import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";

export default function Settings() {
    const { user, refetchUser } = useAuth();
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [avatar, setAvatar] = useState(user?.avatar || "");

    // Password state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Password visibility state
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile editing state
    const [username, setUsername] = useState(user?.username || "");
    const [isEditingProfile, setIsEditingProfile] = useState(false);

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

    // Profile update mutation
    const profileMutation = useMutation({
        mutationFn: async (data: { username: string }) => {
            const res = await fetch("/api/user/profile", {
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
        onSuccess: async () => {
            setIsEditingProfile(false);
            await refetchUser();
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

    const handleProfileSave = () => {
        if (!username.trim()) {
            toast({
                title: "Error",
                description: "Username cannot be empty",
                variant: "destructive",
            });
            return;
        }
        profileMutation.mutate({ username });
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user?.id) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("field", "avatar");

        setUploading(true);
        try {
            const res = await fetch(`/api/admin/${user.id}/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();

            setAvatar(data.url);

            // Refresh user data to update avatar in header
            await refetchUser();

            Swal.fire({
                title: "Success!",
                text: "Avatar updated successfully",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
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

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account settings</p>
            </div>

            {/* Account Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Your account details</CardDescription>
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

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={!isEditingProfile || profileMutation.isPending}
                                />
                                {!isEditingProfile ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditingProfile(true)}
                                    >
                                        Edit
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleProfileSave}
                                            disabled={profileMutation.isPending}
                                        >
                                            {profileMutation.isPending ? "Saving..." : "Save"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setUsername(user?.username || "");
                                                setIsEditingProfile(false);
                                            }}
                                            disabled={profileMutation.isPending}
                                        >
                                            Cancel
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Input value={user?.role || ""} disabled className="capitalize" />
                        </div>
                    </div>
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
                        <div className="relative">
                            <Input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>New Password</Label>
                        <div className="relative">
                            <Input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
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
