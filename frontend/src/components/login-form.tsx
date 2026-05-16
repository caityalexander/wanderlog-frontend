import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "../components/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "../components/field";
import { Input } from "@/components/input";

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"div">) {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Email and password are required.");
            setPassword("");
            return;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/users/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            console.log("Login status:", response.status);
            console.log("Login message:", await response.clone().text());

            if (!response.ok) {
                if (response.status === 400) {
                    setError(response.statusText || "Email and password are required.");
                } else if (response.status === 401) {
                    setError(response.statusText || "Invalid email/password.");
                } else {
                    setError(response.statusText || "Login failed.");
                }

                setPassword("");
                return;
            }

            const loginData = await response.json();

            localStorage.setItem("token", loginData.token);
            localStorage.setItem("userId", loginData.userId.toString());

            navigate("/");
        } catch {
            setError("Something went wrong while logging in.");
            setPassword("");
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            {error && (
                                <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                                    {error}
                                </p>
                            )}

                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </Field>

                            <Field>
                                <Button type="submit">Login</Button>

                                <FieldDescription className="text-center">
                                    Don&apos;t have an account?{" "}
                                    <Link to="/register">Sign up</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}