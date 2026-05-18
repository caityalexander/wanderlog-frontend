import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Field,
    FieldContent,
    FieldError,
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
                if (!res.ok) throw new Error("Failed to load profile.");
                return res.json();
            })
            .then((user: UserProfile) => {
                setFirstName(user.firstName);
                setLastName(user.lastName);
                setEmail(user.email);
            })
            .catch((err) => setError(err.message));
    }, [id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const token = localStorage.getItem("token");
        const loggedInUserId = localStorage.getItem("userId");

        if (!token || loggedInUserId !== id) {
            setError("You cannot edit this profile.");
            return;
        }

        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setError("First name, last name, and email are required.");
            return;
        }

        if (password && password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password && !currentPassword) {
            setError("Current password is required to change password.");
            return;
        }

        if (image && !["image/png", "image/jpeg", "image/gif"].includes(image.type)) {
            setError("Profile picture must be a PNG, JPEG, or GIF.");
            return;
        }

        const body: {
            firstName: string;
            lastName: string;
            email: string;
            password?: string;
            currentPassword?: string;
        } = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
        };

        if (password) {
            body.password = password;
            body.currentPassword = currentPassword;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-Authorization": token,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            setError(response.statusText || "Failed to update profile.");
            return;
        }

        if (removeImage) {
            const imageDeleteResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/users/${id}/image`,
                {
                    method: "DELETE",
                    headers: {
                        "X-Authorization": token,
                    },
                }
            );

            if (!imageDeleteResponse.ok) {
                setError(imageDeleteResponse.statusText || "Profile updated, but image removal failed.");
                return;
            }
        }

        if (image) {
            const imageResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/users/${id}/image`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": image.type,
                        "X-Authorization": token,
                    },
                    body: image,
                }
            );

            if (!imageResponse.ok) {
                setError(imageResponse.statusText || "Profile updated, but image upload failed.");
                return;
            }
        }

        navigate(`/profile/${id}`); mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmnmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm
    }

    return (
        <div className="add-blog-page">
            <div className="add-blog-card">
                <div className="add-blog-header">
                    <h1>Edit profile</h1>
                    <p>Update your account details and profile picture.</p>
                </div>

                <form onSubmit={handleSubmit} className="add-blog-form">
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
                                    accept="image/png,image/jpeg,image/gif"
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

                        {error && <FieldError>{error}</FieldError>}
                    </FieldGroup>

                    <div className="add-blog-actions">
                        <button
                            type="button"
                            className="add-blog-secondary"
                            onClick={() => navigate(`/users/${id}`)}
                        >
                            Cancel
                        </button>

                        <button type="submit" className="add-blog-primary">
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}