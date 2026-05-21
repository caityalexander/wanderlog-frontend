import { useState } from "react";

import { Button } from "../components/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/card";
import { Input } from "../components/input";
import { Label } from "../components/label";

export function SignupForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    function isValidEmail(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidImage(file: File) {
        return ["image/jpeg", "image/png", "image/gif"].includes(file.type);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!firstName.trim()) {
            setError("First name is required.");
            setPassword("");
            return;
        }

        if (!lastName.trim()) {
            setError("Last name is required.");
            setPassword("");
            return;
        }

        if (!email.trim()) {
            setError("Email is required.");
            setPassword("");
            return;
        }

        if (!password) {
            setError("Password is required.");
            return;
        }

        if (!isValidEmail(email)) {
            setError("Email must be valid, for example a@b.c.");
            setPassword("");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            setPassword("");
            return;
        }

        if (profileImage && !isValidImage(profileImage)) {
            setError("Profile image must be a JPEG, PNG, or GIF.");
            setPassword("");
            return;
        }

        try {
            const registerResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/users/register`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        email: email.trim(),
                        password,
                    }),
                }
            );

            if (!registerResponse.ok) {
                if (registerResponse.status === 403) {
                    setError("That email address is already in use.");
                } else if (registerResponse.status === 400) {
                    setError("Please check your details and try again.");
                } else {
                    setError("Registration failed.");
                }

                setPassword("");
                return;
            }

            const loginResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/users/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: email.trim(),
                        password,
                    }),
                }
            );

            if (!loginResponse.ok) {
                setError("Registered successfully, but automatic login failed.");
                setPassword("");
                return;
            }

            const loginData = await loginResponse.json();

            localStorage.setItem("token", loginData.token);
            localStorage.setItem("userId", loginData.userId.toString());

            if (profileImage) {
                const imageResponse = await fetch(
                    `${import.meta.env.VITE_API_URL}/users/${loginData.userId}/image`,
                    {
                        method: "PUT",
                        headers: {
                            "X-Authorization": loginData.token,
                            "Content-Type": profileImage.type,
                        },
                        body: profileImage,
                    }
                );

                if (!imageResponse.ok) {
                    setError("Registered successfully, but profile picture upload failed.");
                    setPassword("");
                    return;
                }
            }

            window.location.href = "/";
        } catch {
            setError("Something went wrong during registration.");
            setPassword("");
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Create an account to start using WanderLog.</CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    noValidate
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4"
                >
                    {error && (
                        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>

                        <div className="flex gap-2">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="profileImage">Profile picture optional</Label>
                        <Input
                            id="profileImage"
                            type="file"
                            accept="image/jpeg,image/png,image/gif"
                            onChange={(e) =>
                                setProfileImage(e.target.files?.[0] ?? null)
                            }
                        />
                    </div>

                    <Button type="submit" className="w-full">
                        Register
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}