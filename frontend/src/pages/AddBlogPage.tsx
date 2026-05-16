import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/field";

type City = {
    cityId: number;
    name: string;
};

type Category = {
    categoryId: number;
    name: string;
};

type CategoryDropdownProps = {
    categories: Category[];
    selectedCategoryIds: string[];
    setSelectedCategoryIds: React.Dispatch<React.SetStateAction<string[]>>;
};

function CategoryDropdown({
                              categories,
                              selectedCategoryIds,
                              setSelectedCategoryIds,
                          }: CategoryDropdownProps) {
    const [open, setOpen] = useState(false);

    function toggleCategory(id: string) {
        if (selectedCategoryIds.includes(id)) {
            setSelectedCategoryIds(
                selectedCategoryIds.filter((categoryId) => categoryId !== id)
            );
        } else {
            setSelectedCategoryIds([...selectedCategoryIds, id]);
        }
    }

    return (
        <div className="checkbox-dropdown">
            <button
                type="button"
                className="add-blog-input checkbox-dropdown__button"
                onClick={() => setOpen(!open)}
            >
                {selectedCategoryIds.length === 0
                    ? "Select categories"
                    : `${selectedCategoryIds.length} selected`}
            </button>

            {open && (
                <div className="checkbox-dropdown__menu">
                    {categories.map((category) => (
                        <label
                            key={category.categoryId}
                            className="checkbox-dropdown__option"
                        >
                            <input
                                type="checkbox"
                                checked={selectedCategoryIds.includes(
                                    String(category.categoryId)
                                )}
                                onChange={() =>
                                    toggleCategory(String(category.categoryId))
                                }
                            />
                            <span>{category.name}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

function AddBlogPage() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [cityId, setCityId] = useState("");
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [series, setSeries] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const [cities, setCities] = useState<City[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [seriesOptions, setSeriesOptions] = useState<string[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/blogs/cities`)
            .then((res) => res.json())
            .then(setCities);

        fetch(`${import.meta.env.VITE_API_URL}/blogs/categories`)
            .then((res) => res.json())
            .then(setCategories);

        const userId = localStorage.getItem("userId");

        if (userId) {
            fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/series`)
                .then((res) => res.json())
                .then(setSeriesOptions)
                .catch(() => setSeriesOptions([]));
        }
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (
            !title.trim() ||
            !description.trim() ||
            !cityId ||
            categoryIds.length === 0 ||
            !image
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        if (!["image/png", "image/jpeg", "image/gif"].includes(image.type)) {
            setError("Image must be a PNG, JPEG, or GIF.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("You must be logged in to create a blog.");
            return;
        }

        const body = {
            title: title.trim(),
            description: description.trim(),
            cityId: Number(cityId),
            categoryIds: categoryIds.map(Number),
            series: series.trim() === "" ? null : series.trim(),
        };

        const blogResponse = await fetch(`${import.meta.env.VITE_API_URL}/blogs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Authorization": token,
            },
            body: JSON.stringify(body),
        });

        if (!blogResponse.ok) {
            setError(blogResponse.statusText || "Failed to create blog.");
            return;
        }

        const blog = await blogResponse.json();

        const imageResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/blogs/${blog.blogId}/image`,
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
            setError("Blog created, but image upload failed.");
            return;
        }

        navigate("/");
    }

    return (
        <div className="add-blog-page">
            <div className="add-blog-card">
                <div className="add-blog-header">
                    <h1>Create blog</h1>
                    <p>Share a new travel story.</p>
                </div>

                <form onSubmit={handleSubmit} className="add-blog-form">
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Title *</FieldLabel>
                            <FieldContent>
                                <input
                                    className="add-blog-input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter blog title"
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>Description *</FieldLabel>
                            <FieldContent>
                                <textarea
                                    className="add-blog-input"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Write your blog description"
                                    rows={6}
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>City *</FieldLabel>
                            <FieldContent>
                                <select
                                    className="add-blog-input"
                                    value={cityId}
                                    onChange={(e) => setCityId(e.target.value)}
                                >
                                    <option value="">Select city</option>
                                    {cities.map((city) => (
                                        <option key={city.cityId} value={city.cityId}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>Categories *</FieldLabel>
                            <FieldContent>
                                <CategoryDropdown
                                    categories={categories}
                                    selectedCategoryIds={categoryIds}
                                    setSelectedCategoryIds={setCategoryIds}
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>Image *</FieldLabel>
                            <FieldContent>
                                <input
                                    className="add-blog-input"
                                    type="file"
                                    accept="image/png,image/jpeg,image/gif"
                                    onChange={(e) =>
                                        setImage(e.target.files?.[0] || null)
                                    }
                                />
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel>Series</FieldLabel>
                            <FieldContent>
                                <input
                                    className="add-blog-input"
                                    list="series-options"
                                    value={series}
                                    onChange={(e) => setSeries(e.target.value)}
                                    placeholder="Choose existing series or type a new one"
                                />

                                <datalist id="series-options">
                                    {seriesOptions.map((seriesName) => (
                                        <option key={seriesName} value={seriesName} />
                                    ))}
                                </datalist>
                            </FieldContent>
                        </Field>

                        {error && <FieldError>{error}</FieldError>}
                    </FieldGroup>

                    <div className="add-blog-actions">
                        <button
                            type="button"
                            className="add-blog-secondary"
                            onClick={() => navigate("/")}
                        >
                            Cancel
                        </button>

                        <button type="submit" className="add-blog-primary">
                            Create blog
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddBlogPage;