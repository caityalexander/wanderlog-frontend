import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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

type Blog = {
    blogId: number;
    title: string;
    description: string;
    cityId: number;
    categoryIds: number[];
    series: string | null;
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
                                checked={selectedCategoryIds.includes(String(category.categoryId))}
                                onChange={() => toggleCategory(String(category.categoryId))}
                            />
                            <span>{category.name}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

function EditBlogPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [cityId, setCityId] = useState("");
    const [categoryIds, setCategoryIds] = useState<string[]>([]);
    const [series, setSeries] = useState("");
    const [originalSeries, setOriginalSeries] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);

    const [cities, setCities] = useState<City[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [seriesOptions, setSeriesOptions] = useState<string[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        fetch(`${import.meta.env.VITE_API_URL}/blogs/cities`)
            .then((res) => res.json())
            .then(setCities);

        fetch(`${import.meta.env.VITE_API_URL}/blogs/categories`)
            .then((res) => res.json())
            .then(setCategories);

        fetch(`${import.meta.env.VITE_API_URL}/blogs/${id}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to load blog.");
                }
                return res.json();
            })
            .then((blog: Blog) => {
                setTitle(blog.title);
                setDescription(blog.description);
                setCityId(String(blog.cityId));
                setCategoryIds(blog.categoryIds.map(String));
                setSeries(blog.series ?? "");
                setOriginalSeries(blog.series);
            })
            .catch((err) => setError(err.message));

        const userId = localStorage.getItem("userId");

        if (userId) {
            fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/series`)
                .then((res) => res.json())
                .then(setSeriesOptions)
                .catch(() => setSeriesOptions([]));
        }
    }, [id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!title.trim() || !description.trim() || !cityId || categoryIds.length === 0) {
            setError("Please fill in all required fields.");
            return;
        }

        if (image && !["image/png", "image/jpeg", "image/gif"].includes(image.type)) {
            setError("Image must be a PNG, JPEG, or GIF.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("You must be logged in to edit a blog.");
            return;
        }

        const body: {
            title: string;
            description: string;
            cityId: number;
            categoryIds: number[];
            series?: string | null;
        } = {
            title: title.trim(),
            description: description.trim(),
            cityId: Number(cityId),
            categoryIds: categoryIds.map(Number),
        };

        if (originalSeries === null) {
            body.series = series.trim() === "" ? null : series.trim();
        }

        const blogResponse = await fetch(`${import.meta.env.VITE_API_URL}/blogs/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-Authorization": token,
            },
            body: JSON.stringify(body),
        });

        if (!blogResponse.ok) {
            setError(blogResponse.statusText || "Failed to update blog.");
            return;
        }

        if (image) {
            const imageResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/blogs/${id}/image`,
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
                setError("Blog updated, but image upload failed.");
                return;
            }
        }

        navigate(`/blog?blogId=${id}`);
    }

    return (
        <div className="add-blog-page">
            <div className="add-blog-card">
                <div className="add-blog-header">
                    <h1>Edit blog</h1>
                    <p>Update your blog details. Upload a new image only if you want to replace the old one.</p>
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
                            <FieldLabel>Image</FieldLabel>
                            <FieldContent>
                                {id && (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}/blogs/${id}/image`}
                                        alt="Current blog"
                                        className="edit-blog-preview"
                                    />
                                )}

                                <input
                                    className="add-blog-input"
                                    type="file"
                                    accept="image/png,image/jpeg,image/gif"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
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
                                    disabled={originalSeries !== null}
                                    onChange={(e) => setSeries(e.target.value)}
                                    placeholder={
                                        originalSeries !== null
                                            ? "Series cannot be changed once set"
                                            : "Choose existing series or type a new one"
                                    }
                                />

                                <datalist id="series-options">
                                    {seriesOptions.map((seriesName) => (
                                        <option key={seriesName} value={seriesName} />
                                    ))}
                                </datalist>

                                {originalSeries !== null && (
                                    <p className="add-blog-help-text">
                                        This blog is already part of a series, so the series cannot be changed.
                                    </p>
                                )}
                            </FieldContent>
                        </Field>

                        {error && <FieldError>{error}</FieldError>}
                    </FieldGroup>

                    <div className="add-blog-actions">
                        <button
                            type="button"
                            className="add-blog-secondary"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>

                        <button type="submit" className="add-blog-primary">
                            Update blog
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditBlogPage;