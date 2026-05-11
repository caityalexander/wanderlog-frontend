import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";

type Blog = {
    blogId: number;
    title: string;
    creatorFirstName: string;
    creatorLastName: string;
    creatorId: number;
    creationDate: string;
    cityId: number;
    categoryIds: number[];
    numReactions: number;
};

function BlogPage() {
    const [cities, setCities] = useState<Record<number, string>>({});
    const [categories, setCategories] = useState<Record<number, string>>({});
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState("CREATED_DESC");

    useEffect(() => {
        fetchBlogs();

        fetch(`${import.meta.env.VITE_API_URL}/blogs/cities`)
            .then((res) => res.json())
            .then((data) => {
                const cityMap: Record<number, string> = {};
                data.forEach((city: any) => {
                    cityMap[city.cityId] = city.name;
                });
                setCities(cityMap);
            });

        fetch(`${import.meta.env.VITE_API_URL}/blogs/categories`)
            .then((res) => res.json())
            .then((data) => {
                const categoryMap: Record<number, string> = {};
                data.forEach((category: any) => {
                    categoryMap[category.categoryId] = category.name;
                });
                setCategories(categoryMap);
            });
    }, []);

    function getSelectedValues(options: HTMLCollectionOf<HTMLOptionElement>) {
        return Array.from(options)
            .filter((option) => option.selected)
            .map((option) => option.value);
    }

    function fetchBlogs() {
        setError("");

        const params = new URLSearchParams();

        if (search.trim() !== "") {
            params.append("q", search.trim());
        }

        selectedCityIds.forEach((cityId) => {
            params.append("cityIds", cityId);
        });

        selectedCategoryIds.forEach((categoryId) => {
            params.append("categoryIds", categoryId);
        });

        if (sortBy !== "") {
            params.append("sortBy", sortBy);
        }

        fetch(`${import.meta.env.VITE_API_URL}/blogs?${params.toString()}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch blogs");
                }
                return res.json();
            })
            .then((data) => {
                setBlogs(data.blogs);
            })
            .catch((err) => {
                setError(err.message);
            });
    }

    function clearAll() {
        setSearch("");
        setSelectedCityIds([]);
        setSelectedCategoryIds([]);
        setSortBy("CREATED_DESC");

        fetch(`${import.meta.env.VITE_API_URL}/blogs?sortBy=CREATED_DESC`)
            .then((res) => res.json())
            .then((data) => {
                setBlogs(data.blogs);
            })
            .catch((err) => {
                setError(err.message);
            });
    }

    return (
        <div className="blog-page">
            <div className="blog-page__header">
                <div>
                    <h1 className="blog-page__title">Travel Blogs</h1>
                    <p className="blog-page__subtitle">
                        Find stories by city, category, or keyword.
                    </p>
                </div>
            </div>

            {error && <p className="blog-page__error">{error}</p>}

            <div className="blog-page__layout">
                <aside className="blog-page__sidebar">
                    <h2 className="blog-page__sidebar-title">Filter blogs</h2>

                    <label className="blog-page__label">Search</label>
                    <input
                        type="text"
                        placeholder="Search by title or description"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchBlogs()}
                        className="blog-page__input"
                    />

                    <label className="blog-page__label">Cities</label>
                    <select
                        multiple
                        value={selectedCityIds}
                        onChange={(e) =>
                            setSelectedCityIds(getSelectedValues(e.target.selectedOptions))
                        }
                        className="blog-page__multi-select"
                    >
                        {Object.entries(cities).map(([id, name]) => (
                            <option key={id} value={id}>
                                {name}
                            </option>
                        ))}
                    </select>

                    <label className="blog-page__label">Categories</label>
                    <select
                        multiple
                        value={selectedCategoryIds}
                        onChange={(e) =>
                            setSelectedCategoryIds(getSelectedValues(e.target.selectedOptions))
                        }
                        className="blog-page__multi-select"
                    >
                        {Object.entries(categories).map(([id, name]) => (
                            <option key={id} value={id}>
                                {name}
                            </option>
                        ))}
                    </select>

                    <label className="blog-page__label">Sort by</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="blog-page__select"
                    >
                        <option value="CREATED_DESC">Newest first</option>
                        <option value="CREATED_ASC">Oldest first</option>
                        <option value="ALPHABETICAL_ASC">Title A-Z</option>
                        <option value="ALPHABETICAL_DESC">Title Z-A</option>
                        <option value="REACTIONS_DESC">Most reactions</option>
                        <option value="REACTIONS_ASC">Least reactions</option>
                    </select>

                    <button onClick={fetchBlogs} className="blog-page__apply-btn">
                        Apply filters
                    </button>

                    <button onClick={clearAll} className="blog-page__clear-btn">
                        Clear filters
                    </button>

                    <p className="blog-page__hint">
                        Hold Ctrl or Cmd to select multiple options.
                    </p>
                </aside>

                <main className="blog-page__main">
                    <div className="blog-page__results-header">
                        <h2>{blogs.length} blogs found</h2>
                    </div>

                    {blogs.length === 0 ? (
                        <p className="blog-page__empty">No blogs found.</p>
                    ) : (
                        <div className="blog-page__grid">
                            {blogs.map((blog) => (
                                <BlogCard
                                    key={blog.blogId}
                                    blogId={blog.blogId}
                                    title={blog.title}
                                    creatorFirstName={blog.creatorFirstName}
                                    creatorLastName={blog.creatorLastName}
                                    creatorId={blog.creatorId}
                                    creationDate={blog.creationDate}
                                    city={cities[blog.cityId]}
                                    categories={blog.categoryIds.map((id) => categories[id])}
                                    numReactions={blog.numReactions}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default BlogPage;