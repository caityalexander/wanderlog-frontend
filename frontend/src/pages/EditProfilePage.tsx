import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Field,
    FieldContent,
    FieldGroup,
    FieldLabel,
} from "@/components/field";

type UserProfile = {
    firstName: string;
    lastName: string;
    email: string;
};

export default function EditProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");

    const [image, setImage] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);

    const [error, setError] = useState("");

    function isValidEmail(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidImage(file: File) {
        return ["image/jpeg", "image/png", "image/gif"].includes(file.type);
    }

    useEffect(() => {
        if (!id) return;

        const loggedInUserId = localStorage.getItem("userId");

        if (loggedInUserId !== id) {
            setError("You cannot edit another user's profile.");
            return;
        }

        const token = localStorage.getItem("token");

        fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
            headers: token ? { "X-Authorization": token } : {},
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to load profile.");
                }
                return res.json();
            })
            .then((user: UserProfile) => {
                setFirstName(user.firstName);
                setLastName(user.lastName);
                setEmail(user.email);
            })
            .catch((err) => setError(err.message));
    }, [id]);

    function clearPasswords() {
        setCurrentPassword("");
        setPassword("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const token = localStorage.getItem("token");
        const loggedInUserId = localStorage.getItem("userId");

        if (!token || loggedInUserId !== id) {
            setError("You cannot edit this profile.");
            clearPasswords();
            return;
        }

        if (!firstName.trim()) {
            setError("First name is required.");
            clearPasswords();
            return;
        }

        if (!lastName.trim()) {
            setError("Last name is required.");
            clearPasswords();
            return;
        }

        if (!email.trim()) {
            setError("Email is required.");
            clearPasswords();
            return;
        }

        if (!isValidEmail(email)) {
            setError("Email must be valid, for example a@b.c.");
            clearPasswords();
            return;
        }

        if (password && password.length < 6) {
            setError("New password must be at least 6 characters long.");
            clearPasswords();
            return;
        }

        if (password && !currentPassword) {
            setError("Current password is required to set a new password.");
            clearPasswords();
            return;
        }

        if (password && currentPassword && password === currentPassword) {
            setError("New password must be different from your current password.");
            clearPasswords();
            return;
        }

        if (image && !isValidImage(image)) {
            setError("Profile picture must be a JPEG, PNG, or GIF.");
            clearPasswords();
            return;
        }

        try {
            const body: Record<string, string> = { firstName, lastName, email };
            if (password) {
                body.currentPassword = currentPassword;
                body.password = password;
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-Authorization": token,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                if (res.status === 400) {
                    setError("Please check your details and try again.");
                } else if (res.status === 401) {
                    setError("Current password is incorrect.");
                } else if (res.status === 403) {
                    setError("That email address is already in use, or your new password is the same as your current password.");
                } else if (res.status === 404) {
                    setError("User not found.");
                } else {
                    setError("Failed to update profile.");
                }
                clearPasswords();
                return;
            }

            if (removeImage) {
                await fetch(`${import.meta.env.VITE_API_URL}/users/${id}/image`, {
                    method: "DELETE",
                    headers: { "X-Authorization": token },
                });
            }

            if (image) {
                const imageRes = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}/image`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": image.type,
                        "X-Authorization": token,
                    },
                    body: image,
                });

                if (!imageRes.ok) {
                    setError("Profile updated, but profile picture upload failed.");
                    clearPasswords();
                    return;
                }
            }

            navigate(`/profile/${id}`);
        } catch {
            setError("Something went wrong. Please try again.");
            clearPasswords();
        }
    }

    return (
        <div className="add-blog-page">
            <div className="add-blog-card">
                <div className="add-blog-header">
                    <h1>Edit profile</h1>
                    <p>Update your account details and profile picture.</p>
                </div>

                <form
                    noValidate
                    onSubmit={handleSubmit}
                    className="add-blog-form"
                >
                    {error && (
                        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <FieldGroup>
                        <Field>
                            <FieldLabel>First name *</FieldLabel>
                            <FieldContent>
                                <input
                                    className="add-blog-input"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>Last name *</FieldLabel>
                            <FieldContent>
                                <input
                                    className="add-blog-input"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>Email *</FieldLabel>
                            <FieldContent>
                                <input
                                    className="add-blog-input"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>Current profile picture</FieldLabel>
                            <FieldContent>
                                {id && (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/users/${id}/image`}
                                        alt="Current profile"
                                        className="edit-blog-preview"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "https://placehold.co/520x293?text=No+Image";
                                        }}
                                    />
                                )}

                                <label className="profile-remove-image">
                                    <input
                                        type="checkbox"
                                        checked={removeImage}
                                        onChange={(e) => setRemoveImage(e.target.checked)}
                                    />
                                    Remove current profile picture
                                </label>
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>New profile picture</FieldLabel>
                            <FieldContent>
                                <input
                                    className="add-blog-input"
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>Current password</FieldLabel>
                            <FieldContent>
                                <input
                                    className="add-blog-input"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Required only if changing password"
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>New password</FieldLabel>
                            <FieldContent>
                                <input
                                    className="add-blog-input"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                />
                            </FieldContent>
                        </Field>
                    </FieldGroup>

                    <div className="add-blog-actions">
                        <button
                            type="button"
                            className="add-blog-secondary"
                            onClick={() => navigate(`/profile/${id}`)}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="add-blog-primary"
                        >
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}